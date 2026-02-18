import { useStudents, getStudentTag } from "../../hooks/useStudents";

export default function StudentsList() {
  const { students, loading, error } = useStudents();

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative">
            <header className="h-20 bg-white dark:bg-card-dark border-b border-gray-100 dark:border-gray-800 hidden md:flex items-center justify-between px-8 z-10 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inicio</h2>
                <div className="flex items-center gap-6">
                    <div className="h-10 w-10 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm cursor-pointer hover:ring-2 ring-primary ring-offset-2 transition-all" data-alt="Coach profile picture" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqcu8MmoySDYMncJpwpcC79mTV-KGJvTEZOAB1KXSGUKBzavr03LhdG6lQYsoHR9pTlFNj5Xgw29yhdTNnh0ikoerlh8e4j9KugKm7kiKqrEauH7VdWFt6z-I-JNXmXW79cQV6AjyjVIXARiAdNgmRsJ50CnUc3L-dTfaXpPGMmTxeisQ1Y9P7j0olzGy0LlhIwYXHMPqOIl9MzrncoeOEFxTlDYeJtLSbMd7cWXemVoE8bbpct1sxWc_04HG9xANh6z0Ee0224SP5')" }}>
                    </div>
                </div>
            </header>
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8 lg:p-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Mis Alumnos</h2>
            </div>
            <p className="text-secondary text-sm md:text-base">Gestiona los programas de entrenamiento y monitorea el progreso.</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-red-600 dark:text-red-300 text-xs mt-2">
                Abre la consola del navegador (F12) para ver detalles completos
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Cargando alumnos...</p>
              </div>
            </div>
          ) : students.length === 0 ? (
            /* Empty State */
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
                  group
                </span>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  No hay alumnos registrados
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Los alumnos aparecerán aquí una vez que se registren en el sistema
                </p>
              </div>
            </div>
          ) : (
            /* Students Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="group bg-white dark:bg-card-dark rounded-2xl p-8 shadow-card hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 flex flex-col items-center text-center cursor-pointer"
                >
                  <div className="relative mb-4">
                    <div
                      className="h-24 w-24 rounded-full bg-gray-200 bg-cover bg-center ring-4 ring-gray-50 dark:ring-gray-800 shadow-sm group-hover:scale-105 transition-transform duration-300"
                      style={{
                        backgroundImage: student.profileImageUrl
                          ? `url('${student.profileImageUrl}')`
                          : "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22system-ui%22 font-size=%2240%22 fill=%22%239ca3af%22%3E%3F%3C/text%3E%3C/svg%3E')",
                      }}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{student.fullName}</h3>
                  <p className="text-sm text-secondary font-medium mb-6 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {getStudentTag(student.trainingLevel, student.primaryGoal)}
                  </p>
                  <button className="w-full mt-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary dark:text-blue-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 group-hover:border-blue-200">
                    Ver Perfil
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
