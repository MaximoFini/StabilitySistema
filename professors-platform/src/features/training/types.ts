// ─── Training domain types ────────────────────────────────────────────────

// Acepta cualquier nombre de etapa que venga de la base de datos (Compuesto, Aislamiento, Activación, etc.)
export type ExerciseCategory = string;

export interface ExerciseSet {
  setNumber: number;
  targetReps: string; // e.g. "10" | "8-12"
  targetWeight?: number; // kg
}

export interface Exercise {
  id: string | number;
  name: string;
  category: ExerciseCategory;
  sets: ExerciseSet[];
  restSeconds: number;
  videoUrl?: string;
  instructions?: string;
  writeWeight?: boolean;
}

export interface WorkoutDay {
  id: string | number;
  name: string; // e.g. "Piernas e Hipertrofia"
  durationMinutes: number;
  exercises: Exercise[];
}

export interface TrainingPlan {
  id: string;
  name: string; // e.g. "Mesociclo Hipertrofia"
  days: WorkoutDay[];
}

export interface SeriesLogEntry {
  kg: string;
  reps: string;
  done: boolean;
}

// Keyed by `${exerciseId}-${setIndex}`
export type SeriesLog = Record<string, SeriesLogEntry>;
