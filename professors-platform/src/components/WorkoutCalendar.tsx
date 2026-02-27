import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

interface WorkoutCalendarProps {
  studentId: string;
}

interface WorkoutCompletion {
  id: string;
  completedAt: string;
}

interface PlanAssignment {
  id: string;
  startDate: string;
  endDate: string;
  daysPerWeek: number;
}

export default function WorkoutCalendar({ studentId }: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [assignments, setAssignments] = useState<PlanAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch completions
      const { data: completionsData, error: completionsError } = await supabase
        .from("workout_completions")
        .select("id, completed_at")
        .eq("student_id", studentId)
        .order("completed_at", { ascending: false });

      if (completionsError) throw completionsError;

      setCompletions(
        (completionsData ?? []).map((row) => ({
          id: row.id,
          completedAt: row.completed_at,
        })),
      );

      // Fetch active/paused assignments with their plans
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("training_plan_assignments")
        .select(
          `
          id,
          start_date,
          end_date,
          status,
          training_plans (
            days_per_week
          )
        `
        )
        .eq("student_id", studentId)
        .in("status", ["active", "paused"]);

      if (assignmentsError) throw assignmentsError;

      setAssignments(
        (assignmentsData ?? []).map((row: any) => {
          const plan = Array.isArray(row.training_plans)
            ? row.training_plans[0]
            : row.training_plans;
          return {
            id: row.id,
            startDate: row.start_date,
            endDate: row.end_date,
            daysPerWeek: plan?.days_per_week ?? 3,
          };
        })
      );
    } catch (err) {
      console.error("Error fetching calendar data:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const prevMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthLabel = currentMonth.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  const monthLabelCapitalized =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first

  const todayStr = new Date().toISOString().slice(0, 10);
  const today = new Date();

  // Build a Set of 'YYYY-MM-DD' strings for completed dates
  const completedDates: Set<string> = new Set(
    completions.map((c) => c.completedAt.slice(0, 10)),
  );

  const completionsThisMonth = completions.filter((c) => {
    const d = new Date(c.completedAt);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  // Calculate expected workouts and attendance percentage for this month
  const calculateMonthAttendance = () => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0); // Last day of month
    
    // If month is in the future, return 0
    if (monthStart > today) {
      return { expected: 0, completed: completionsThisMonth, percentage: 0 };
    }

    // Calculate up to today or end of month, whichever is earlier
    const endDate = today < monthEnd ? today : monthEnd;
    
    let totalExpectedDays = 0;

    // For each assignment, calculate expected days in this month
    for (const assignment of assignments) {
      const assignStart = new Date(assignment.startDate);
      const assignEnd = new Date(assignment.endDate);

      // Check if assignment overlaps with this month
      if (assignEnd < monthStart || assignStart > endDate) {
        continue; // No overlap
      }

      // Calculate overlap dates
      const overlapStart = assignStart > monthStart ? assignStart : monthStart;
      const overlapEnd = assignEnd < endDate ? assignEnd : endDate;

      // Calculate days in overlap period
      const overlapDays = Math.floor(
        (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      // Calculate expected workouts based on days_per_week
      const weeksInOverlap = overlapDays / 7;
      const expectedForThisAssignment = Math.round(weeksInOverlap * assignment.daysPerWeek);
      
      totalExpectedDays += expectedForThisAssignment;
    }

    const percentage = totalExpectedDays > 0 
      ? Math.round((completionsThisMonth / totalExpectedDays) * 100)
      : 0;

    return {
      expected: totalExpectedDays,
      completed: completionsThisMonth,
      percentage: Math.min(percentage, 100), // Cap at 100%
    };
  };

  const attendance = calculateMonthAttendance();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
      {/* Month navigation */}
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-text-main dark:text-white">
          {monthLabelCapitalized}
        </p>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-text-muted"
          >
            <span className="material-symbols-outlined text-lg">
              chevron_left
            </span>
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-text-muted"
          >
            <span className="material-symbols-outlined text-lg">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-4">
        {WEEK_DAYS.map((d, i) => (
          <div key={i} className="text-xs text-text-muted font-medium">
            {d}
          </div>
        ))}

        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {loading
          ? Array.from({ length: daysInMonth }).map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 animate-pulse" />
              </div>
            ))
          : Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === todayStr;
              const isCompleted = completedDates.has(dateStr);

              if (isToday) {
                return (
                  <div key={day} className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-medium shadow-md shadow-emerald-200 dark:shadow-none">
                      {day}
                    </div>
                  </div>
                );
              }
              if (isCompleted) {
                return (
                  <div key={day} className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                      {day}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={day}
                  className="text-sm font-medium text-text-main dark:text-white py-1 flex items-center justify-center"
                >
                  {day}
                </div>
              );
            })}
      </div>

      {/* Attendance Stats */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700 mt-2">
        {/* Percentage display */}
        {attendance.expected > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  trending_up
                </span>
                <span className="text-sm font-medium text-text-main dark:text-slate-300">
                  Constancia del mes
                </span>
              </div>
              <span className={`text-2xl font-bold ${
                attendance.percentage >= 80 
                  ? "text-emerald-500" 
                  : attendance.percentage >= 60 
                    ? "text-amber-500" 
                    : "text-red-500"
              }`}>
                {attendance.percentage}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  attendance.percentage >= 80 
                    ? "bg-emerald-500" 
                    : attendance.percentage >= 60 
                      ? "bg-amber-500" 
                      : "bg-red-500"
                }`}
                style={{ width: `${attendance.percentage}%` }}
              />
            </div>

            {/* Details */}
            <p className="text-xs text-text-muted dark:text-slate-400">
              <span className="font-semibold text-text-main dark:text-slate-300">
                {attendance.completed} de {attendance.expected}
              </span>{" "}
              entrenamientos completados
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-lg">
              info
            </span>
            <p className="text-sm text-text-muted dark:text-slate-400">
              Sin plan activo en este mes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
