import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrainingStore } from "@/features/training/store/trainingStore";
import { cn } from "@/lib/utils";

// ─── Rest Timer Component ─────────────────────────────────────────────────

function RestTimer({
  seconds,
  onDone,
  onCancel,
}: {
  seconds: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          onDone();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds, onDone]);

  const pct = (remaining / seconds) * 100;

  return (
    <div className="flex flex-col items-center gap-3 bg-slate-900 rounded-2xl p-5 my-2">
      {/* Circular progress */}
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#1e293b"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#0056b2"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white tabular-nums">
            {remaining}
          </span>
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-300">Descansando…</p>

      <button
        onClick={onCancel}
        className="text-xs font-bold text-slate-400 hover:text-white underline underline-offset-2 transition-colors min-h-[36px] px-4"
      >
        Saltar descanso
      </button>
    </div>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────

export default function ExerciseDetail() {
  const navigate = useNavigate();
  const { exerciseNum } = useParams<{ exerciseNum: string }>();
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [restingAfterSet, setRestingAfterSet] = useState<number | null>(null);

  const {
    currentDay,
    currentExerciseIndex,
    seriesLog,
    startWorkout,
    goToExercise,
    updateSeriesLog,
    markSetDone,
    nextExercise,
    isWorkoutComplete,
  } = useTrainingStore();

  // Derive exercise index from URL param (1-based)
  const paramIndex = exerciseNum ? parseInt(exerciseNum, 10) - 1 : 0;

  // If store has no workout, bootstrap from mock
  useEffect(() => {
    if (!currentDay) {
      import("@/features/training/store/trainingStore").then(
        ({ MOCK_PLAN }) => {
          startWorkout(MOCK_PLAN);
          goToExercise(paramIndex);
        },
      );
    } else if (currentExerciseIndex !== paramIndex) {
      goToExercise(paramIndex);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if workout is complete
  useEffect(() => {
    if (isWorkoutComplete) {
      navigate("/entrenamiento/completado", { replace: true });
    }
  }, [isWorkoutComplete, navigate]);

  const exercise = currentDay?.exercises[paramIndex];
  const totalExercises = currentDay?.exercises.length ?? 0;

  if (!exercise) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <span className="material-symbols-outlined text-[40px]">
            fitness_center
          </span>
          <p className="text-sm font-medium">Cargando ejercicio…</p>
        </div>
      </div>
    );
  }

  const handleFinishWorkout = () => {
    navigate("/entrenamiento", { replace: true });
  };

  const handleNextExercise = () => {
    setRestingAfterSet(null);
    nextExercise();
    const nextIndex = paramIndex + 1;
    if (nextIndex < totalExercises) {
      navigate(`/entrenamiento/dia/1/ejercicio/${nextIndex + 1}`, {
        replace: true,
      });
    }
    // isWorkoutComplete will redirect via useEffect
  };

  const handleSetRest = (setIndex: number) => {
    const key = `${exercise.id}-${setIndex}`;
    markSetDone(key);
    setRestingAfterSet(setIndex);
  };

  const handleRestDone = () => {
    setRestingAfterSet(null);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc] dark:bg-slate-950">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 pt-12 pb-4 safe-area-pt">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/entrenamiento/dia/1")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-0.5">
              Día 1: {currentDay?.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ejercicio {paramIndex + 1} de {totalExercises}
            </p>
          </div>

          <button
            onClick={handleFinishWorkout}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[15px]">
              stop_circle
            </span>
            Finalizar
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mt-4">
          {Array.from({ length: totalExercises }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full flex-1 transition-all",
                i < paramIndex
                  ? "bg-emerald-400"
                  : i === paramIndex
                    ? "bg-primary"
                    : "bg-slate-200 dark:bg-slate-700",
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-28">
        {/* Exercise title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {exercise.name}
          </h1>
          <span
            className={cn(
              "inline-flex mt-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border",
              exercise.category === "Compuesto"
                ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                : "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
            )}
          >
            {exercise.category}
          </span>
        </div>

        {/* Video link */}
        {exercise.videoUrl && (
          <a
            href={exercise.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline min-h-[40px]"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
              <span className="material-symbols-outlined text-[16px] filled text-primary">
                play_circle
              </span>
            </span>
            Ver video de ejecución
            <span className="material-symbols-outlined text-[14px] text-slate-400">
              open_in_new
            </span>
          </a>
        )}

        {/* Instructions accordion */}
        {exercise.instructions && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <button
              onClick={() => setInstructionsOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 min-h-[52px] text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-primary filled">
                  menu_book
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Ver instrucciones del Coach
                </span>
              </div>
              <span
                className={cn(
                  "material-symbols-outlined text-[20px] text-slate-400 transition-transform",
                  instructionsOpen && "rotate-180",
                )}
              >
                expand_more
              </span>
            </button>

            {instructionsOpen && (
              <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-3">
                  {exercise.instructions}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Series table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_5rem_5rem] gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
            <span />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Objetivo
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
              KG
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
              REPS
            </span>
          </div>

          {/* Series rows interleaved with rest timers */}
          <div>
            {exercise.sets.map((set, setIndex) => {
              const key = `${exercise.id}-${setIndex}`;
              const log = seriesLog[key];
              const isDone = log?.done ?? false;
              const isResting = restingAfterSet === setIndex;

              return (
                <div key={setIndex}>
                  {/* Row */}
                  <div
                    className={cn(
                      "grid grid-cols-[2rem_1fr_5rem_5rem] gap-2 items-center px-4 py-3 border-b border-slate-50 dark:border-slate-800/60 last:border-none transition-colors",
                      isDone && "bg-emerald-50/50 dark:bg-emerald-900/10",
                    )}
                  >
                    {/* Set number with done indicator */}
                    <div className="flex items-center justify-center">
                      {isDone ? (
                        <span className="material-symbols-outlined text-[18px] text-emerald-500 filled">
                          check_circle
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-slate-400">
                          {set.setNumber}
                        </span>
                      )}
                    </div>

                    {/* Target */}
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {set.targetReps} reps
                        {set.targetWeight ? ` @ ${set.targetWeight}kg` : ""}
                      </p>
                    </div>

                    {/* KG input */}
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder={
                        set.targetWeight ? String(set.targetWeight) : "—"
                      }
                      value={log?.kg ?? ""}
                      onChange={(e) =>
                        updateSeriesLog(key, "kg", e.target.value)
                      }
                      className={cn(
                        "w-full text-center text-sm font-bold rounded-xl border px-2 py-2 min-h-[40px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all",
                        isDone && "border-emerald-200 dark:border-emerald-800",
                      )}
                    />

                    {/* Reps input */}
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder={set.targetReps}
                      value={log?.reps ?? ""}
                      onChange={(e) =>
                        updateSeriesLog(key, "reps", e.target.value)
                      }
                      className={cn(
                        "w-full text-center text-sm font-bold rounded-xl border px-2 py-2 min-h-[40px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all",
                        isDone && "border-emerald-200 dark:border-emerald-800",
                      )}
                    />
                  </div>

                  {/* Rest button / timer — shown between sets (not after last) */}
                  {setIndex < exercise.sets.length - 1 && (
                    <div className="px-4 py-2">
                      {isResting ? (
                        <RestTimer
                          seconds={exercise.restSeconds}
                          onDone={handleRestDone}
                          onCancel={handleRestDone}
                        />
                      ) : (
                        <button
                          onClick={() => handleSetRest(setIndex)}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide transition-all min-h-[40px] border",
                            isDone
                              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 hover:text-primary",
                          )}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            timer
                          </span>
                          DESCANSO: {exercise.restSeconds}s
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Sticky next exercise button ──────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-3 safe-area-pb">
        <button
          onClick={handleNextExercise}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-[0.98] transition-all min-h-[52px]"
        >
          {paramIndex + 1 < totalExercises ? (
            <>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
              Siguiente Ejercicio ({paramIndex + 1}/{totalExercises - 1}{" "}
              restantes)
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px] filled">
                emoji_events
              </span>
              Finalizar Entrenamiento
            </>
          )}
        </button>
      </div>
    </div>
  );
}
