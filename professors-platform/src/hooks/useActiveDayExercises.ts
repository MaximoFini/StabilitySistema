import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type {
  WorkoutDay,
  Exercise,
  ExerciseSet,
} from "@/features/training/types";

interface UseActiveDayExercisesReturn {
  workoutDay: WorkoutDay | null;
  loading: boolean;
  error: string | null;
}

/** Parse a pause string like "60s", "90s", "2min", "1.5min" into seconds. */
function parsePauseToSeconds(pause: string | null | undefined): number {
  if (!pause) return 60;
  const lower = pause.toLowerCase().trim();
  const minMatch = lower.match(/^(\d+(?:\.\d+)?)\s*min/);
  if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60);
  const secMatch = lower.match(/^(\d+)\s*s/);
  if (secMatch) return parseInt(secMatch[1], 10);
  const plainNum = parseFloat(lower);
  if (!isNaN(plainNum)) return plainNum > 10 ? plainNum : plainNum * 60;
  return 60;
}


export function useActiveDayExercises(
  dayId: string | null,
): UseActiveDayExercisesReturn {
  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dayId) {
      setWorkoutDay(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        // Single query with join — day metadata + exercises in one round-trip
        const { data: dayData, error: dayErr } = await supabase
          .from("training_plan_days")
          .select(
            "id, day_number, day_name"
          )
          .eq("id", dayId!)
          .single();

        if (dayErr || !dayData) {
          if (!cancelled) setError(dayErr?.message ?? "Día no encontrado");
          return;
        }

        const { data: exercises, error: exErr } = await supabase
          .from("training_plan_exercises")
          .select(
            "id, exercise_name, series, reps, pause, stage_name, notes, coach_instructions, video_url, display_order, write_weight, carga",
          )
          .eq("day_id", dayId!)
          .order("display_order", { ascending: true });

        if (exErr) {
          if (!cancelled) setError(exErr.message);
          return;
        }

        // Transform exercises to the WorkoutDay format
        const mappedExercises: Exercise[] = (exercises ?? []).map(
          (ex: {
            id: string;
            exercise_name: string;
            series: number;
            reps: string;
            pause: string;
            stage_name: string | null;
            notes: string | null;
            coach_instructions: string | null;
            video_url: string | null;
            display_order: number;
            write_weight?: boolean;
            carga?: string;
          }) => {
            const sets: ExerciseSet[] = Array.from(
              { length: Math.max(ex.series ?? 1, 1) },
              (_, i) => ({
                setNumber: i + 1,
                targetReps: ex.reps ?? "10",
                targetWeight: 0,
              }),
            );

            const instructionParts: string[] = [];
            if (ex.notes) instructionParts.push(ex.notes);
            if (ex.coach_instructions)
              instructionParts.push(ex.coach_instructions);

            return {
              id: ex.id,
              name: ex.exercise_name,
              category: ex.stage_name ?? "",
              sets,
              restSeconds: parsePauseToSeconds(ex.pause),
              videoUrl: ex.video_url ?? undefined,
              instructions: instructionParts.join(" — ") || undefined,
              writeWeight: ex.write_weight ?? false,
              carga: ex.carga ?? undefined,
            };
          },
        );

        // Rough duration estimate
        const durationMinutes = Math.max(mappedExercises.length * 4, 20);

        if (!cancelled) {
          setWorkoutDay({
            id: dayData.day_number,
            name: dayData.day_name,
            durationMinutes,
            exercises: mappedExercises,
          });
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dayId]);

  return { workoutDay, loading, error };
}
