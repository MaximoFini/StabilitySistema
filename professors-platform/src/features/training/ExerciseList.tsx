import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrainingStore } from "@/features/training/store/trainingStore";
import { useActiveDayExercises } from "@/hooks/useActiveDayExercises";
import { Pencil, X, CheckCircle2 } from "lucide-react";
import { QuickSaveModal } from "@/features/training/QuickSaveModal";
import type { Exercise } from "@/features/training/types";
import { cn } from "@/lib/utils";

export default function ExerciseList() {
  const navigate = useNavigate();
  const { dayId } = useParams<{ dayId: string }>();
  const currentDay = useTrainingStore((s) => s.currentDay);
  const startWorkout = useTrainingStore((s) => s.startWorkout);
  const goToExercise = useTrainingStore((s) => s.goToExercise);
  const assignmentId = useTrainingStore((s) => s.assignmentId);
  const currentDayNumber = useTrainingStore((s) => s.currentDayNumber);

  // ── Quick Save state ────────────────────────────────────────────────────
  // Store both kg and reps: key = `${exerciseId}-${setIndex}`, value = { kg: string, reps: string }
  const [quickWeights, setQuickWeights] = useState<
    Record<string, { kg: string; reps: string }>
  >({});
  const [weightModalEx, setWeightModalEx] = useState<Exercise | null>(null);
  const [showRpeModal, setShowRpeModal] = useState(false);

  // Load from Supabase only when arriving via direct URL (store is empty)
  const needsLoad = !currentDay;
  const { workoutDay } = useActiveDayExercises(
    needsLoad ? (dayId ?? null) : null,
  );

  useEffect(() => {
    if (needsLoad && workoutDay) {
      startWorkout(workoutDay);
    }
  }, [workoutDay, needsLoad, startWorkout]);

  const workout = currentDay ?? workoutDay;

  const handleStartAll = () => {
    goToExercise(0);
    navigate(`/entrenamiento/dia/${dayId}/ejercicio/1`);
  };

  // Loading state — shown when navigating directly via URL bookmark
  if (!workout) {
    return (
      <div className="flex flex-col bg-[#f7f9fc] dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 pt-12 pb-4 safe-area-pt animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-24 rounded-lg bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        </div>
        <div className="flex-1 px-4 py-4 space-y-2 max-w-lg mx-auto w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#f7f9fc] dark:bg-slate-950">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 pt-12 pb-4 safe-area-pt">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate("/entrenamiento")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-0.5">
              DÍA {workout.id}
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex gap-3">
          {[
            {
              icon: "exercise",
              text: `${workout.exercises.length} ejercicios`,
            },
          ].map((m) => (
            <span
              key={m.text}
              className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
            >
              <span className="material-symbols-outlined text-[13px] text-slate-400">
                {m.icon}
              </span>
              {m.text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Exercise list ─────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-4 space-y-2 max-w-lg mx-auto w-full">
        {workout.exercises.map((exercise, index) => {
          const hasWeight =
            exercise.writeWeight &&
            exercise.sets.some((_, si) => {
              const entry = quickWeights[`${exercise.id}-${si}`];
              return entry && (entry.kg || entry.reps);
            });
          return (
            <div
              key={exercise.id}
              className="w-full flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm text-left group"
            >
              {/* Number */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">
                  {index + 1}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                  {exercise.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {exercise.sets?.length ?? 0} series
                  {exercise.sets?.[0]?.targetReps &&
                    ` × ${exercise.sets[0].targetReps} reps`}
                  {exercise.sets?.[0]?.targetWeight
                    ? ` @ ${exercise.sets[0].targetWeight}kg`
                    : ""}
                </p>
              </div>

              {/* Weight button */}
              {exercise.writeWeight && (
                <button
                  onClick={() => setWeightModalEx(exercise)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all shrink-0",
                    hasWeight
                      ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-primary/40 hover:text-primary",
                  )}
                >
                  {hasWeight ? (
                    <>
                      <CheckCircle2 size={12} strokeWidth={2.5} />
                      Peso ✓
                    </>
                  ) : (
                    <>
                      <Pencil size={12} strokeWidth={2} />
                      Peso
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Sticky CTA ───────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-3 safe-area-pb space-y-2">
        <button
          onClick={() => setShowRpeModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm py-4 rounded-2xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all min-h-[52px]"
        >
          <span className="material-symbols-outlined text-[18px] filled">
            save
          </span>
          Registrar RPE y Guardar
        </button>
        <button
          onClick={handleStartAll}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-[0.98] transition-all min-h-[52px]"
        >
          <span className="material-symbols-outlined text-[20px] filled">
            play_arrow
          </span>
          COMENZAR RUTINA (GO)
        </button>
      </div>

      {/* ── Weight Input Bottom Sheet ────────────────────────────── */}
      {weightModalEx && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setWeightModalEx(null)}
        >
          <div
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl p-5 space-y-4 animate-slide-up safe-area-pb"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {weightModalEx.name}
              </h3>
              <button
                onClick={() => setWeightModalEx(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {weightModalEx.sets.map((set, i) => {
                const key = `${weightModalEx.id}-${i}`;
                const entry = quickWeights[key] || { kg: "", reps: "" };
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Serie {i + 1}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Objetivo: {set.targetReps} reps ×{" "}
                        {set.targetWeight || "—"} kg
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">
                          Reps realizadas
                        </label>
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder={set.targetReps || "Reps"}
                          value={entry.reps}
                          onChange={(e) =>
                            setQuickWeights((prev) => ({
                              ...prev,
                              [key]: { ...entry, reps: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">
                          Peso usado (kg)
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder={set.targetWeight?.toString() || "Kg"}
                          value={entry.kg}
                          onChange={(e) =>
                            setQuickWeights((prev) => ({
                              ...prev,
                              [key]: { ...entry, kg: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setWeightModalEx(null)}
              className="w-full bg-primary text-white font-bold text-sm py-3.5 rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {/* ── Quick Save Modal ──────────────────────────────────────── */}
      {assignmentId && currentDayNumber && (
        <QuickSaveModal
          isOpen={showRpeModal}
          onClose={() => setShowRpeModal(false)}
          workoutDay={workout}
          quickWeights={quickWeights}
          assignmentId={assignmentId}
          dayNumber={currentDayNumber}
          onSuccess={() => {
            setQuickWeights({});
            setShowRpeModal(false);
          }}
        />
      )}
    </div>
  );
}
