import { useParams, useNavigate } from "react-router-dom";
import { useTrainingStore } from "@/features/training/store/trainingStore";
import { useActiveDayExercises } from "@/hooks/useActiveDayExercises";
import { useAvailableDays } from "@/hooks/useAvailableDays";
import { useActiveAssignment } from "@/hooks/useActiveAssignment";
import type { MoodValue } from "@/features/training/store/trainingStore";

// ── Mood options ───────────────────────────────────────────────────────────

const MOODS: {
  value: MoodValue;
  emoji: string;
  label: string;
  description: string;
  bg: string;
  border: string;
  text: string;
  shadow: string;
}[] = [
  {
    value: "happy",
    emoji: "😊",
    label: "Feliz",
    description: "Energía y ánimo alto",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-300 dark:border-emerald-600",
    text: "text-emerald-700 dark:text-emerald-400",
    shadow: "shadow-emerald-200 dark:shadow-emerald-900/40",
  },
  {
    value: "neutral",
    emoji: "😐",
    label: "Neutro",
    description: "Sin nada particular",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-300 dark:border-blue-600",
    text: "text-blue-700 dark:text-blue-400",
    shadow: "shadow-blue-200 dark:shadow-blue-900/40",
  },
  {
    value: "sad",
    emoji: "😢",
    label: "Triste",
    description: "Poca energía o motivación",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-300 dark:border-amber-600",
    text: "text-amber-700 dark:text-amber-400",
    shadow: "shadow-amber-200 dark:shadow-amber-900/40",
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function MoodCheckScreen() {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const { setMood, startWorkout, assignmentId, currentDayNumber } =
    useTrainingStore();

  const { assignment } = useActiveAssignment();
  const { days: availableDays } = useAvailableDays(assignment?.planId ?? null);
  const { workoutDay } = useActiveDayExercises(dayId ?? null);

  const handleMoodSelect = (mood: MoodValue) => {
    if (!workoutDay) return;

    // Find day number for the selected dayId
    const dayNumber =
      availableDays.find((d) => d.id === dayId)?.dayNumber ??
      assignment?.currentDayNumber ??
      currentDayNumber;

    setMood(mood);
    startWorkout(workoutDay);
    navigate("/entrenamiento/dia/" + dayId);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc] dark:bg-slate-950 px-4 pt-10 pb-8 items-center max-w-lg mx-auto w-full">
      {/* ── Icon ────────────────────────────────────────────── */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center shadow-xl shadow-blue-300/40 dark:shadow-blue-900/30 mb-6">
        <span className="material-symbols-outlined text-white text-[38px] filled">
          sentiment_satisfied
        </span>
      </div>

      {/* ── Title ────────────────────────────────────────────── */}
      <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white tracking-tight">
        ¿Cómo te sentís hoy?
      </h1>
      <p className="mt-2 text-sm text-center text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
        Registramos tu estado anímico antes de entrenar para ayudarte a seguir
        tu progreso.
      </p>

      {/* ── Mood buttons ─────────────────────────────────────── */}
      <div className="w-full mt-10 flex flex-col gap-4">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 ${mood.bg} ${mood.border} shadow-lg ${mood.shadow} active:scale-[0.97] transition-all hover:brightness-95`}
          >
            <span className="text-5xl leading-none select-none">
              {mood.emoji}
            </span>
            <div className="text-left">
              <p className={`text-lg font-bold ${mood.text}`}>{mood.label}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {mood.description}
              </p>
            </div>
            <span
              className={`material-symbols-outlined ml-auto text-[20px] ${mood.text}`}
            >
              arrow_forward_ios
            </span>
          </button>
        ))}
      </div>

      {/* ── Skip ─────────────────────────────────────────────── */}
      <button
        onClick={() => handleMoodSelect("neutral")}
        className="mt-6 text-xs text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
      >
        Saltar este paso
      </button>
    </div>
  );
}
