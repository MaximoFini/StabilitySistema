import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────

export interface StudentProfile {
  // From profiles
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  createdAt: string;
  profileImage: string | null;

  // From student_profiles (may be null if no entry)
  phone: string | null;
  instagram: string | null;
  profileImageUrl: string | null;
  birthDate: string | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: string | null;
  primaryGoal: string | null;
  trainingExperience: string | null;
  sports: string | null;
  previousInjuries: string | null;
  medicalConditions: string | null;
  isArchived: boolean;
}

export interface AssignedPlan {
  id: string;
  planId: string;
  planTitle: string;
  planType: string | null;
  difficultyLevel: string | null;
  totalDays: number;
  daysPerWeek: number;
  totalWeeks: number;
  startDate: string;
  endDate: string;
  status: string;
  currentDayNumber: number;
  completedDays: number;
  assignedAt: string;
}

// ── Helper maps ────────────────────────────────────────────────────────────

export const GOAL_LABELS: Record<string, string> = {
  aesthetic: "Estética",
  sports: "Rendimiento Deportivo",
  health: "Salud General",
  rehabilitation: "Rehabilitación",
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  none: "Sin experiencia",
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentario",
  light: "Ligero",
  moderate: "Moderado",
  active: "Activo",
  very_active: "Muy activo",
};

export const GENDER_LABELS: Record<string, string> = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
};

export const PLAN_STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  completed: "Completado",
  paused: "Pausado",
  cancelled: "Cancelado",
};

// ── Helper: calculate age ──────────────────────────────────────────────────

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useStudentProfile(studentId: string | undefined) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [plans, setPlans] = useState<AssignedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch profile + student_profiles in one query
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          first_name,
          last_name,
          email,
          profile_image,
          created_at,
          student_profiles (
            phone,
            instagram,
            profile_image_url,
            birth_date,
            gender,
            height_cm,
            weight_kg,
            activity_level,
            primary_goal,
            training_experience,
            sports,
            previous_injuries,
            medical_conditions,
            is_archived
          )
        `,
        )
        .eq("id", studentId)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error("Alumno no encontrado");

      // Extract student_profiles (supabase returns as array or object)
      const sp = Array.isArray(profileData.student_profiles)
        ? profileData.student_profiles[0]
        : (profileData.student_profiles as Record<string, unknown> | null);

      const studentProfile: StudentProfile = {
        id: profileData.id,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        fullName: `${profileData.first_name} ${profileData.last_name}`,
        email: profileData.email,
        createdAt: profileData.created_at,
        profileImage: profileData.profile_image,
        phone: (sp?.phone as string) ?? null,
        instagram: (sp?.instagram as string) ?? null,
        profileImageUrl: (sp?.profile_image_url as string) ?? null,
        birthDate: (sp?.birth_date as string) ?? null,
        gender: (sp?.gender as string) ?? null,
        heightCm: (sp?.height_cm as number) ?? null,
        weightKg: (sp?.weight_kg as number) ?? null,
        activityLevel: (sp?.activity_level as string) ?? null,
        primaryGoal: (sp?.primary_goal as string) ?? null,
        trainingExperience: (sp?.training_experience as string) ?? null,
        sports: (sp?.sports as string) ?? null,
        previousInjuries: (sp?.previous_injuries as string) ?? null,
        medicalConditions: (sp?.medical_conditions as string) ?? null,
        isArchived: (sp?.is_archived as boolean) ?? false,
      };

      setStudent(studentProfile);

      // Fetch assigned plans
      const { data: assignmentsData, error: assignError } = await supabase
        .from("training_plan_assignments")
        .select(
          `
          id,
          plan_id,
          start_date,
          end_date,
          status,
          current_day_number,
          completed_days,
          assigned_at,
          training_plans (
            title,
            plan_type,
            difficulty_level,
            total_days,
            days_per_week,
            total_weeks
          )
        `,
        )
        .eq("student_id", studentId)
        .order("assigned_at", { ascending: false });

      if (assignError) {
        console.warn("Could not load plans:", assignError);
      } else if (assignmentsData) {
        const mapped: AssignedPlan[] = assignmentsData.map(
          (a: Record<string, unknown>) => {
            const tp = a.training_plans as Record<string, unknown> | null;
            return {
              id: a.id as string,
              planId: a.plan_id as string,
              planTitle: (tp?.title as string) || "Plan sin nombre",
              planType: (tp?.plan_type as string) ?? null,
              difficultyLevel: (tp?.difficulty_level as string) ?? null,
              totalDays: (tp?.total_days as number) ?? 0,
              daysPerWeek: (tp?.days_per_week as number) ?? 0,
              totalWeeks: (tp?.total_weeks as number) ?? 0,
              startDate: a.start_date as string,
              endDate: a.end_date as string,
              status: (a.status as string) ?? "active",
              currentDayNumber: (a.current_day_number as number) ?? 1,
              completedDays: (a.completed_days as number) ?? 0,
              assignedAt: a.assigned_at as string,
            };
          },
        );
        setPlans(mapped);
      }
    } catch (err) {
      console.error("[useStudentProfile] Error:", err);
      setError(err instanceof Error ? err.message : "Error al cargar perfil");
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  return { student, plans, isLoading, error, reload: load };
}
