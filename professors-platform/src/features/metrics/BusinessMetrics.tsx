import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";

// --- Loading Skeleton ---
function MetricCardSkeleton() {
  return (
    <div className="bg-white dark:bg-surface-light rounded-xl p-6 shadow-card border border-gray-200 dark:border-border-light h-32 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 bg-gray-200 rounded w-32" />
        <div className="h-8 w-8 bg-gray-200 rounded-md" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-16" />
    </div>
  );
}

// --- Growth Badge ---
function GrowthBadge({ percent }: { percent: number | null }) {
  if (percent === null) {
    return (
      <span className="flex items-center text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
        <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
        Nuevo
      </span>
    );
  }
  if (percent > 0) {
    return (
      <span className="flex items-center text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
        <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
        +{percent}%
      </span>
    );
  }
  if (percent < 0) {
    return (
      <span className="flex items-center text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
        <span className="material-symbols-outlined text-[14px] mr-0.5">trending_down</span>
        {percent}%
      </span>
    );
  }
  return (
    <span className="flex items-center text-xs font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
      0%
    </span>
  );
}

// --- Donut Chart ---
const CIRCUMFERENCE = 2 * Math.PI * 40;

function DonutChart({
  genderDistribution,
  total,
}: {
  genderDistribution: { label: string; count: number; percent: number; color: string; stroke: string; dashArray: string; dashOffset: string }[];
  total: number;
}) {
  const hasData = total > 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* background track */}
          <circle cx="50" cy="50" fill="none" r="40" stroke="#f3f4f6" strokeWidth="10" />

          {hasData ? (
            genderDistribution.map((seg) => (
              <circle
                key={seg.label}
                cx="50"
                cy="50"
                fill="none"
                r="40"
                stroke={seg.stroke}
                strokeWidth="10"
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="round"
              />
            ))
          ) : (
            <circle
              cx="50" cy="50" fill="none" r="40"
              stroke="#e5e7eb" strokeWidth="10"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-gray-400">Total</span>
          <span className="text-4xl font-bold text-gray-900 tracking-tight">{total}</span>
        </div>
      </div>

      {hasData ? (
        <div className="flex items-center justify-center gap-6 w-full flex-wrap">
          {genderDistribution.map((seg, idx) => (
            <div key={seg.label} className="flex flex-col items-center">
              {idx > 0 && (
                <div className="hidden" /> // spacer (divider handled by gap)
              )}
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: seg.stroke }} />
                <span className="text-sm font-medium text-gray-600">{seg.label}</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{seg.percent}%</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center">Sin datos de género registrados</p>
      )}
    </div>
  );
}

// --- Main Component ---
export default function BusinessMetrics() {
  const { metrics, isLoading, error } = useBusinessMetrics();

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative">
      <header className="h-16 bg-white dark:bg-surface-light border-b border-gray-200 dark:border-border-light flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métricas del Negocio</h1>
          <p className="text-xs text-gray-500 mt-0.5">Visión general del rendimiento de tu gimnasio</p>
        </div>
        {!isLoading && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">fiber_manual_record</span>
            Datos en tiempo real
          </span>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <span className="material-symbols-outlined text-red-400 text-5xl mb-3">error_outline</span>
            <p className="text-gray-600 font-medium">No se pudieron cargar las métricas</p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto flex flex-col gap-8">

            {/* Top metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Alumnos Activos */}
              {isLoading ? <MetricCardSkeleton /> : (
                <div className="bg-white dark:bg-surface-light rounded-xl p-6 shadow-card border border-gray-200 dark:border-border-light flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Alumnos Activos</span>
                    <span className="material-symbols-outlined text-primary bg-blue-50 p-1.5 rounded-md text-[20px]">groups</span>
                  </div>
                  <div className="relative z-10">
                    <span className="text-3xl font-bold text-gray-900">{metrics?.activeStudents ?? 0}</span>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/5 rounded-full group-hover:scale-110 transition-transform" />
                </div>
              )}

              {/* Nuevos este Mes */}
              {isLoading ? <MetricCardSkeleton /> : (
                <div className="bg-white dark:bg-surface-light rounded-xl p-6 shadow-card border border-gray-200 dark:border-border-light flex flex-col justify-between h-32 relative overflow-hidden group hover:border-green-200 transition-all">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nuevos este Mes</span>
                    <GrowthBadge percent={metrics?.growthPercent ?? 0} />
                  </div>
                  <div className="relative z-10">
                    <span className="text-3xl font-bold text-gray-900">
                      {(metrics?.newThisMonth ?? 0) > 0 ? `+${metrics!.newThisMonth}` : metrics?.newThisMonth ?? 0}
                    </span>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-green-500/5 rounded-full group-hover:scale-110 transition-transform" />
                </div>
              )}

              {/* Promedio de Edad */}
              {isLoading ? <MetricCardSkeleton /> : (
                <div className="bg-white dark:bg-surface-light rounded-xl p-6 shadow-card border border-gray-200 dark:border-border-light flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Promedio de Edad</span>
                    <span className="material-symbols-outlined text-gray-500 bg-gray-50 p-1.5 rounded-md text-[20px]">cake</span>
                  </div>
                  <div className="relative z-10">
                    {metrics?.averageAge != null ? (
                      <span className="text-3xl font-bold text-gray-900">
                        {metrics.averageAge} <span className="text-base font-medium text-gray-500">años</span>
                      </span>
                    ) : (
                      <span className="text-3xl font-bold text-gray-400">—</span>
                    )}
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gray-500/5 rounded-full group-hover:scale-110 transition-transform" />
                </div>
              )}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Goals bar chart */}
              <div className="lg:col-span-8 bg-white dark:bg-surface-light rounded-xl shadow-card border border-gray-200 dark:border-border-light p-6 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Objetivos de Alumnos</h2>
                    <p className="text-sm text-gray-500">Distribución de metas principales de entrenamiento</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col gap-6 flex-1 justify-center animate-pulse">
                    {[80, 50, 35, 20].map((w, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <div className="h-3 bg-gray-200 rounded w-28" />
                          <div className="h-3 bg-gray-200 rounded w-16" />
                        </div>
                        <div className="w-full h-4 bg-gray-100 rounded-full">
                          <div className="h-full bg-gray-200 rounded-full" style={{ width: `${w}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : metrics?.goalDistribution && metrics.goalDistribution.length > 0 ? (
                  <div className="flex flex-col gap-6 flex-1 justify-center">
                    {metrics.goalDistribution.map((goal) => {
                      const widthPct = Math.max(4, Math.round((goal.count / metrics.maxGoalCount) * 100));
                      return (
                        <div key={goal.key} className="group">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-gray-700">{goal.label}</span>
                            <span className="font-bold text-gray-900">
                              {goal.count} {goal.count === 1 ? "alumno" : "alumnos"}
                            </span>
                          </div>
                          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${widthPct}%`, backgroundColor: goal.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                    <span className="material-symbols-outlined text-gray-300 text-4xl mb-2">bar_chart</span>
                    <p className="text-gray-400 text-sm">Sin datos de objetivos registrados</p>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="lg:col-span-4 flex flex-col gap-6">

                {/* Gender donut */}
                <div className="bg-white dark:bg-surface-light rounded-xl shadow-card border border-gray-200 dark:border-border-light p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Distribución por Género</h2>
                  {isLoading ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <div className="w-48 h-48 rounded-full bg-gray-200 mb-6" />
                      <div className="flex gap-8">
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ) : (
                    <DonutChart
                      genderDistribution={metrics?.genderDistribution ?? []}
                      total={metrics?.totalStudentsForGender ?? 0}
                    />
                  )}
                </div>

                {/* Retention card — "Próximamente" */}
                <div className="bg-white dark:bg-surface-light rounded-xl shadow-card border border-gray-200 dark:border-border-light p-6 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">Retención de Clientes</h3>
                    <div className="relative group/tooltip">
                      <span className="material-symbols-outlined text-gray-400 cursor-pointer">info</span>
                      <div className="absolute right-0 top-6 z-30 hidden group-hover/tooltip:block w-56 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-xl leading-relaxed">
                        El Churn Rate indica qué porcentaje de alumnos se dan de baja en un mes. Estará disponible cuando se implemente el campo de estado de alumnos.
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
                    <span className="material-symbols-outlined text-gray-300 text-3xl">schedule</span>
                    <p className="text-sm font-semibold text-gray-400">Próximamente</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Esta métrica estará disponible cuando se agregue el seguimiento de estado de alumnos.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
