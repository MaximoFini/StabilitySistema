import { create } from "zustand";
import type { WorkoutDay, SeriesLog } from "../types";

// ─── Static placeholder data (until Supabase integration) ────────────────

export const MOCK_PLAN: WorkoutDay = {
  id: 1,
  name: "Piernas e Hipertrofia",
  durationMinutes: 60,
  exercises: [
    {
      id: 1,
      name: "Sentadilla con Barra",
      category: "Compuesto",
      restSeconds: 90,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      instructions:
        "Coloca la barra sobre los trapecios. Pies al ancho de hombros, pies ligeramente hacia afuera. Baja controlando la rodilla sobre el pie, hasta que los muslos estén paralelos al suelo. Sube empujando el suelo, mantén el pecho arriba.",
      sets: [
        { setNumber: 1, targetReps: "10", targetWeight: 60 },
        { setNumber: 2, targetReps: "10", targetWeight: 60 },
        { setNumber: 3, targetReps: "8", targetWeight: 65 },
        { setNumber: 4, targetReps: "8", targetWeight: 65 },
      ],
    },
    {
      id: 2,
      name: "Prensa de Pierna",
      category: "Compuesto",
      restSeconds: 90,
      instructions:
        "Ajusta el asiento para que las rodillas queden a 90°. Empuja la plataforma sin bloquear las rodillas. Baja controlado hasta 90° de flexión.",
      sets: [
        { setNumber: 1, targetReps: "12", targetWeight: 120 },
        { setNumber: 2, targetReps: "12", targetWeight: 120 },
        { setNumber: 3, targetReps: "10", targetWeight: 130 },
      ],
    },
    {
      id: 3,
      name: "Extensión de Cuádriceps",
      category: "Aislamiento",
      restSeconds: 60,
      instructions:
        "Siéntate con la espalda apoyada. Extiende las piernas completamente contrayendo el cuádriceps. Baja controlado sin que el peso caiga.",
      sets: [
        { setNumber: 1, targetReps: "15", targetWeight: 40 },
        { setNumber: 2, targetReps: "15", targetWeight: 40 },
        { setNumber: 3, targetReps: "12", targetWeight: 45 },
      ],
    },
    {
      id: 4,
      name: "Curl de Femoral Tumbado",
      category: "Aislamiento",
      restSeconds: 60,
      instructions:
        "Túmbate boca abajo. Lleva los talones hacia los glúteos contrayendo los isquiotibiales. Baja de forma controlada sin que las caderas se levanten.",
      sets: [
        { setNumber: 1, targetReps: "15", targetWeight: 30 },
        { setNumber: 2, targetReps: "15", targetWeight: 30 },
        { setNumber: 3, targetReps: "12", targetWeight: 35 },
      ],
    },
    {
      id: 5,
      name: "Elevación de Gemelos de Pie",
      category: "Aislamiento",
      restSeconds: 60,
      instructions:
        "Colócate en el borde de un escalón. Sube en puntillas contrayendo los gemelos. Baja hasta sentir el estiramiento. Mantén el control en todo momento.",
      sets: [
        { setNumber: 1, targetReps: "20", targetWeight: 0 },
        { setNumber: 2, targetReps: "20", targetWeight: 0 },
        { setNumber: 3, targetReps: "20", targetWeight: 0 },
      ],
    },
  ],
};

// ─── Store ────────────────────────────────────────────────────────────────

export type WorkoutMood = "excelente" | "normal" | "fatigado" | "molestia";
export type MoodValue = "happy" | "neutral" | "sad";

interface TrainingState {
  currentDay: WorkoutDay | null;
  currentExerciseIndex: number;
  seriesLog: SeriesLog;
  restSecondsLeft: number | null;
  rpe: number | null;
  initialMood: MoodValue | null;   // mood ANTES de entrenar (happy/neutral/sad)
  mood: WorkoutMood | null;        // mood FINAL post-entrenamiento
  moodComment: string;
  pendingDayId: string | null; // dayId waiting after mood selection
  isWorkoutComplete: boolean;
  assignmentId: string | null;
  currentDayNumber: number;

  // Actions
  startWorkout: (day?: WorkoutDay) => void;
  setAssignmentContext: (assignmentId: string, dayNumber: number) => void;
  setPendingDayId: (dayId: string) => void;
  goToExercise: (index: number) => void;
  nextExercise: () => void;
  updateSeriesLog: (key: string, field: "kg" | "reps", value: string) => void;
  markSetDone: (key: string) => void;
  startRestTimer: (seconds: number) => void;
  tickTimer: () => void;
  cancelTimer: () => void;
  setRpe: (value: number) => void;
  setInitialMood: (value: MoodValue) => void;
  setMood: (value: WorkoutMood) => void;
  setMoodComment: (value: string) => void;
  completeWorkout: () => void;
  resetTraining: () => void;
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
  currentDay: null,
  currentExerciseIndex: 0,
  seriesLog: {},
  restSecondsLeft: null,
  rpe: null,
  initialMood: null,
  mood: null,
  moodComment: "",
  pendingDayId: null,
  isWorkoutComplete: false,
  assignmentId: null,
  currentDayNumber: 1,

  startWorkout: (day = MOCK_PLAN) => {
    // NOTE: initialMood is intentionally NOT reset here — it was set before
    // navigating here from MoodCheckScreen and must persist until saveCompletion.
    set({
      currentDay: day,
      currentExerciseIndex: 0,
      seriesLog: {},
      restSecondsLeft: null,
      rpe: null,
      mood: null,
      moodComment: "",
      isWorkoutComplete: false,
    });
  },

  setAssignmentContext: (assignmentId, dayNumber) => {
    set({ assignmentId, currentDayNumber: dayNumber });
  },

  setPendingDayId: (dayId) => {
    set({ pendingDayId: dayId });
  },

  goToExercise: (index) => {
    set({ currentExerciseIndex: index, restSecondsLeft: null });
  },

  nextExercise: () => {
    const { currentDay, currentExerciseIndex } = get();
    if (!currentDay) return;
    const next = currentExerciseIndex + 1;
    if (next >= currentDay.exercises.length) {
      set({ isWorkoutComplete: true, restSecondsLeft: null });
    } else {
      set({ currentExerciseIndex: next, restSecondsLeft: null });
    }
  },

  updateSeriesLog: (key, field, value) => {
    set((state) => ({
      seriesLog: {
        ...state.seriesLog,
        [key]: {
          ...state.seriesLog[key],
          kg: state.seriesLog[key]?.kg ?? "",
          reps: state.seriesLog[key]?.reps ?? "",
          done: state.seriesLog[key]?.done ?? false,
          [field]: value,
        },
      },
    }));
  },

  markSetDone: (key) => {
    set((state) => ({
      seriesLog: {
        ...state.seriesLog,
        [key]: {
          ...state.seriesLog[key],
          kg: state.seriesLog[key]?.kg ?? "",
          reps: state.seriesLog[key]?.reps ?? "",
          done: true,
        },
      },
    }));
  },

  startRestTimer: (seconds) => {
    set({ restSecondsLeft: seconds });
  },

  tickTimer: () => {
    const { restSecondsLeft } = get();
    if (restSecondsLeft === null) return;
    if (restSecondsLeft <= 1) {
      set({ restSecondsLeft: null });
    } else {
      set({ restSecondsLeft: restSecondsLeft - 1 });
    }
  },

  cancelTimer: () => {
    set({ restSecondsLeft: null });
  },

  setRpe: (value) => set({ rpe: value }),

  setInitialMood: (value) => set({ initialMood: value }),

  setMood: (value) => set({ mood: value }),

  setMoodComment: (value) => set({ moodComment: value }),

  completeWorkout: () => set({ isWorkoutComplete: true }),

  resetTraining: () => {
    set({
      currentDay: null,
      currentExerciseIndex: 0,
      seriesLog: {},
      restSecondsLeft: null,
      rpe: null,
      initialMood: null,
      mood: null,
      moodComment: "",
      pendingDayId: null,
      isWorkoutComplete: false,
      assignmentId: null,
      currentDayNumber: 1,
    });
  },
}));
