export function TrainingProgress() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white pb-24 transition-colors duration-200 min-h-screen">
      <header className="px-6 pt-8 pb-4 bg-white dark:bg-background-dark/50 sticky top-0 z-10 backdrop-blur-md border-b border-transparent dark:border-white/10">
        <h1 className="text-3xl font-bold tracking-tight text-text-main dark:text-white leading-tight">
          Tu Evolución
        </h1>
        <p className="text-text-muted dark:text-slate-400 text-sm font-normal mt-1">
          Estadísticas y Marcas Personales
        </p>
      </header>

      <main className="flex flex-col gap-6 px-4 pt-4">
        {/* Constancia Section */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-lg font-bold text-text-main dark:text-white">
              Constancia
            </h2>
            <p className="text-xs font-medium text-primary cursor-pointer hover:underline">
              Ver Historial
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <p className="font-semibold text-text-main dark:text-white">
                Octubre 2023
              </p>
              <div className="flex gap-2">
                <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-text-muted">
                  <span className="material-symbols-outlined text-lg">
                    chevron_left
                  </span>
                </button>
                <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-text-muted">
                  <span className="material-symbols-outlined text-lg">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-4">
              <div className="text-xs text-text-muted font-medium">L</div>
              <div className="text-xs text-text-muted font-medium">M</div>
              <div className="text-xs text-text-muted font-medium">M</div>
              <div className="text-xs text-text-muted font-medium">J</div>
              <div className="text-xs text-text-muted font-medium">V</div>
              <div className="text-xs text-text-muted font-medium">S</div>
              <div className="text-xs text-text-muted font-medium">D</div>

              <div className="text-sm text-slate-300 dark:text-slate-600 py-1">
                29
              </div>
              <div className="text-sm text-slate-300 dark:text-slate-600 py-1">
                30
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                1
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  2
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                3
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  4
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                5
              </div>

              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  6
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                7
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  8
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                9
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                10
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  11
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                12
              </div>

              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  13
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                14
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  15
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                16
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  17
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                18
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                19
              </div>

              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  20
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                21
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  22
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                23
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  24
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                25
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                26
              </div>

              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none">
                  27
                </div>
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                28
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                29
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                30
              </div>
              <div className="text-sm font-medium text-text-main dark:text-white py-1">
                31
              </div>
              <div className="text-sm text-slate-300 dark:text-slate-600 py-1">
                1
              </div>
              <div className="text-sm text-slate-300 dark:text-slate-600 py-1">
                2
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
              <span className="material-symbols-outlined text-primary text-lg">
                check_circle
              </span>
              <p className="text-sm text-text-main dark:text-slate-300">
                <span className="font-bold text-primary">
                  12 Entrenamientos
                </span>{" "}
                este mes
              </p>
            </div>
          </div>
        </section>

        {/* Peso Corporal Section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold px-2 text-text-main dark:text-white">
            Peso Corporal
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-text-muted dark:text-slate-400 text-sm font-medium mb-1">
                  Peso Actual
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-text-main dark:text-white tracking-tight">
                    78.5
                  </span>
                  <span className="text-lg font-medium text-text-muted dark:text-slate-400">
                    kg
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                <span className="material-symbols-outlined text-success text-sm font-bold">
                  arrow_downward
                </span>
                <span className="text-success text-sm font-bold">0.5kg</span>
              </div>
            </div>

            <div className="h-32 w-full relative">
              <svg
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 300 100"
              >
                <defs>
                  <linearGradient
                    id="weightGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#0056b2" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#0056b2" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,40 C50,45 100,30 150,50 C200,70 250,60 300,80 V100 H0 Z"
                  fill="url(#weightGradient)"
                />
                <path
                  d="M0,40 C50,45 100,30 150,50 C200,70 250,60 300,80"
                  fill="none"
                  stroke="#0056b2"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
                <circle className="fill-primary" cx="0" cy="40" r="3" />
                <circle className="fill-primary" cx="150" cy="50" r="3" />
                <circle
                  className="fill-white stroke-primary"
                  cx="300"
                  cy="80"
                  r="4"
                  strokeWidth="3"
                />
              </svg>
              <div className="flex justify-between text-xs text-text-muted dark:text-slate-500 mt-2 px-1">
                <span>Hace 3 meses</span>
                <span>Hoy</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
