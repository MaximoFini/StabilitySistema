import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/store/authStore";

export interface AvailableDay {
  id: string;
  dayNumber: number;
  dayName: string;
  exerciseCount: number;
  estimatedMinutes: number;
}

export interface ActiveAssignment {
  assignmentId: string;
  planId: string;
  planTitle: string;
  currentDayNumber: number;
  currentDayId: string;
  currentDayName: string;
  totalDays: number;
  completedDays: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "paused" | "cancelled";
  exerciseCount: number;
  estimatedMinutes: number;
  daysPerWeek: number;
  availableDays: AvailableDay[];
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
      // ── Fire BOTH queries in parallel ─────────────────────────
      const [assignmentResult, completionsResult] = await Promise.all([
        // Q1: Assignment + plan + days + exercise counts (single joined query)
        supabase
          .from("training_plan_assignments")
          .select(
            `id, plan_id, student_id, start_date, end_date, status, current_day_number, completed_days,
             training_plans(title, total_days, days_per_week,
               training_plan_days(id, day_number, day_name,
                 training_plan_exercises(id)
               )
             )`
          )
          .eq("student_id", professor.id)
          .eq("status", "active")
          .order("assigned_at", { ascending: false })
          .limit(1)
          .single(),

        // Q2: All completions for this student (independent)
        supabase
          .from("workout_completions")
          .select("day_number, assignment_id")
          .eq("student_id", professor.id),
      ]);

      const { data: assignmentData, error: assignmentErr } = assignmentResult;
      const { data: completionsData } = completionsResult;

      if (assignmentErr || !assignmentData) {
        // No active assignment — not an error
        setAssignment(null);
        setLoading(false);
        return;
      }

      // ── Parse plan info ───────────────────────────────────────
      const planInfo = (
        Array.isArray(assignmentData.training_plans)
          ? assignmentData.training_plans[0]
          : assignmentData.training_plans
      ) as {
        title: string;
        total_days: number;
        days_per_week: number;
        training_plan_days: Array<{
          id: string;
          day_number: number;
          day_name: string;
          training_plan_exercises: Array<{ id: string }>;
        }>;
      } | null;

      const planTitle = planInfo?.title ?? "Plan sin título";
      const totalDays = planInfo?.total_days ?? 0;
      const daysPerWeek = planInfo?.days_per_week ?? 0;

      // ── Parse days + exercise counts ──────────────────────────
      const rawDays = planInfo?.training_plan_days ?? [];
      const sortedDays = [...rawDays].sort(
        (a, b) => a.day_number - b.day_number
      );

      const availableDays: AvailableDay[] = sortedDays.map((day) => {
        const exerciseCount = day.training_plan_exercises?.length ?? 0;
        return {
          id: day.id,
          dayNumber: day.day_number,
          dayName: day.day_name,
          exerciseCount,
          estimatedMinutes: Math.max(exerciseCount * 4, 20),
        };
      });

      // ── Find next pending day ─────────────────────────────────
      const completedDayNumbers = new Set(
        (completionsData ?? [])
          .filter((c) => c.assignment_id === assignmentData.id)
          .map((c) => c.day_number)
      );

      let dayData = sortedDays.find(
        (day) => !completedDayNumbers.has(day.day_number)
      );
      // If all completed, show the last day
      if (!dayData && sortedDays.length > 0) {
        dayData = sortedDays[sortedDays.length - 1];
      }

      if (!dayData) {
        setAssignment(null);
        setLoading(false);
        return;
      }

      const exerciseCount = dayData.training_plan_exercises?.length ?? 0;

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
        estimatedMinutes: Math.max(exerciseCount * 4, 20),
        daysPerWeek,
        availableDays,
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
