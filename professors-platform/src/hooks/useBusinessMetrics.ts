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
  color: string;  // tailwind class for legend dot
  stroke: string; // hex for SVG stroke
  dashArray: string;
  dashOffset: string;
}

/** Un punto del historial mensual de altas de alumnos */
export interface MonthlyRegistration {
  month: string;  // etiqueta corta, ej: "Ago", "Sep"
  count: number;  // alumnos dados de alta en ese mes (sin importar si luego archivados)
}

export interface BusinessMetrics {
  // Cards
  activeStudents: number;
  newThisMonth: number;          // alumnos creados este mes (independiente de archivado)
  growthPercent: number | null;  // vs mes anterior; null = sin dato de comparación
  averageAge: number | null;
  retentionPercent: number | null;
  // Historial de altas: últimos 6 meses (el último elemento = mes actual)
  monthlyRegistrations: MonthlyRegistration[];
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

const CIRCUMFERENCE = 2 * Math.PI * 40; // r=40

// Nombres cortos de meses en español
const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// --- Helpers ---

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function buildGenderDistribution(
  genderCounts: Record<string, number>,
  total: number
): GenderEntry[] {
  const result: GenderEntry[] = [];
  let cumulative = 0;

  const keys = Object.keys(genderCounts).sort((a, b) => {
    const order = ["male", "female", "other"];
    return order.indexOf(a) - order.indexOf(b);
  });

  for (const key of keys) {
    const count = genderCounts[key];
    const percent = total > 0 ? (count / total) * 100 : 0;
    const segmentLength = (percent / 100) * CIRCUMFERENCE;
    const info = GENDER_MAP[key] ?? { label: "Otro / N/E", color: "bg-gray-400", stroke: "#9CA3AF" };
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
      // Traemos TODOS los alumnos (activos + archivados) con archived_at para retención
      const { data: students, error: fetchError } = await supabase
        .from("profiles")
        .select(`
          id,
          created_at,
          student_profiles!inner (
            birth_date,
            gender,
            primary_goal,
            is_archived,
            archived_at
          )
        `)
        .eq("role", "student");

      if (fetchError) throw fetchError;

      const rawData = students ?? [];

      // ── Fecha base ─────────────────────────────────────────────────────────
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // ── Contadores ─────────────────────────────────────────────────────────
      let activeStudentsCount = 0;
      // "Nuevos" se cuenta por created_at, independientemente de si están archivados:
      let newThisMonthTotal = 0; // creados en este mes (todos, archivados o no)
      let newLastMonthTotal = 0; // creados el mes pasado (todos)
      let studentsAtStartOfMonth = 0; // S en fórmula de retención (corregido)

      const ages: number[] = [];
      const goalCounts: Record<string, number> = {};
      const genderCounts: Record<string, number> = {};

      // Historial de los últimos 6 meses: índice 0 = hace 5 meses, índice 5 = mes actual
      const registrationsByMonth: number[] = Array(6).fill(0);

      rawData.forEach((p) => {
        const createdAt = new Date(p.created_at);

        type SpRow = {
          birth_date: string | null;
          gender: string | null;
          primary_goal: string | null;
          is_archived: boolean;
          archived_at: string | null;
        };
        const sp: SpRow | null = Array.isArray(p.student_profiles)
          ? (p.student_profiles[0] as SpRow ?? null)
          : (p.student_profiles as SpRow | null);

        const isArchived = sp?.is_archived ?? false;
        const archivedAt = sp?.archived_at ? new Date(sp.archived_at) : null;

        // ── Alumnos ACTIVOS hoy ──────────────────────────────────────────────
        if (!isArchived) {
          activeStudentsCount++;
          if (sp) {
            if (sp.birth_date) ages.push(getAge(sp.birth_date));
            goalCounts[sp.primary_goal || "unknown"] =
              (goalCounts[sp.primary_goal || "unknown"] ?? 0) + 1;
            genderCounts[sp.gender || "other"] =
              (genderCounts[sp.gender || "other"] ?? 0) + 1;
          }
        }

        // ── "Nuevos" se cuenta por fecha de alta sin importar archivado ──────
        if (createdAt >= thisMonthStart) newThisMonthTotal++;
        if (createdAt >= lastMonthStart && createdAt <= lastMonthEnd) newLastMonthTotal++;

        // ── Historial de los últimos 6 meses ─────────────────────────────────
        // Para cada mes M en el rango [hace 5 meses, mes actual], contamos
        // alumnos cuyo created_at cae dentro de ese mes.
        for (let offset = 0; offset < 6; offset++) {
          const targetYear = now.getFullYear();
          const targetMonth = now.getMonth() - (5 - offset); // offset 0 = hace 5 meses
          const mStart = new Date(targetYear, targetMonth, 1);
          const mEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
          if (createdAt >= mStart && createdAt <= mEnd) {
            registrationsByMonth[offset]++;
          }
        }

        // ── S (Start): alumnos activos al inicio de este mes ─────────────────
        // Un alumno "estaba" al inicio del mes si:
        //   a) Se creó antes del inicio del mes (existía antes)
        //   b) Y no estaba archivado todavía al inicio del mes:
        //      - no está archivado ahora (is_archived=false), O
        //      - fue archivado DESPUÉS del inicio del mes (archived_at >= thisMonthStart)
        //
        // Fórmula de retención: ((E - N) / S) * 100
        //   E = activeStudentsCount (alumnos activos al final, hoy)
        //   N = newThisMonthTotal   (alumnos nuevos este mes)
        //   S = studentsAtStartOfMonth (alumnos al inicio del mes)
        if (createdAt < thisMonthStart) {
          const wasActiveAtStart =
            !isArchived ||
            (archivedAt !== null && archivedAt >= thisMonthStart);
          if (wasActiveAtStart) studentsAtStartOfMonth++;
        }
      });

      // ── Growth Percent ───────────────────────────────────────────────────
      let growthPercent: number | null = null;
      if (newLastMonthTotal > 0) {
        growthPercent = Math.round(
          ((newThisMonthTotal - newLastMonthTotal) / newLastMonthTotal) * 1000
        ) / 10;
      } else if (newThisMonthTotal > 0) {
        growthPercent = null; // Sin dato de comparación
      } else {
        growthPercent = 0;
      }

      // ── Retención ────────────────────────────────────────────────────────
      const E = activeStudentsCount;
      const N = newThisMonthTotal;
      const S = studentsAtStartOfMonth;

      let retentionPercent: number | null = null;
      if (S > 0) {
        retentionPercent = Math.max(0, Math.min(100, Math.round(((E - N) / S) * 100)));
      } else if (E > 0) {
        retentionPercent = 100;
      }

      // ── Promedio de Edad ─────────────────────────────────────────────────
      const averageAge = ages.length > 0
        ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
        : null;

      // ── Goal distribution ────────────────────────────────────────────────
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

      // ── Gender distribution ──────────────────────────────────────────────
      const totalStudentsForGender = activeStudentsCount;
      const genderDistributionResult = buildGenderDistribution(genderCounts, totalStudentsForGender);

      // ── Historial mensual (array de MonthlyRegistration) ─────────────────
      const monthlyRegistrations: MonthlyRegistration[] = registrationsByMonth.map((count, offset) => {
        const monthIndex = ((now.getMonth() - (5 - offset)) % 12 + 12) % 12;
        return { month: MONTH_LABELS[monthIndex], count };
      });

      setMetrics({
        activeStudents: activeStudentsCount,
        newThisMonth: newThisMonthTotal,
        growthPercent,
        averageAge,
        retentionPercent,
        monthlyRegistrations,
        goalDistribution,
        maxGoalCount,
        genderDistribution: genderDistributionResult,
        totalStudentsForGender,
      });
    } catch (err) {
      console.error("[useBusinessMetrics] Error loading metrics:", err);
      setError(err instanceof Error ? err.message : "Error al cargar métricas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { metrics, isLoading, error, reload: load };
}
