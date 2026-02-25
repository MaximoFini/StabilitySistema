import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTrainingStore } from "@/features/training/store/trainingStore";
import { useWorkoutCompletions } from "@/hooks/useWorkoutCompletions";
import { useAuthStore } from "@/features/auth/store/authStore";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const RPE_LABELS: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Moderado",
  4: "Un poco duro",
  5: "Duro",
  6: "Duro",
  7: "Muy duro",
  8: "Muy duro",
  9: "Extremo",
  10: "Máximo",
};

const rpeColor = (rpe: number | null, value: number) => {
  if (rpe !== value)
    return "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300";
  if (value <= 3)
    return "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-300 dark:shadow-emerald-900";
  if (value <= 6)
    return "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-300 dark:shadow-amber-900";
  return "bg-red-500 border-red-500 text-white shadow-lg shadow-red-300 dark:shadow-red-900";
};

export default function WorkoutComplete() {
  const navigate = useNavigate();
  const {
    currentDay,
    seriesLog,
    rpe,
    mood,
    moodComment,
    setRpe,
    setMood,
    setMoodComment,
    resetTraining,
    assignmentId,
    currentDayNumber,
  } = useTrainingStore();
  const { saveCompletion, completions } = useWorkoutCompletions();
  const professor = useAuthStore((s) => s.professor);
  const [isSaving, setIsSaving] = useState(false);

  const totalSets =
    currentDay?.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) ?? 18;
  const doneSets = Object.values(seriesLog).filter((s) => s.done).length;

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

  // Map completions to days of week (0 = Monday, 6 = Sunday)
  const completedDaysOfWeek = new Set(
    thisWeekCompletions.map((c) => {
      const date = new Date(c.completedAt);
      const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
      return day === 0 ? 6 : day - 1; // Convert to Monday-first: 0 = Mon, 6 = Sun
    }),
  );

  const today = new Date();
  const todayDayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0 = Mon, 6 = Sun

  const handleGoHome = async () => {
    if (assignmentId) {
      setIsSaving(true);
      const result = await saveCompletion({
        assignmentId,
        dayNumber: currentDayNumber,
        rpe,
        mood: mood ?? null,
        moodComment: moodComment || undefined,
        totalSetsDone: doneSets,
        seriesLog,
      });
      if (result.success) {
        toast.success("¡Entrenamiento guardado! 💪");
      } else {
        toast.error("No se pudo guardar. Intenta de nuevo.");
      }

      // 2. Guardar exercise_weight_logs para ejercicios con writeWeight = true
      const exercisesToLog =
        currentDay?.exercises.filter((ex) => ex.writeWeight) ?? [];

      if (exercisesToLog.length > 0 && professor?.id) {
        const logsToInsert = exercisesToLog.map((ex) => {
          const setsDetail = ex.sets.map((set, setIndex) => {
            const key = `${ex.id}-${setIndex}`;
            const log = seriesLog[key];
            return {
              set_number: set.setNumber,
              target_reps: set.targetReps,
              actual_reps: log?.reps ?? null,
              kg: log?.kg ? parseFloat(log.kg) : null,
            };
          });

          return {
            student_id: professor.id,
            assignment_id: assignmentId,
            exercise_id: String(ex.id),
            exercise_name: ex.name,
            plan_day_number: currentDayNumber,
            plan_day_name: currentDay?.name ?? "",
            series: ex.sets.length,
            sets_detail: setsDetail,
          };
        });

        const { error: logsError } = await supabase
          .from("exercise_weight_logs")
          .insert(logsToInsert);

        if (logsError) {
          console.error("Error saving exercise weight logs:", logsError);
        }
      }

      setIsSaving(false);
    }
    resetTraining();
    navigate("/entrenamiento", { replace: true });
  };

  // Congratulations message based on RPE
  const getMessage = () => {
    if (!rpe) return "¡Excelente esfuerzo hoy! Sigue así. 🎉";
    if (rpe <= 4)
      return "Entrenamiento fluido. Considera aumentar la carga la próxima vez. 🚀";
    if (rpe <= 7)
      return "¡Gran trabajo! Ese es el esfuerzo que construye músculo. 💪";
    return "¡Bestia! Diste todo hoy. Descansa bien esta noche. 🔥";
  };

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc] dark:bg-slate-950 px-4 pt-8 pb-6 items-center max-w-lg mx-auto w-full">
      {/* ── Check icon ──────────────────────────────────────────── */}
      <div className="mt-6 mb-5 relative">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-400/40 dark:shadow-emerald-600/30">
          <span className="material-symbols-outlined text-white text-[56px] filled">
            check_circle
          </span>
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-full border-4 border-emerald-300/30 dark:border-emerald-700/30 scale-110" />
        <div className="absolute inset-0 rounded-full border-4 border-emerald-200/20 dark:border-emerald-800/20 scale-125" />
      </div>

      {/* ── Title ────────────────────────────────────────────────── */}
      <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white tracking-tight">
        ¡Entrenamiento Completado!
      </h1>
      <p className="mt-1.5 text-sm text-center text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
        {getMessage()}
      </p>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="w-full mt-6 grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
          <span className="material-symbols-outlined text-[26px] text-primary filled">
            stacked_line_chart
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {doneSets > 0 ? doneSets : totalSets}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center leading-tight">
            Series completadas
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
          <span className="material-symbols-outlined text-[26px] text-amber-500 filled">
            exercise
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {currentDay?.exercises.length ?? 5}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center leading-tight">
            Ejercicios realizados
          </span>
        </div>
      </div>

      {/* ── RPE selector ─────────────────────────────────────────── */}
      <div className="w-full mt-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          ¿Qué tan difícil fue hoy?
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Escala de esfuerzo percibido (RPE 1–10)
        </p>

        {/* Grid 5x2 */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
            <button
              key={value}
              onClick={() => setRpe(value)}
              className={cn(
                "h-12 flex items-center justify-center rounded-xl border-2 font-bold text-base transition-all active:scale-95 min-h-[44px]",
                rpeColor(rpe, value),
              )}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Fácil
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Muy duro
          </span>
        </div>

        {/* RPE label */}
        {rpe && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              RPE {rpe}:
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {RPE_LABELS[rpe]}
            </span>
          </div>
        )}
      </div>

      {/* ── ¿Cómo te sentiste? ──────────────────────────────────── */}
      <div className="w-full mt-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          ¿Cómo te sentiste?
        </p>

        <div className="grid grid-cols-4 gap-2">
          {(
            [
              { value: "excelente" as const, emoji: "🔥", label: "Excelente" },
              { value: "normal" as const, emoji: "😊", label: "Normal" },
              { value: "fatigado" as const, emoji: "😓", label: "Fatigado" },
              { value: "molestia" as const, emoji: "🤕", label: "Molestia" },
            ] as const
          ).map(({ value, emoji, label }) => (
            <button
              key={value}
              onClick={() => setMood(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 font-medium text-xs transition-all active:scale-95 min-h-[64px]",
                mood === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary/40",
              )}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs leading-tight">{label}</span>
            </button>
          ))}
        </div>

        {/* Comentario libre */}
        <textarea
          value={moodComment}
          onChange={(e) => setMoodComment(e.target.value)}
          placeholder="Comentario opcional... (dolor, molestia, observación)"
          rows={2}
          className="mt-4 w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* ── Week strip ───────────────────────────────────────────── */}
      <div className="w-full mt-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
          Días esta semana
        </p>
        <div className="flex gap-1.5">
          {["L", "M", "X", "J", "V", "S", "D"].map((day, i) => {
            const isToday = i === todayDayOfWeek;
            const isCompleted = completedDaysOfWeek.has(i);

            return (
              <div
                key={day}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    "w-full h-8 rounded-lg transition-all",
                    isToday
                      ? "bg-emerald-500 shadow-sm shadow-emerald-300 dark:shadow-emerald-900/40"
                      : isCompleted
                        ? "bg-primary/80"
                        : "bg-slate-100 dark:bg-slate-800",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    isToday
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isCompleted
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

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <div className="w-full mt-6">
        <button
          onClick={handleGoHome}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-[0.98] transition-all min-h-[52px] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isSaving ? (
            <span className="material-symbols-outlined animate-spin text-[18px]">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined text-[18px] filled">
              save
            </span>
          )}
          {isSaving ? "Guardando..." : "Guardar y Volver al Inicio"}
        </button>
      </div>
    </div>
  );
}
