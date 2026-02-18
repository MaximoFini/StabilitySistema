// ─── Training domain types ────────────────────────────────────────────────

export type ExerciseCategory = 'Compuesto' | 'Aislamiento'

export interface ExerciseSet {
  setNumber: number
  targetReps: string // e.g. "10" | "8-12"
  targetWeight?: number // kg
}

export interface Exercise {
  id: number
  name: string
  category: ExerciseCategory
  sets: ExerciseSet[]
  restSeconds: number
  videoUrl?: string
  instructions?: string
}

export interface WorkoutDay {
  id: number
  name: string // e.g. "Piernas e Hipertrofia"
  durationMinutes: number
  exercises: Exercise[]
}

export interface TrainingPlan {
  id: string
  name: string // e.g. "Mesociclo Hipertrofia"
  days: WorkoutDay[]
}

export interface SeriesLogEntry {
  kg: string
  reps: string
  done: boolean
}

// Keyed by `${exerciseId}-${setIndex}`
export type SeriesLog = Record<string, SeriesLogEntry>
