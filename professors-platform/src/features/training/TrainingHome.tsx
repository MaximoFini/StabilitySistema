import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useTrainingStore } from "@/features/training/store/trainingStore";
import { useActiveAssignment } from "@/hooks/useActiveAssignment";
import { useActiveDayExercises } from "@/hooks/useActiveDayExercises";
import { useWorkoutCompletions } from "@/hooks/useWorkoutCompletions";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dumbbell, CalendarX2, CheckCircle2 } from "lucide-react";

// Decorative gradient overlay for the hero image
const gradientOverlay =
  "linear-gradient(to bottom, rgba(0,86,178,0.55) 0%, rgba(26,26,94,0.90) 100%)";

export default function TrainingHome() {
  const navigate = useNavigate();
  const { professor } = useAuthStore();
  const setAssignmentContext = useTrainingStore((s) => s.setAssignmentContext);

  // ── Data hooks (assignment + completions fire in parallel) ──
  const { assignment, loading: assignmentLoading } = useActiveAssignment();
  const { completions } = useWorkoutCompletions();

  // Selected day state (null = use the suggested next day)
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  // Determine which day to load: manual selection or suggested next day
  const dayIdToLoad = selectedDayId ?? assignment?.currentDayId ?? null;

  const { workoutDay, loading: dayLoading } =
    useActiveDayExercises(dayIdToLoad);

  // Available days come from the assignment (no separate hook!)
  const availableDays = assignment?.availableDays ?? [];
  const daysPerWeek = assignment?.daysPerWeek ?? 0;

  // Build a Set of completed day numbers for this assignment.
  // Only count completions whose LOCAL calendar date is >= the plan's startDate.
  // We use local date extraction (getFullYear/getMonth/getDate) because:
  //   - completed_at is stored in UTC in Supabase (e.g. "2026-03-02T01:26:16Z")
  //   - In Argentina (UTC-3) that's "2026-03-01 22:26" → local date "2026-03-01"
  //   - start_date is already a local date "2026-03-02"
  //   - "2026-03-01" < "2026-03-02" → correctly excluded ✓
  const toLocalDateStr = (iso: string) => {
    const d = new Date(iso);
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  };

  const completedDayNumbers = new Set(
    completions
      .filter((c) => {
        if (c.assignmentId !== assignment?.assignmentId) return false;
        if (!assignment?.startDate) return true;
        const startDay = assignment.startDate.slice(0, 10);
        const completedLocalDay = toLocalDateStr(c.completedAt);
        return completedLocalDay >= startDay;
      })
      .map((c) => c.dayNumber),
  );

  // Calculate this week's completions
  const getThisWeekCompletions = () => {
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
    return completions.filter((c) => {
      const completedDate = new Date(c.completedAt);
      return completedDate >= startOfWeek && completedDate <= endOfWeek;
    });
  };

  const thisWeekCompletions = getThisWeekCompletions();
  const completedThisWeek = thisWeekCompletions.length;

  // Map completions to days of week (0 = Monday, 6 = Sunday)
  const completedDaysOfWeek = new Set(
    thisWeekCompletions.map((c) => {
      const date = new Date(c.completedAt);
      const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
      return day === 0 ? 6 : day - 1; // Convert to Monday-first: 0 = Mon, 6 = Sun
    }),
  );

  // Calculate completions this month
  const getThisMonthCompletions = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return completions.filter((c) => {
      const completedDate = new Date(c.completedAt);
      return (
        completedDate.getMonth() === currentMonth &&
        completedDate.getFullYear() === currentYear
      );
    });
  };

  const thisMonthCompletions = getThisMonthCompletions();
  const completedThisMonth = thisMonthCompletions.length;

  const isLoading = assignmentLoading || (!!assignment && dayLoading);

  // Check if the currently displayed day is already completed
  const currentDisplayDayNumber =
    availableDays.find((d) => d.id === dayIdToLoad)?.dayNumber ??
    assignment?.currentDayNumber ??
    null;
  const isCurrentDayCompleted =
    currentDisplayDayNumber !== null &&
    completedDayNumbers.has(currentDisplayDayNumber ?? -1);

  const firstName = professor?.firstName ?? "Atleta";
  const today = new Date();
  const dateLabel = today.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleStart = () => {
    if (!assignment || !workoutDay) return;

    // Find the day number for the selected/current day
    const dayNumber =
      availableDays.find((d) => d.id === dayIdToLoad)?.dayNumber ??
      assignment.currentDayNumber;

    // Store assignment context (mood + workoutDay stored after mood selection)
    setAssignmentContext(assignment.assignmentId, dayNumber);
    // Navigate to mood check first; MoodCheckScreen will call startWorkout
    navigate("/entrenamiento/mood/" + dayIdToLoad);
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-5 max-w-lg mx-auto">
      {/* ── Header greeting ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize font-medium">
            {dateLabel}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hola, {firstName} 💪
          </h1>
        </div>

        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0056b2] to-[#1a1a5e] flex items-center justify-center shrink-0 shadow-md shadow-blue-200 dark:shadow-blue-900/40">
          {professor?.profileImage ? (
            <img
              src={professor.profileImage}
              alt={firstName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-white text-[22px] filled">
              person
            </span>
          )}
        </div>
      </div>

      {/* ── Hero workout card ─────────────────────────────────────── */}
      {isLoading ? (
        /* Skeleton */
        <div className="rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse min-h-[220px]" />
      ) : !assignment ? (
        /* ── Empty state — no active plan ──────────────────────────────── */
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm min-h-[220px] px-6 py-10 text-center">
          {/* Icon bubble */}
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-700/50">
            <Dumbbell
              className="text-slate-400 dark:text-slate-500"
              size={28}
              strokeWidth={1.8}
            />
          </div>

          {/* Copy */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              No tenés ningún plan asignado actualmente
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto leading-relaxed">
              Tu entrenador todavía no te asignó un plan vigente.
              ¡En breve comenzamos! 💪
            </p>
          </div>

          {/* Subtle decorative rule */}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-600 font-medium">
            <CalendarX2 size={13} strokeWidth={2} />
            <span>Sin plan vigente</span>
          </div>
        </div>
      ) : (
        /* Real plan card */
        <div
          className="relative overflow-hidden rounded-2xl shadow-xl min-h-[220px] flex flex-col justify-end"
          style={{
            background:
              gradientOverlay +
              ', url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80") center/cover no-repeat',
          }}
        >


          {/* Content */}
          <div className="relative p-5 pt-12 text-white space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">
                Tu Entrenamiento de Hoy
              </p>
              <h2 className="text-xl font-bold leading-tight">
                Día {workoutDay?.id ?? assignment.currentDayNumber}
              </h2>
              <p className="text-xs text-blue-200/80 mt-0.5 font-medium">
                {assignment.planTitle}
              </p>

              {/* Metadata pills */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  {
                    icon: "exercise",
                    text: `${workoutDay?.exercises.length ?? assignment.exerciseCount} ejercicios`,
                  },
                ].map((m) => (
                  <span
                    key={m.text}
                    className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {m.icon}
                    </span>
                    {m.text}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA button — hidden when day is already completed */}
            {isCurrentDayCompleted ? (
              <div className="w-full flex items-center justify-center gap-2 bg-emerald-500/90 text-white font-bold text-sm py-3.5 rounded-xl min-h-[48px]">
                <CheckCircle2 size={18} strokeWidth={2.5} />
                DÍA COMPLETADO
              </div>
            ) : (
              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 bg-white text-primary font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-black/20 hover:bg-blue-50 active:scale-[0.98] transition-all min-h-[48px]"
              >
                <span className="material-symbols-outlined text-[18px] filled">
                  play_arrow
                </span>
                COMENZAR RUTINA
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Day selector (when assignment exists) ──────────────────── */}
      {assignment && availableDays.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Seleccionar día
            </h3>
            {selectedDayId && (
              <button
                onClick={() => setSelectedDayId(null)}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Volver al sugerido
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
            {availableDays.map((day) => {
              const isCompleted = completedDayNumbers.has(day.dayNumber);
              const isSelected = selectedDayId === day.id;
              const isSuggested =
                !selectedDayId && day.id === assignment.currentDayId;

              return (
                <button
                  key={day.id}
                  onClick={() => !isCompleted && setSelectedDayId(day.id)}
                  disabled={isCompleted}
                  className={cn(
                    "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all shrink-0 min-w-[100px]",
                    isCompleted
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 cursor-not-allowed opacity-80"
                      : isSelected || isSuggested
                        ? "bg-primary/5 border-primary"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isSelected || isSuggested
                            ? "text-primary"
                            : "text-slate-600 dark:text-slate-400",
                      )}
                    >
                      DÍA {day.dayNumber}
                    </span>
                    {isCompleted && (
                      <CheckCircle2
                        size={14}
                        className="text-emerald-500"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] text-center leading-tight line-clamp-2",
                      isCompleted
                        ? "text-emerald-600/80 dark:text-emerald-400/80 font-medium"
                        : isSelected || isSuggested
                          ? "text-slate-900 dark:text-white font-medium"
                          : "text-slate-500 dark:text-slate-400",
                    )}
                  >
                    {isCompleted ? "Completado" : day.dayName}
                  </span>
                  {isSuggested && !selectedDayId && !isCompleted && (
                    <span className="text-[9px] text-primary font-bold uppercase tracking-wider">
                      Sugerido
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Metrics row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-900/30">
            <span className="material-symbols-outlined text-[20px] filled text-blue-600 dark:text-blue-400">
              fitness_center
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {completedThisMonth}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                este mes
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              Sesiones completadas
            </p>
          </div>
        </div>
      </div>

      {/* ── Weekly progress strip ─────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Esta semana
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {completedThisWeek} / {daysPerWeek || "—"} sesiones
          </span>
        </div>
        <div className="flex gap-1.5">
          {["L", "M", "X", "J", "V", "S", "D"].map((day, i) => {
            const done = completedDaysOfWeek.has(i);
            return (
              <div
                key={day}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    "w-full h-8 rounded-lg transition-all",
                    done
                      ? "bg-primary shadow-sm shadow-blue-300 dark:shadow-blue-900/40"
                      : "bg-slate-100 dark:bg-slate-800",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    done
                      ? "text-primary"
                      : "text-slate-300 dark:text-slate-600",
                  )}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
