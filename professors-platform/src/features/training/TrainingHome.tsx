import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTrainingStore, MOCK_PLAN } from '@/features/training/store/trainingStore'
import { cn } from '@/lib/utils'

// Decorative gradient overlay for the hero image
const gradientOverlay =
  'linear-gradient(to bottom, rgba(0,86,178,0.55) 0%, rgba(26,26,94,0.90) 100%)'

export default function TrainingHome() {
  const navigate = useNavigate()
  const { professor } = useAuthStore()
  const startWorkout = useTrainingStore((s) => s.startWorkout)

  const firstName = professor?.firstName ?? 'Atleta'
  const today = new Date()
  const dateLabel = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const handleStart = () => {
    startWorkout(MOCK_PLAN)
    navigate('/entrenamiento/dia/1')
  }

  return (
    <div className="min-h-full px-4 pt-6 pb-4 space-y-5 max-w-lg mx-auto">
      {/* ── Header greeting ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize font-medium">
            {dateLabel}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hola, {firstName} 💪
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Tienes un entrenamiento pendiente.
          </p>
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
            <span className="material-symbols-outlined text-white text-[22px] filled">person</span>
          )}
        </div>
      </div>

      {/* ── Hero workout card ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-xl min-h-[220px] flex flex-col justify-end"
        style={{
          background: gradientOverlay + ', url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80") center/cover no-repeat',
        }}
      >
        {/* Badge "En curso" */}
        <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          En curso
        </span>

        {/* Content */}
        <div className="relative p-5 pt-12 text-white space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">
              Tu Entrenamiento de Hoy
            </p>
            <h2 className="text-xl font-bold leading-tight">
              Día 1 — {MOCK_PLAN.name}
            </h2>

            {/* Metadata pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { icon: 'schedule', text: `${MOCK_PLAN.durationMinutes} min` },
                { icon: 'exercise', text: `${MOCK_PLAN.exercises.length} ejercicios` },
              ].map((m) => (
                <span
                  key={m.text}
                  className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium"
                >
                  <span className="material-symbols-outlined text-[13px]">{m.icon}</span>
                  {m.text}
                </span>
              ))}
            </div>
          </div>

          {/* CTA button */}
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2 bg-white text-primary font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-black/20 hover:bg-blue-50 active:scale-[0.98] transition-all min-h-[48px]"
          >
            <span className="material-symbols-outlined text-[18px] filled">play_arrow</span>
            COMENZAR RUTINA
          </button>
        </div>
      </div>

      {/* ── Metrics row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            icon: 'fitness_center',
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-50 dark:bg-blue-900/30',
            value: '12',
            unit: 'este mes',
            label: 'Sesiones completadas',
          },
          {
            icon: 'monitor_weight',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
            value: '78',
            unit: 'kg',
            label: 'Peso actual',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm"
          >
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                stat.iconBg,
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[20px] filled',
                  stat.iconColor,
                )}
              >
                {stat.icon}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {stat.unit}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Weekly progress strip ─────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Esta semana</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">3 / 5 sesiones</span>
        </div>
        <div className="flex gap-1.5">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => {
            const done = [true, true, false, true, false, false, false][i]
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full h-8 rounded-lg transition-all',
                    done
                      ? 'bg-primary shadow-sm shadow-blue-300 dark:shadow-blue-900/40'
                      : 'bg-slate-100 dark:bg-slate-800',
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-semibold',
                    done ? 'text-primary' : 'text-slate-300 dark:text-slate-600',
                  )}
                >
                  {day}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
