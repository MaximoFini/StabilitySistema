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

export default function WorkoutCalendar({ studentId }: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompletions = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workout_completions")
        .select("id, completed_at")
        .eq("student_id", studentId)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      setCompletions(
        (data ?? []).map((row) => ({
          id: row.id,
          completedAt: row.completed_at,
        })),
      );
    } catch (err) {
      console.error("Error fetching completions:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

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

  // Build a Set of 'YYYY-MM-DD' strings for completed dates
  const completedDates: Set<string> = new Set(
    completions.map((c) => c.completedAt.slice(0, 10)),
  );

  const completionsThisMonth = completions.filter((c) => {
    const d = new Date(c.completedAt);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

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

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
        <span className="material-symbols-outlined text-primary text-lg">
          check_circle
        </span>
        <p className="text-sm text-text-main dark:text-slate-300">
          <span className="font-bold text-primary">
            {completionsThisMonth}{" "}
            {completionsThisMonth === 1 ? "Entrenamiento" : "Entrenamientos"}
          </span>{" "}
          este mes
        </p>
      </div>
    </div>
  );
}
