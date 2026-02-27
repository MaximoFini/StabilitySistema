import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { SeriesLog } from "@/features/training/types";

export interface WorkoutCompletion {
  id: string;
  assignmentId: string;
  dayNumber: number;
  completedAt: string;
  rpe: number | null;
  totalSetsDone: number | null;
}

export interface SaveCompletionParams {
  assignmentId: string;
  dayNumber: number;
  rpe: number | null;
  initialMood: string | null;   // happy/neutral/sad — antes de entrenar
  mood: string | null;          // excellent/normal/tired/pain — al finalizar
  moodComment?: string | null;
  totalSetsDone: number;
  seriesLog: SeriesLog;
}

interface UseWorkoutCompletionsReturn {
  completions: WorkoutCompletion[];
  completedDates: Set<string>;
  loading: boolean;
  error: string | null;
  saveCompletion: (
    params: SaveCompletionParams,
  ) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

export function useWorkoutCompletions(): UseWorkoutCompletionsReturn {
  const professor = useAuthStore((s) => s.professor);
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!professor?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from("workout_completions")
        .select(
          "id, assignment_id, day_number, completed_at, rpe, total_sets_done",
        )
        .eq("student_id", professor.id)
        .order("completed_at", { ascending: false });

      if (fetchErr) {
        setError(fetchErr.message);
        return;
      }

      setCompletions(
        (data ?? []).map((row) => ({
          id: row.id,
          assignmentId: row.assignment_id,
          dayNumber: row.day_number,
          completedAt: row.completed_at,
          rpe: row.rpe,
          totalSetsDone: row.total_sets_done,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, [professor?.id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const saveCompletion = useCallback(
    async (
      params: SaveCompletionParams,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!professor?.id)
        return { success: false, error: "No hay usuario autenticado" };

      // Validación de datos
      if (!params.assignmentId) {
        console.error("❌ assignmentId está vacío");
        return { success: false, error: "Assignment ID requerido" };
      }

      if (!params.dayNumber || params.dayNumber < 1) {
        console.error("❌ dayNumber inválido:", params.dayNumber);
        return { success: false, error: "Day number inválido" };
      }

      try {
        // Mapear mood a valores válidos del constraint de BD
        // Los valores válidos son probablemente: 'excellent', 'good', 'tired', 'pain' o similares
        let moodValue: string | null = null;
        if (params.mood) {
          const moodMap: Record<string, string> = {
            excelente: "excellent",
            normal: "normal",
            fatigado: "tired",
            molestia: "pain",
          };
          moodValue = moodMap[params.mood] || null;
        }

        // Step 1 — insert completion record
        const insertData = {
          student_id: professor.id,
          assignment_id: params.assignmentId,
          day_number: params.dayNumber,
          rpe: params.rpe,
          initial_mood: params.initialMood || null,
          mood: moodValue,
          mood_comment: params.moodComment || null,
          total_sets_done: params.totalSetsDone,
          series_log: params.seriesLog as Record<string, unknown>,
        };

        console.log(
          "✅ Datos a insertar:",
          JSON.stringify(insertData, null, 2),
        );

        const { error: insertErr } = await supabase
          .from("workout_completions")
          .insert(insertData);

        if (insertErr) {
          console.error("❌ Error insertando workout_completion:", insertErr);
          return { success: false, error: insertErr.message };
        }

        console.log("✅ Workout completion guardado exitosamente");

        // Step 2 — read current assignment to get completed_days
        const { data: assignmentData, error: readErr } = await supabase
          .from("training_plan_assignments")
          .select("completed_days, plan_id, training_plans(total_days)")
          .eq("id", params.assignmentId)
          .single();

        if (readErr || !assignmentData) {
          return {
            success: false,
            error: readErr?.message ?? "No se pudo leer la asignación",
          };
        }

        const planInfo = (
          Array.isArray(assignmentData.training_plans)
            ? assignmentData.training_plans[0]
            : assignmentData.training_plans
        ) as { total_days: number } | null;
        const totalDays = planInfo?.total_days ?? 0;
        const newCompletedDays = (assignmentData.completed_days ?? 0) + 1;

        // Check if all days are now completed
        const newStatus: "active" | "completed" =
          newCompletedDays >= totalDays ? "completed" : "active";

        // Step 3 — update completed_days and status (but NOT current_day_number)
        // The next pending day is now calculated dynamically in useActiveAssignment
        const { error: updateErr } = await supabase
          .from("training_plan_assignments")
          .update({
            completed_days: newCompletedDays,
            status: newStatus,
          })
          .eq("id", params.assignmentId);

        if (updateErr) return { success: false, error: updateErr.message };

        // Refresh local state
        await fetch();

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Error inesperado",
        };
      }
    },
    [professor?.id, fetch],
  );

  // Build a Set of 'YYYY-MM-DD' strings for completed dates
  const completedDates: Set<string> = new Set(
    completions.map((c) => c.completedAt.slice(0, 10)),
  );

  return {
    completions,
    completedDates,
    loading,
    error,
    saveCompletion,
    refetch: fetch,
  };
}
