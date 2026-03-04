import { useState } from "react";
import { useStudentConstancia } from "@/hooks/useStudentConstancia";
import { useWorkoutCompletions } from "@/hooks/useWorkoutCompletions";

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

interface WorkoutCalendarProps {
  studentId: string;
}

export default function WorkoutCalendar({ studentId }: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Use precisely the hooks we updated with SWR!
  const { completions, loading: loadingCompletions } =
    useWorkoutCompletions(studentId);
  const { plans, isLoading: loadingPlans } = useStudentConstancia(studentId);

  // Transform plan constancia back into assignments structure that the calendar needs
  const assignments = plans.map((p) => ({
    startDate: p.startDate,
    endDate: p.endDate,
    daysPerWeek: p.daysPerWeek,
  }));

  const loading = loadingCompletions || loadingPlans;

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

  // Calculate expected workouts and attendance percentage for the CURRENT WEEK (Monday-Sunday)
  const calculateWeekAttendance = () => {
    const now = new Date();

    // Get Monday of current week
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
    startOfWeek.setDate(now.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get Sunday end
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Filter completions in this week
    const thisWeekCompletions = completions.filter((c) => {
      const completedDate = new Date(c.completedAt);
      return completedDate >= startOfWeek && completedDate <= endOfWeek;
    });

    // Find active assignment for this week
    let expectedDays = 0;
    for (const assignment of assignments) {
      const assignStart = new Date(assignment.startDate);
      const assignEnd = new Date(assignment.endDate);

      // Check if assignment is active this week
      if (assignEnd >= startOfWeek && assignStart <= endOfWeek) {
        expectedDays = assignment.daysPerWeek;
        break; // Use first active assignment
      }
    }

    const percentage =
      expectedDays > 0
        ? Math.round((thisWeekCompletions.length / expectedDays) * 100)
        : 0;

    return {
      expected: expectedDays,
      completed: thisWeekCompletions.length,
      percentage: Math.min(percentage, 100), // Cap at 100%
    };
  };

  const attendance = calculateWeekAttendance();

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
                  Constancia de la semana
                </span>
              </div>
              <span
                className={`text-2xl font-bold ${
                  attendance.percentage >= 80
                    ? "text-emerald-500"
                    : attendance.percentage >= 60
                      ? "text-amber-500"
                      : "text-red-500"
                }`}
              >
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
              entrenamientos completados esta semana
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-lg">
              info
            </span>
            <p className="text-sm text-text-muted dark:text-slate-400">
              Sin plan activo esta semana
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
