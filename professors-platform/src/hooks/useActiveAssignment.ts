import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/store/authStore";

export interface ActiveAssignment {
  assignmentId: string;
  planId: string;
  planTitle: string;
  currentDayNumber: number;
  currentDayId: string; // UUID from training_plan_days
  currentDayName: string;
  totalDays: number;
  completedDays: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "paused" | "cancelled";
  exerciseCount: number;
  estimatedMinutes: number;
}

interface UseActiveAssignmentReturn {
  assignment: ActiveAssignment | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useActiveAssignment(): UseActiveAssignmentReturn {
  const professor = useAuthStore((s) => s.professor);
  const [assignment, setAssignment] = useState<ActiveAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!professor?.id) {
      setLoading(false);
      setAssignment(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query 1 — active assignment + plan info
      const { data: assignmentData, error: assignmentErr } = await supabase
        .from("training_plan_assignments")
        .select(
          "id, plan_id, student_id, start_date, end_date, status, current_day_number, completed_days, training_plans(title, total_days)",
        )
        .eq("student_id", professor.id)
        .eq("status", "active")
        .order("assigned_at", { ascending: false })
        .limit(1)
        .single();

      if (assignmentErr || !assignmentData) {
        // No active assignment — not an error, just no plan yet
        setAssignment(null);
        setLoading(false);
        return;
      }

      const planInfo = (
        Array.isArray(assignmentData.training_plans)
          ? assignmentData.training_plans[0]
          : assignmentData.training_plans
      ) as { title: string; total_days: number } | null;
      const planTitle = planInfo?.title ?? "Plan sin título";
      const totalDays = planInfo?.total_days ?? 0;

      // Query 2 — Get all days for this plan
      const { data: allDays, error: daysErr } = await supabase
        .from("training_plan_days")
        .select("id, day_number, day_name")
        .eq("plan_id", assignmentData.plan_id)
        .order("day_number", { ascending: true });

      if (daysErr || !allDays || allDays.length === 0) {
        setAssignment(null);
        setLoading(false);
        return;
      }

      // Query 3 — Get all completed workouts for this assignment
      const { data: completions } = await supabase
        .from("workout_completions")
        .select("day_number")
        .eq("assignment_id", assignmentData.id);

      // Build a Set of completed day numbers
      const completedDayNumbers = new Set(
        (completions ?? []).map((c) => c.day_number),
      );

      // Find the first day that is NOT completed
      let dayData = allDays.find(
        (day) => !completedDayNumbers.has(day.day_number),
      );

      // If all days are completed, show the last day (or could set status to completed)
      if (!dayData) {
        dayData = allDays[allDays.length - 1];
      }

      // Query 4 — count exercises for this day
      const { count } = await supabase
        .from("training_plan_exercises")
        .select("id", { count: "exact", head: true })
        .eq("day_id", dayData.id);

      const exerciseCount = count ?? 0;
      // Rough estimate: ~4 min per exercise
      const estimatedMinutes = Math.max(exerciseCount * 4, 20);

      setAssignment({
        assignmentId: assignmentData.id,
        planId: assignmentData.plan_id,
        planTitle,
        currentDayNumber: dayData.day_number,
        currentDayId: dayData.id,
        currentDayName: dayData.day_name,
        totalDays,
        completedDays: assignmentData.completed_days ?? 0,
        startDate: assignmentData.start_date,
        endDate: assignmentData.end_date,
        status: assignmentData.status,
        exerciseCount,
        estimatedMinutes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, [professor?.id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { assignment, loading, error, refetch: fetch };
}
