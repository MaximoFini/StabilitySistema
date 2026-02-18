import { useNavigate } from 'react-router-dom'
import { useTrainingStore, MOCK_PLAN } from '@/features/training/store/trainingStore'
import { cn } from '@/lib/utils'
import type { ExerciseCategory } from '@/features/training/types'

const categoryStyle: Record<ExerciseCategory, string> = {
  Compuesto:
    'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800',
  Aislamiento:
    'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-800',
}

export default function ExerciseList() {
  const navigate = useNavigate()
  const { startWorkout, goToExercise } = useTrainingStore()
  const workout = MOCK_PLAN

  const handleExerciseClick = (index: number) => {
    startWorkout(workout)
    goToExercise(index)
    navigate(`/entrenamiento/dia/1/ejercicio/${index + 1}`)
  }

  const handleStartAll = () => {
    startWorkout(workout)
    goToExercise(0)
    navigate('/entrenamiento/dia/1/ejercicio/1')
  }

  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)

  return (
    <div className="flex flex-col min-h-full bg-[#f7f9fc] dark:bg-slate-950">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 pt-12 pb-4 safe-area-pt">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/entrenamiento')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-0.5">
              DÍA 1
            </p>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
              {workout.name}
            </h1>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex gap-3">
          {[
            { icon: 'schedule', text: `${workout.durationMinutes} min estimados` },
            { icon: 'exercise', text: `${workout.exercises.length} ejercicios` },
            { icon: 'stacked_line_chart', text: `${totalSets} series` },
          ].map((m) => (
            <span
              key={m.text}
              className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
            >
              <span className="material-symbols-outlined text-[13px] text-slate-400">{m.icon}</span>
              {m.text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Exercise list ─────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-4 space-y-2 max-w-lg mx-auto w-full">
        {workout.exercises.map((exercise, index) => (
          <button
            key={exercise.id}
            onClick={() => handleExerciseClick(index)}
            className="w-full flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-800 active:scale-[0.99] transition-all text-left group"
          >
            {/* Number */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">{index + 1}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border',
                    categoryStyle[exercise.category],
                  )}
                >
                  {exercise.category}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                {exercise.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {exercise.sets.length} series
                {exercise.sets[0].targetReps && ` × ${exercise.sets[0].targetReps} reps`}
                {exercise.sets[0].targetWeight ? ` @ ${exercise.sets[0].targetWeight}kg` : ''}
              </p>
            </div>

            {/* Chevron */}
            <span className="material-symbols-outlined text-[20px] text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors shrink-0">
              chevron_right
            </span>
          </button>
        ))}
      </div>

      {/* ── Sticky CTA ───────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-3 safe-area-pb">
        <button
          onClick={handleStartAll}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-[0.98] transition-all min-h-[52px]"
        >
          <span className="material-symbols-outlined text-[20px] filled">play_arrow</span>
          COMENZAR RUTINA (GO)
        </button>
      </div>
    </div>
  )
}
