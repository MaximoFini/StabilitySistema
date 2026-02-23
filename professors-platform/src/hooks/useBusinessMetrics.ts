import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// --- Types ---

export interface GoalEntry {
  key: string;
  label: string;
  count: number;
  color: string;
}

export interface GenderEntry {
  label: string;
  count: number;
  percent: number;
  color: string; // tailwind color class for legend dot
  stroke: string; // hex for SVG stroke
  dashArray: string;
  dashOffset: string;
}

export interface BusinessMetrics {
  // Cards
  activeStudents: number;
  newThisMonth: number;
  growthPercent: number | null; // null = no data for previous month comparison
  averageAge: number | null; // null = not enough birth_date data
  // Goal distribution
  goalDistribution: GoalEntry[];
  maxGoalCount: number;
  // Gender distribution
  genderDistribution: GenderEntry[];
  totalStudentsForGender: number;
}

// --- Constants ---

const GOAL_MAP: Record<string, { label: string; color: string }> = {
  aesthetic: { label: "Estética / Hipertrofia", color: "#2563EB" },
  sports: { label: "Rendimiento Deportivo", color: "#10B981" },
  health: { label: "Salud General", color: "#06B6D4" },
  rehabilitation: { label: "Rehabilitación", color: "#8B5CF6" },
};

const GENDER_MAP: Record<string, { label: string; color: string; stroke: string }> = {
  male: { label: "Hombres", color: "bg-secondary", stroke: "#3B82F6" },
  female: { label: "Mujeres", color: "bg-primary", stroke: "#60A5FA" },
  other: { label: "Otro / N/E", color: "bg-gray-400", stroke: "#9CA3AF" },
};

const CIRCUMFERENCE = 2 * Math.PI * 40; // r=40 → ~251.33

// --- Helpers ---

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function buildGenderDistribution(
  genderCounts: Record<string, number>,
  total: number
): GenderEntry[] {
  const result: GenderEntry[] = [];
  let cumulative = 0;

  const keys = Object.keys(genderCounts).sort((a, b) => {
    // Sort: male, female, other
    const order = ["male", "female", "other"];
    return order.indexOf(a) - order.indexOf(b);
  });

  for (const key of keys) {
    const count = genderCounts[key];
    const percent = total > 0 ? (count / total) * 100 : 0;
    const segmentLength = (percent / 100) * CIRCUMFERENCE;
    const info = GENDER_MAP[key] ?? {
      label: "Otro / N/E",
      color: "bg-gray-400",
      stroke: "#9CA3AF",
    };
    result.push({
      label: info.label,
      count,
      percent: Math.round(percent),
      color: info.color,
      stroke: info.stroke,
      dashArray: `${segmentLength.toFixed(2)} ${CIRCUMFERENCE.toFixed(2)}`,
      dashOffset: `${-cumulative.toFixed(2)}`,
    });
    cumulative += segmentLength;
  }

  return result;
}

// --- Hook ---

export function useBusinessMetrics() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // INNER JOIN via !inner: only students who completed profile setup are counted
      // Students in profiles(role=student) but missing from student_profiles are excluded
      const { data: students, error: fetchError } = await supabase
        .from("profiles")
        .select(`
          id, 
          created_at, 
          first_name,
          last_name,
          student_profiles!inner (
            birth_date, 
            gender, 
            primary_goal
          )
        `)
        .eq("role", "student");

      if (fetchError) throw fetchError;

      const rawData = students ?? [];

      // ---- Process metrics ----
      const activeStudentsCount = rawData.length;

      // Current date: 2026-02-23
      const now = new Date(); 
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      let newThisMonth = 0;
      let newLastMonth = 0;
      const ages: number[] = [];
      const goalCounts: Record<string, number> = {};
      const genderCounts: Record<string, number> = {};

      rawData.forEach((p) => {
        // Dates
        const createdAt = new Date(p.created_at);
        if (createdAt >= thisMonthStart) newThisMonth++;
        if (createdAt >= lastMonthStart && createdAt <= lastMonthEnd) newLastMonth++;

        // Related data from student_profiles (always present due to !inner)
        type SpRow = { birth_date: string | null; gender: string | null; primary_goal: string | null };
        const sp: SpRow | null = Array.isArray(p.student_profiles)
          ? (p.student_profiles[0] as SpRow ?? null)
          : (p.student_profiles as SpRow | null);

        if (sp) {
          // Age
          if (sp.birth_date) {
            ages.push(getAge(sp.birth_date));
          }
          // Goal
          const goal = sp.primary_goal || "unknown";
          goalCounts[goal] = (goalCounts[goal] ?? 0) + 1;
          // Gender
          const gender = sp.gender || "other";
          genderCounts[gender] = (genderCounts[gender] ?? 0) + 1;
        }
        // Note: with !inner join, all rows will have student_profiles — no else branch needed
      });

      // ---- Growth Percent ----
      let growthPercent: number | null = null;
      if (newLastMonth > 0) {
        growthPercent = Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 1000) / 10;
      } else if (newThisMonth > 0) {
        growthPercent = null;
      } else {
        growthPercent = 0;
      }

      // ---- Average Age ----
      const averageAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;

      // ---- Goal distribution ----
      const goalOrder = ["aesthetic", "sports", "health", "rehabilitation", "unknown"];
      const goalDistribution = goalOrder
        .filter((k) => (goalCounts[k] || 0) > 0)
        .map((k) => ({
          key: k,
          label: k === "unknown" ? "Sin objetivo" : (GOAL_MAP[k]?.label ?? k),
          count: goalCounts[k],
          color: k === "unknown" ? "#94A3B8" : (GOAL_MAP[k]?.color ?? "#64748B"),
        }));

      const maxGoalCount = goalDistribution.reduce((max, g) => Math.max(max, g.count), 1);

      // ---- Gender distribution ----
      const totalStudentsForGender = activeStudentsCount; // All students counted
      const genderDistributionResult = buildGenderDistribution(genderCounts, totalStudentsForGender);

      // ---- Console Logs for Debugging ----
      console.log('--- DEBUGGING METRICS ---');
      console.log('Total alumnos (profiles role=student):', activeStudentsCount);
      console.log('Alumnos por objetivo:', goalDistribution);
      const totalFromGoals = goalDistribution.reduce((sum, g) => sum + g.count, 0);
      console.log('Suma de objetivos:', totalFromGoals);
      
      if (totalFromGoals !== activeStudentsCount) {
        console.error('⚠️ INCONSISTENCIA DETECTADA:');
        console.error(`Total en card: ${activeStudentsCount}`);
        console.error(`Total en gráfico: ${totalFromGoals}`);
        console.error(`Diferencia: ${activeStudentsCount - totalFromGoals} alumno(s) faltante(s)`);
      } else {
        console.log('✅ Coincidencia total en los datos.');
      }

      setMetrics({
        activeStudents: activeStudentsCount,
        newThisMonth,
        growthPercent,
        averageAge,
        goalDistribution,
        maxGoalCount,
        genderDistribution: genderDistributionResult,
        totalStudentsForGender,
      });
    } catch (err) {
      console.error("[useBusinessMetrics] Error loading metrics:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar métricas"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { metrics, isLoading, error, reload: load };
}
