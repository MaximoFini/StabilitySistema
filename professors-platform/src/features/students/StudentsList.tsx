import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useStudents, getStudentTag } from "../../hooks/useStudents";
import { detectRpeAlert } from "@/lib/rpeHelpers";

export default function StudentsList() {
  const { students, loading, error } = useStudents();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [rpeAlerts, setRpeAlerts] = useState<
    Map<string, "high" | "low" | null>
  >(new Map());
  const [attendanceAlerts, setAttendanceAlerts] = useState<Map<string, number>>(
    new Map(),
  );

  // Filter by search query
  const filteredStudents = students.filter((student) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return student.fullName.toLowerCase().includes(query);
  });

  // Sort students: active first, archived last
  const visibleStudents = [...filteredStudents].sort((a, b) => {
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
              const assignStart = new Date(assignment.start_date + "T00:00:00");
              const assignEnd = new Date(assignment.end_date + "T00:00:00");

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
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-8">
        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Mis Alumnos
            </h2>
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar alumno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>
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
            /* Students Grid - 2 Columns */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visibleStudents.map((student) => {
                const isArchived = student.isArchived;
                const attendance = attendanceAlerts.get(student.id);
                const showAttendanceAlert =
                  attendance !== undefined && attendance < 60 && !isArchived;

                return (
                  <div
                    key={student.id}
                    onClick={() => navigate(`/alumno/${student.id}`)}
                    className={`group bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm transition-all duration-300 border cursor-pointer ${isArchived
                        ? "opacity-60 border-gray-300 dark:border-gray-600 hover:opacity-80"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900/30 hover:shadow-md"
                      }`}
                  >
                    {/* Horizontal Card Layout */}
                    <div className="flex flex-row items-center justify-between gap-3">
                      {/* Left: Avatar */}
                      <div
                        className={`h-14 w-14 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-gray-100 dark:ring-gray-700 shadow-sm transition-transform duration-300 flex-shrink-0 ${!isArchived && "group-hover:scale-105"
                          }`}
                        style={{
                          backgroundImage: student.profileImageUrl
                            ? `url('${student.profileImageUrl}')`
                            : "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22system-ui%22 font-size=%2240%22 fill=%22%239ca3af%22%3E%3F%3C/text%3E%3C/svg%3E')",
                        }}
                      />

                      {/* Center: Name, Tag, Plan & Alerts */}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        {/* Name */}
                        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                          {student.fullName}
                        </h3>

                        {/* Tag */}
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                          {getStudentTag(
                            student.trainingLevel,
                            student.primaryGoal,
                          )}
                        </p>

                        {/* Badges: Plan, Alerts, Archived */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Plan Status */}
                          {!student.activeAssignments ||
                            student.activeAssignments.length === 0 ? (
                            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              <span className="material-symbols-outlined text-[12px]">
                                assignment_late
                              </span>
                              <span className="text-[10px] font-semibold whitespace-nowrap">
                                Sin plan
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                              <span className="material-symbols-outlined text-[12px] text-blue-600 dark:text-blue-400">
                                assignment_turned_in
                              </span>
                              <span
                                className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 truncate max-w-[120px]"
                                title={student.activeAssignments[0].plan_title}
                              >
                                {student.activeAssignments[0].plan_title}
                              </span>
                            </div>
                          )}

                          {/* Attendance Alert */}
                          {showAttendanceAlert && (
                            <div className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
                              <span className="material-symbols-outlined text-[12px]">
                                event_busy
                              </span>
                              <span className="whitespace-nowrap">
                                {attendance}%
                              </span>
                            </div>
                          )}

                          {/* RPE Alert */}
                          {rpeAlerts.get(student.id) && !isArchived && (
                            <div
                              className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${rpeAlerts.get(student.id) === "high"
                                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                }`}
                            >
                              <span className="material-symbols-outlined text-[12px]">
                                {rpeAlerts.get(student.id) === "high"
                                  ? "warning"
                                  : "info"}
                              </span>
                              <span className="whitespace-nowrap">
                                {rpeAlerts.get(student.id) === "high"
                                  ? "RPE Alto"
                                  : "RPE Bajo"}
                              </span>
                            </div>
                          )}

                          {/* Archived Badge */}
                          {isArchived && (
                            <div className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600">
                              <span className="material-symbols-outlined text-[12px]">
                                archive
                              </span>
                              <span className="whitespace-nowrap">
                                Archivado
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/alumno/${student.id}`);
                        }}
                        className={`flex items-center justify-center p-2 rounded-lg transition-colors border flex-shrink-0 ${isArchived
                            ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
                          }`}
                        title="Ver Perfil"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          chevron_right
                        </span>
                      </button>
                    </div>
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
