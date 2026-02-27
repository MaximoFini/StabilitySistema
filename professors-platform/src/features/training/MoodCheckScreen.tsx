import { useParams, useNavigate } from "react-router-dom";
import { useTrainingStore } from "@/features/training/store/trainingStore";
import { useActiveDayExercises } from "@/hooks/useActiveDayExercises";
import type { MoodValue } from "@/features/training/store/trainingStore";
import { cn } from "@/lib/utils";

// ── Mood options ───────────────────────────────────────────────────────────

const MOODS: {
  value: MoodValue;
  emoji: string;
  label: string;
  description: string;
  colorClass: string;
}[] = [
    {
      value: "happy",
      emoji: "😊",
      label: "Feliz",
      description: "Con energía y buen ánimo",
      colorClass: "emerald",
    },
    {
      value: "neutral",
      emoji: "😐",
      label: "Normal",
      description: "Sin nada en particular",
      colorClass: "blue",
    },
    {
      value: "sad",
      emoji: "😢",
      label: "Bajo",
      description: "Poca energía o motivación",
      colorClass: "amber",
    },
  ];

// ── Component ──────────────────────────────────────────────────────────────

export default function MoodCheckScreen() {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const { setInitialMood, startWorkout } = useTrainingStore();

  const { workoutDay } = useActiveDayExercises(dayId ?? null);

  const handleMoodSelect = (mood: MoodValue) => {
    if (!workoutDay) return;
    setInitialMood(mood);
    startWorkout(workoutDay);
    navigate("/entrenamiento/dia/" + dayId);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-slate-950 items-center w-full transition-colors duration-300">
      <div className="flex flex-col items-center max-w-lg w-full px-6 pt-16 pb-12">
        {/* ── Logo ────────────────────────────────────────────── */}
        <div className="bg-white/95 dark:bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100/50 flex items-center justify-center mb-10 transform hover:scale-105 transition-all duration-500">
          <img
            src="/logo-stability.png"
            alt="Stability Logo"
            className="w-32 h-auto object-contain drop-shadow-sm"
          />
        </div>

        {/* ── Title ────────────────────────────────────────────── */}
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white tracking-tight leading-tight">
          ¿Cómo te sentís hoy?
        </h1>
        <p className="mt-3 text-sm text-center text-slate-500 dark:text-slate-400 max-w-[260px] leading-relaxed">
          Un breve registro de tu energía antes de empezar a entrenar.
        </p>

        {/* ── Mood buttons ─────────────────────────────────────── */}
        <div className="w-full mt-12 flex flex-col gap-4">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={cn(
                "group w-full flex items-center gap-5 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200",
                "hover:border-primary/30 hover:shadow-md active:scale-[0.98]",
                "dark:hover:bg-slate-800/80"
              )}
            >
              {/* Emoji container */}
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 select-none shadow-inner">
                {mood.emoji}
              </div>

              {/* Text info */}
              <div className="text-left flex-1 min-w-0">
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {mood.label}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
                  {mood.description}
                </p>
              </div>

              {/* Arrow */}
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[20px] group-hover:text-primary group-hover:translate-x-1 transition-all">
                arrow_forward_ios
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
