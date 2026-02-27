import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useStudents, getStudentTag } from "../../hooks/useStudents";
import { detectRpeAlert } from "@/lib/rpeHelpers";

export default function StudentsList() {
  const { students, loading, error } = useStudents();
  const navigate = useNavigate();
  const [rpeAlerts, setRpeAlerts] = useState<
    Map<string, "high" | "low" | null>
  >(new Map());
  const [attendanceAlerts, setAttendanceAlerts] = useState<Map<string, number>>(
    new Map(),
  );

  // Sort students: active first, archived last
  const visibleStudents = [...students].sort((a, b) => {
    if (!a.isArchived && b.isArchived) return -1;
    if (a.isArchived && !b.isArchived) return 1;
    return 0;
  });

  // Load RPE and Attendance alerts for each student
  useEffect(() => {
    const loadAlerts = async () => {
      const newRpeAlerts = new Map<string, "high" | "low" | null>();
      const newAttendanceAlerts = new Map<string, number>();

      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const endDate = today < monthEnd ? today : monthEnd;

      for (const student of visibleStudents) {
        // 1. RPE Alerts (last 3)
        const { data: rpeData } = await supabase
          .from("workout_completions")
          .select("rpe")
          .eq("student_id", student.id)
          .order("completed_at", { ascending: false })
          .limit(3);

        if (rpeData && rpeData.length > 0) {
          const rpes = (rpeData as { rpe: number | null }[]).map((d) => d.rpe);
          const alert = detectRpeAlert(rpes);
          newRpeAlerts.set(student.id, alert);
        } else {
          newRpeAlerts.set(student.id, null);
        }

        // 2. Attendance alerts (current month)
        if (!student.isArchived) {
          const { count } = await supabase
            .from("workout_completions")
            .select("id", { count: "exact", head: true })
            .eq("student_id", student.id)
            .gte("completed_at", monthStart.toISOString());

          const completionsThisMonth = count || 0;
          let totalExpectedDays = 0;

          if (student.activeAssignments) {
            for (const assignment of student.activeAssignments) {
              const assignStart = new Date(assignment.start_date);
              const assignEnd = new Date(assignment.end_date);

              if (assignEnd < monthStart || assignStart > endDate) continue;

              const overlapStart =
                assignStart > monthStart ? assignStart : monthStart;
              const overlapEnd = assignEnd < endDate ? assignEnd : endDate;

              const overlapDays =
                Math.floor(
                  (overlapEnd.getTime() - overlapStart.getTime()) /
                  (1000 * 60 * 60 * 24),
                ) + 1;

              const weeksInOverlap = overlapDays / 7;
              const expectedForThisAssignment = Math.round(
                weeksInOverlap * assignment.days_per_week,
              );
              totalExpectedDays += expectedForThisAssignment;
            }
          }

          const percentage =
            totalExpectedDays > 0
              ? Math.round((completionsThisMonth / totalExpectedDays) * 100)
              : 100;

          newAttendanceAlerts.set(student.id, Math.min(percentage, 100));
        }
      }

      setRpeAlerts(newRpeAlerts);
      setAttendanceAlerts(newAttendanceAlerts);
    };

    if (visibleStudents.length > 0) {
      loadAlerts();
    }
  }, [visibleStudents]);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative">
      <header className="h-20 bg-white dark:bg-card-dark border-b border-gray-100 dark:border-gray-800 hidden md:flex items-center justify-between px-8 z-10 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Inicio
        </h2>

      </header>
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-8">
        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Mis Alumnos
              </h2>
            </div>
            <p className="text-secondary text-sm md:text-base">
              Gestiona los programas de entrenamiento y monitorea el progreso.
            </p>
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
                <p className="text-slate-600 dark:text-slate-400">
                  Cargando alumnos...
                </p>
              </div>
            </div>
          ) : visibleStudents.length === 0 ? (
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
                  Los alumnos aparecerán aquí una vez que se registren en el
                  sistema
                </p>
              </div>
            </div>
          ) : (
            /* Students Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
              {visibleStudents.map((student) => {
                const isArchived = student.isArchived;
                const attendance = attendanceAlerts.get(student.id);
                const showAttendanceAlert =
                  attendance !== undefined && attendance < 60 && !isArchived;

                return (
                  <div
                    key={student.id}
                    className={`relative group bg-white dark:bg-card-dark rounded-2xl p-6 shadow-card transition-all duration-300 border flex flex-col items-center text-center cursor-pointer ${isArchived
                      ? "opacity-60 border-gray-300 dark:border-gray-600 hover:opacity-80"
                      : "border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 hover:shadow-lg"
                      }`}
                  >
                    {isArchived && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined text-[14px]">
                          archive
                        </span>
                        Archivado
                      </div>
                    )}
                    <div className="relative mb-4">
                      <div
                        className={`h-24 w-24 rounded-full bg-gray-200 bg-cover bg-center ring-4 ring-gray-50 dark:ring-gray-800 shadow-sm transition-transform duration-300 ${!isArchived && "group-hover:scale-105"
                          }`}
                        style={{
                          backgroundImage: student.profileImageUrl
                            ? `url('${student.profileImageUrl}')`
                            : "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22system-ui%22 font-size=%2240%22 fill=%22%239ca3af%22%3E%3F%3C/text%3E%3C/svg%3E')",
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {student.fullName}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-200 font-medium mb-4 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
                      {getStudentTag(
                        student.trainingLevel,
                        student.primaryGoal
                      )}
                    </p>

                    <div className="flex flex-col gap-2 mb-6 min-h-[32px]">
                      {/* Low Attendance Alert */}
                      {showAttendanceAlert && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit mx-auto border bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
                          <span className="material-symbols-outlined text-[14px]">
                            event_busy
                          </span>
                          Asistencia: {attendance}%
                        </div>
                      )}

                      {/* RPE Alert Badge */}
                      {rpeAlerts.get(student.id) && !isArchived && (
                        <div
                          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit mx-auto border ${rpeAlerts.get(student.id) === "high"
                            ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                            : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {rpeAlerts.get(student.id) === "high"
                              ? "warning"
                              : "info"}
                          </span>
                          {rpeAlerts.get(student.id) === "high"
                            ? "RPE muy alto"
                            : "RPE muy bajo"}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/alumno/${student.id}`)}
                      className={`w-full mt-auto border text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${isArchived
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 group-hover:border-blue-200"
                        }`}
                    >
                      Ver Perfil
                      <span className="material-symbols-outlined text-[18px]">
                        chevron_right
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
