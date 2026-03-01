import { useBusinessMetrics, type MonthlyRegistration } from "@/hooks/useBusinessMetrics";

// --- Loading Skeleton ---
function MetricCardSkeleton() {
  return (
    <div className={`bg-white dark:bg-surface-light rounded-xl p-6 shadow-card border border-gray-200 dark:border-border-light h-[156px] animate-pulse`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 bg-gray-200 rounded w-32" />
        <div className="h-8 w-8 bg-gray-200 rounded-md" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
      <div className="h-8 bg-gray-100 rounded w-full mt-auto" />
    </div>
  );
}

// --- Mini Bar Chart ---
function MiniBarChart({ data }: { data: MonthlyRegistration[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const isCurrentMonth = (_idx: number) => _idx === data.length - 1;

  return (
    <div className="w-full mt-2">
      <div className="flex items-end gap-1 h-8">
        {data.map((d, idx) => {
          const heightPct = Math.max(8, Math.round((d.count / maxCount) * 100));
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-0 group/bar relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/bar:flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                  {d.count}
                </div>
                <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[3px] border-transparent border-t-gray-800" />
              </div>
              {/* Barra */}
              <div
                className={`w-full rounded-[2px] transition-all duration-500 ${isCurrentMonth(idx)
                  ? "bg-green-500"
                  : "bg-green-100 group-hover/bar:bg-green-300"
                  }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>
      {/* Etiquetas de meses */}
      <div className="flex gap-1 mt-1">
        {data.map((d, idx) => (
          <span
            key={idx}
            className={`flex-1 text-center text-[9px] font-medium leading-none ${isCurrentMonth(idx) ? "text-green-600 font-bold" : "text-gray-400"
              }`}
          >
            {d.month}
          </span>
        ))}
      </div>
    </div>
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
      <div className="relative w-full aspect-square max-w-[300px] mb-8">
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
          {genderDistribution.map((seg) => (
            <div key={seg.label} className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.stroke }} />
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
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Estadísticas</h1>
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <span className="material-symbols-outlined text-red-400 text-5xl mb-3">error_outline</span>
            <p className="text-gray-600 font-medium">No se pudieron cargar las métricas</p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-8 pb-8">

            {/* Top metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Alumnos Activos */}
              {isLoading ? <MetricCardSkeleton /> : (
                <div className="bg-white dark:bg-surface-light rounded-xl p-6 shadow-card border border-gray-200 dark:border-border-light flex flex-col h-[156px] relative overflow-hidden group hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between relative z-10 mb-2">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Alumnos Activos</span>
                    <span className="material-symbols-outlined text-primary bg-blue-50 p-1.5 rounded-md text-[20px]">groups</span>
                  </div>
                  <div className="relative z-10 mt-auto">
                    <span className="text-4xl font-bold text-gray-900">{metrics?.activeStudents ?? 0}</span>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/5 rounded-full group-hover:scale-110 transition-transform" />
                </div>
              )}

              {/* Nuevos este Mes — con mini gráfico de 6 meses */}
              {isLoading ? <MetricCardSkeleton /> : (
                <div className="bg-white dark:bg-surface-light rounded-xl p-6 shadow-card border border-gray-200 dark:border-border-light flex flex-col h-[156px] relative overflow-hidden group hover:border-green-200 transition-all">
                  <div className="flex items-center justify-between relative z-10 mb-2">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nuevos este Mes</span>
                    <span className="material-symbols-outlined text-green-600 bg-green-50 p-1.5 rounded-md text-[20px]">person_add</span>
                  </div>
                  <div className="flex items-end justify-between relative z-10 mt-auto w-full gap-4">
                    <span className="text-4xl font-bold text-gray-900 leading-none pb-1">
                      {(metrics?.newThisMonth ?? 0) > 0 ? `+${metrics!.newThisMonth}` : metrics?.newThisMonth ?? 0}
                    </span>
                    {/* Mini bar chart: tendencia últimos 6 meses */}
                    {metrics?.monthlyRegistrations && metrics.monthlyRegistrations.length > 0 && (
                      <div className="flex-1 w-full max-w-[140px] ml-auto">
                        <MiniBarChart data={metrics.monthlyRegistrations} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-green-500/5 rounded-full group-hover:scale-110 transition-transform pointer-events-none" />
                </div>
              )}

              {/* Promedio de Edad */}
              {isLoading ? <MetricCardSkeleton /> : (
                <div className="bg-white dark:bg-surface-light rounded-xl p-6 shadow-card border border-gray-200 dark:border-border-light flex flex-col h-[156px] relative overflow-hidden group hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between relative z-10 mb-2">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Promedio de Edad</span>
                    <span className="material-symbols-outlined text-gray-500 bg-gray-50 p-1.5 rounded-md text-[20px]">cake</span>
                  </div>
                  <div className="relative z-10 mt-auto">
                    {metrics?.averageAge != null ? (
                      <span className="text-4xl font-bold text-gray-900">
                        {metrics.averageAge} <span className="text-base font-medium text-gray-500">años</span>
                      </span>
                    ) : (
                      <span className="text-4xl font-bold text-gray-400">—</span>
                    )}
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gray-500/5 rounded-full group-hover:scale-110 transition-transform" />
                </div>
              )}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Goals bar chart */}
              <div className="lg:col-span-8 bg-white dark:bg-surface-light rounded-xl shadow-card border border-gray-200 dark:border-border-light p-6 md:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Objetivos de Alumnos</h2>
                    <p className="text-sm text-gray-500">Distribución de metas principales de entrenamiento</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col gap-6 flex-1 mt-6 animate-pulse">
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
                  <div className="flex flex-col gap-6 flex-1 mt-6">
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
                <div className="bg-white dark:bg-surface-light rounded-xl shadow-card border border-gray-200 dark:border-border-light p-6 md:p-8 flex flex-col">
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

                {/* Retention card */}
                <div className="bg-white dark:bg-surface-light rounded-xl shadow-card border border-gray-200 dark:border-border-light p-6 md:p-8 flex flex-col justify-between relative group hover:border-blue-200 transition-all">
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/5 rounded-full group-hover:scale-110 transition-transform" />
                  </div>

                  <div className="flex items-center justify-between mb-4 relative z-20">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Retención de Clientes</h3>
                    <div className="relative group/tooltip">
                      <span className="material-symbols-outlined text-gray-400 cursor-pointer text-[20px] hover:text-primary transition-colors">info</span>
                      <div className="absolute right-0 top-full mt-2 z-50 hidden group-hover/tooltip:block w-64 bg-gray-800 text-white text-[11px] rounded-xl p-4 shadow-2xl leading-relaxed animate-in fade-in zoom-in duration-200 origin-top-right border border-white/10">
                        <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                          <span className="material-symbols-outlined text-primary text-[14px]">calculate</span>
                          <p className="font-bold text-gray-100">Cálculo de Retención</p>
                        </div>
                        <div className="font-mono bg-white/5 p-2 rounded-lg mb-4 text-center text-primary-light border border-white/5">
                          ((E - N) / S) × 100
                        </div>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex gap-2">
                            <strong className="text-white w-4">S</strong>
                            <span><span className="text-gray-500">(Start)</span> Activos al inicio del mes (excluye archivados antes del mes).</span>
                          </li>
                          <li className="flex gap-2">
                            <strong className="text-white w-4">N</strong>
                            <span><span className="text-gray-500">(New)</span> Alumnos dados de alta este mes.</span>
                          </li>
                          <li className="flex gap-2">
                            <strong className="text-white w-4">E</strong>
                            <span><span className="text-gray-500">(End)</span> Alumnos activos hoy.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="py-2 animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-20 mb-2" />
                      <div className="h-2 bg-gray-100 rounded w-full" />
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {metrics?.retentionPercent != null ? `${metrics.retentionPercent}%` : "—"}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-1000"
                          style={{ width: `${metrics?.retentionPercent ?? 0}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-gray-400">
                        {metrics?.retentionPercent != null
                          ? "Métrica basada en el flujo de alumnos del presente mes."
                          : "Datos insuficientes para calcular la retención."}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
