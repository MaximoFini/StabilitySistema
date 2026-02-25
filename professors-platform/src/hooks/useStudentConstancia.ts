import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────

export interface TrainingSession {
  id: string;
  dayNumber: number;
  completedAt: string;
  mood: "happy" | "neutral" | "sad" | null;
  rpe: number | null;
}

export interface PlanConstancia {
  assignmentId: string;
  planTitle: string;
  startDate: string;
  endDate: string;
  status: string;
  sessions: TrainingSession[];
}

// ── Label maps ─────────────────────────────────────────────────────────────

export const MOOD_LABELS: Record<string, string> = {
  happy: "Feliz",
  neutral: "Neutro",
  sad: "Triste",
};

export const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
};

// ── Hook ───────────────────────────────────────────────────────────────────

export function useStudentConstancia(studentId: string | undefined) {
  const [plans, setPlans] = useState<PlanConstancia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all assignments for this student with completions
      const { data: assignments, error: assignErr } = await supabase
        .from("training_plan_assignments")
        .select(
          `
          id,
          start_date,
          end_date,
          status,
          training_plans (
            title
          )
        `,
        )
        .eq("student_id", studentId)
        .order("start_date", { ascending: false });

      if (assignErr) throw assignErr;
      if (!assignments || assignments.length === 0) {
        setPlans([]);
        setIsLoading(false);
        return;
      }

      const assignmentIds = assignments.map((a) => a.id);

      // Fetch all completions for those assignments
      const { data: completions, error: completionErr } = await supabase
        .from("workout_completions")
        .select("id, assignment_id, day_number, completed_at, mood, rpe")
        .in("assignment_id", assignmentIds)
        .order("completed_at", { ascending: false });

      if (completionErr) throw completionErr;

      // Group completions by assignment
      const completionsByAssignment: Record<string, TrainingSession[]> = {};
      for (const c of completions ?? []) {
        if (!completionsByAssignment[c.assignment_id]) {
          completionsByAssignment[c.assignment_id] = [];
        }
        completionsByAssignment[c.assignment_id].push({
          id: c.id,
          dayNumber: c.day_number,
          completedAt: c.completed_at,
          mood: c.mood ?? null,
          rpe: c.rpe ?? null,
        });
      }

      // Build the final structure
      const result: PlanConstancia[] = assignments.map((a) => {
        const tp = Array.isArray(a.training_plans)
          ? a.training_plans[0]
          : (a.training_plans as { title?: string } | null);

        return {
          assignmentId: a.id,
          planTitle: tp?.title ?? "Plan sin nombre",
          startDate: a.start_date,
          endDate: a.end_date,
          status: a.status,
          sessions: completionsByAssignment[a.id] ?? [],
        };
      });

      setPlans(result);
    } catch (err) {
      console.error("[useStudentConstancia]", err);
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  return { plans, isLoading, error, reload: load };
}
