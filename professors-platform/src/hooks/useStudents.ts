import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../features/auth/store/authStore";

interface ActiveAssignment {
  plan_id: string;
  plan_title: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface Student {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  trainingLevel: string;
  primaryGoal: string;
  activityLevel: string;
  phone?: string;
  instagram?: string;
  activeAssignments?: ActiveAssignment[];
  rpeAlert?: "high" | "low" | null;
}

// Alias for components that need the extended type
export type StudentWithAssignments = Student;

interface AuthState {
  professor: { id: string } | null;
}

interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
}

interface StudentDetailRow {
  id: string;
  profile_image_url: string | null;
  training_experience: string;
  primary_goal: string;
  activity_level: string;
  phone: string | null;
  instagram: string | null;
}

interface AssignmentRow {
  student_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: string;
  training_plans: { title: string } | null;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const professor = useAuthStore((state: AuthState) => state.professor);

  const loadStudents = useCallback(async () => {
    if (!professor) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch students from profiles table (role = 'student')
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      if (!profilesData || profilesData.length === 0) {
        setStudents([]);
        return;
      }

      // Get all student IDs
      const studentIds = (profilesData as ProfileRow[]).map(
        (p: ProfileRow) => p.id,
      );

      // Fetch queries 2 and 3 in parallel (no dependen entre sí)
      const [
        { data: studentDetails, error: detailsError },
        { data: assignmentsData, error: assignmentsError },
      ] = await Promise.all([
        supabase
          .from("student_profiles")
          .select(
            "id, profile_image_url, training_experience, primary_goal, activity_level, phone, instagram",
          )
          .in("id", studentIds),
        supabase
          .from("training_plan_assignments")
          .select(
            `
            student_id,
            plan_id,
            start_date,
            end_date,
            status,
            training_plans ( title )
          `,
          )
          .in("student_id", studentIds)
          .in("status", ["active", "paused"]),
      ]);

      if (detailsError) throw detailsError;

      if (assignmentsError) {
        console.warn("Could not load assignments:", assignmentsError);
      }

      // Build assignments map: studentId -> assignments[]
      const assignmentsMap = new Map<string, ActiveAssignment[]>();
      if (assignmentsData) {
        for (const row of assignmentsData as unknown as AssignmentRow[]) {
          const existing = assignmentsMap.get(row.student_id) || [];
          existing.push({
            plan_id: row.plan_id,
            plan_title: row.training_plans?.title || "Plan sin nombre",
            start_date: row.start_date,
            end_date: row.end_date,
            status: row.status,
          });
          assignmentsMap.set(row.student_id, existing);
        }
      }

      // Create a map for quick lookup
      const detailsMap = new Map(
        ((studentDetails as StudentDetailRow[]) || []).map(
          (d: StudentDetailRow) => [d.id, d],
        ),
      );

      // Combine data
      const transformedStudents: Student[] = (profilesData as ProfileRow[])
        .filter((profile: ProfileRow) => detailsMap.has(profile.id))
        .map((profile: ProfileRow) => {
          const details = detailsMap.get(profile.id);
          return {
            id: profile.id,
            fullName: `${profile.first_name} ${profile.last_name}`,
            profileImageUrl: details?.profile_image_url || null,
            trainingLevel: details?.training_experience || "beginner",
            primaryGoal: details?.primary_goal || "health",
            activityLevel: details?.activity_level || "moderate",
            phone: details?.phone || undefined,
            instagram: details?.instagram || undefined,
            activeAssignments: assignmentsMap.get(profile.id) || [],
          };
        });

      setStudents(transformedStudents);
    } catch (err) {
      console.error("Error loading students:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [professor]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return {
    students,
    loading,
    error,
    reload: loadStudents,
  };
}

// Helper function to map training experience level to display text
export const getTrainingLevelDisplay = (level: string): string => {
  const levels: Record<string, string> = {
    none: "Sin experiencia",
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
  };
  return levels[level] || "Sin especificar";
};

// Helper function to map primary goal to display text
export const getPrimaryGoalDisplay = (goal: string): string => {
  const goals: Record<string, string> = {
    aesthetic: "Estética",
    sports: "Deporte",
    health: "Salud",
    rehabilitation: "Rehabilitación",
  };
  return goals[goal] || "Sin especificar";
};

// Helper function to map activity level to display text
export const getActivityLevelDisplay = (level: string): string => {
  const levels: Record<string, string> = {
    sedentary: "Sedentario",
    light: "Ligero",
    moderate: "Moderado",
    active: "Activo",
    very_active: "Muy activo",
  };
  return levels[level] || "Sin especificar";
};

// Get a meaningful tag combining level + goal
export const getStudentTag = (
  trainingLevel: string,
  primaryGoal: string,
): string => {
  const levelShort =
    getTrainingLevelDisplay(trainingLevel)?.split(" ")[0] || "Nivel";
  const goalDisplay = getPrimaryGoalDisplay(primaryGoal) || "Objetivo";
  return `${levelShort} • ${goalDisplay}`;
};
