import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useDataCacheStore } from "@/store/dataCacheStore";
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

  const workoutCompletions = useDataCacheStore((s) => s.workoutCompletions);
  const loadedWorkoutCompletions = useDataCacheStore((s) => s.loadedWorkoutCompletions);
  const setWorkoutCompletionsData = useDataCacheStore((s) => s.setWorkoutCompletionsData);
  const invalidateWorkoutCompletions = useDataCacheStore((s) => s.invalidateWorkoutCompletions);

  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentId = professor?.id;
  const isLoaded = studentId ? !!loadedWorkoutCompletions[studentId] : false;

  const fetch = useCallback(async (force = false) => {
    if (!studentId) {
      setIsFetching(false);
      return;
    }

    if (isLoaded && !force) {
      setIsFetching(true); // SWR: fetch in background
    } else {
      setIsFetching(true);
    }
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

      setWorkoutCompletionsData(
        studentId,
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
      setIsFetching(false);
    }
  }, [studentId, isLoaded, setWorkoutCompletionsData]);

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

        // Step 2 — read current assignment metadata (including start_date)
        const { data: assignmentData, error: readErr } = await supabase
          .from("training_plan_assignments")
          .select("completed_days, start_date, plan_id, training_plans(total_days)")
          .eq("id", params.assignmentId)
          .single();

        if (readErr || !assignmentData) {
          return {
            success: false,
            error: readErr?.message ?? "No se pudo leer la asignación",
          };
        }

        // Step 2b — count unique valid completed days (>= start_date) from workout_completions.
        // This is the source of truth for completed_days; we never blindly do +1.
        // Using start_date as a lower bound ensures that if the coach moves the start date
        // forward, old completions are excluded and the counter resets cleanly.
        const startDateISO = assignmentData.start_date
          ? assignmentData.start_date.slice(0, 10)
          : null;

        const completionsQuery = supabase
          .from("workout_completions")
          .select("day_number")
          .eq("assignment_id", params.assignmentId)
          .eq("student_id", professor.id);

        // Use LOCAL midnight of start_date as the UTC lower bound for Supabase.
        // new Date("YYYY-MM-DDT00:00:00") without Z is parsed as LOCAL time,
        // so .toISOString() gives the correct UTC equivalent (e.g. for UTC-3:
        // local midnight 2026-03-02 00:00 → 2026-03-02T03:00:00.000Z).
        // This correctly excludes a completion at 2026-03-02T01:26Z (= March 1 local).
        const startTimestampUTC = startDateISO
          ? new Date(startDateISO + "T00:00:00").toISOString()
          : null;

        const { data: allCompletions } = startTimestampUTC
          ? await completionsQuery.gte("completed_at", startTimestampUTC)
          : await completionsQuery;

        // Count unique day_numbers that have been completed (including the one just inserted)
        const uniqueCompletedDays = new Set(
          (allCompletions ?? []).map((c) => c.day_number),
        );
        const newCompletedDays = uniqueCompletedDays.size;

        // Derive totalDays from the plan info returned in the assignment query
        const planInfo = (
          Array.isArray(assignmentData.training_plans)
            ? assignmentData.training_plans[0]
            : assignmentData.training_plans
        ) as { total_days: number } | null;
        const totalDays = planInfo?.total_days ?? 0;

        // Check if all days are now completed
        const newStatus: "active" | "completed" =
          newCompletedDays >= totalDays ? "completed" : "active";

        // Step 3 — update completed_days and status (but NOT current_day_number)
        // The next pending day is now calculated dynamically in useActiveAssignment
        const { error: updateErr } = await supabase
          .from("training_plan_assignments")
          .update({
            completed_days: newCompletedDays,
            current_day_number: params.dayNumber,
            status: newStatus,
          })
          .eq("id", params.assignmentId);

        if (updateErr) return { success: false, error: updateErr.message };

        // Invalidar caché general que dependa de esto: constancias, assignment, profiles (estadísticas)
        invalidateWorkoutCompletions(professor.id);

        const dataStore = useDataCacheStore.getState();
        dataStore.invalidateActiveAssignment(professor.id);
        dataStore.invalidateStudentConstancia(professor.id);

        // Refresh local state local state (for completions)
        await fetch(true);

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

  // Completions cached state
  const completions = studentId ? workoutCompletions[studentId] || [] : [];
  const loading = isFetching && !isLoaded;

  // Build a Set of 'YYYY-MM-DD' strings for completed dates
  const completedDates: Set<string> = new Set(
    completions.map((c: WorkoutCompletion) => c.completedAt.slice(0, 10)),
  );

  return {
    completions,
    completedDates,
    loading,
    error,
    saveCompletion,
    refetch: () => {
      if (studentId) invalidateWorkoutCompletions(studentId);
      fetch(true);
    },
  };
}
