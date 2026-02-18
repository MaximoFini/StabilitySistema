import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrainingPlanDetail } from "../../hooks/useTrainingPlans";

interface PlanPreviewProps {
  planId: string;
  onClose: () => void;
}

interface TrainingPlanDay {
  id: string;
  plan_id: string;
  day_number: number;
  day_name: string;
  display_order: number;
  training_plan_exercises?: TrainingPlanExercise[];
}

interface TrainingPlanExercise {
  id: string;
  day_id: string;
  stage_id: string | null;
  stage_name: string;
  exercise_name: string;
  video_url: string | null;
  series: number;
  reps: string;
  intensity: number;
  pause: string;
  notes: string | null;
  coach_instructions: string | null;
  display_order: number;
}

export default function PlanPreview({ planId, onClose }: PlanPreviewProps) {
  const navigate = useNavigate();
  const { plan, loading, error } = useTrainingPlanDetail(planId);
  const [activeDay, setActiveDay] = useState(0);

  const handleEditPlan = () => {
    navigate(`/planificador?planId=${planId}&mode=edit`);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-4xl w-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Cargando plan...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-4xl w-full">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-red-400 mb-4">
              error
            </span>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error || "No se pudo cargar el plan"}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const days = (plan.training_plan_days || []) as TrainingPlanDay[];
  const currentDay = days[activeDay];
  const exercises = (currentDay?.training_plan_exercises ||
    []) as TrainingPlanExercise[];

  // Format dates
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {plan.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatDate(plan.start_date)} - {formatDate(plan.end_date)} ·{" "}
              {plan.total_weeks} semanas · {plan.days_per_week} días/sem
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {days.map((day, index: number) => (
            <button
              key={day.id}
              onClick={() => setActiveDay(index)}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeDay === index
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {day.day_name}
            </button>
          ))}
        </div>

        {/* Exercise Table */}
        <div className="flex-1 overflow-auto p-6">
          {exercises.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
                fitness_center
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                No hay ejercicios en este día
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Etapa
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Ejercicio
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Video
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Series
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Reps
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Intensidad
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Pausa
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Notas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((exercise, index: number) => (
                    <tr
                      key={exercise.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">
                          {exercise.stage_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                        {exercise.exercise_name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {exercise.video_url ? (
                          <a
                            href={exercise.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              play_circle
                            </span>
                          </a>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-700 dark:text-slate-300">
                        {exercise.series}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-700 dark:text-slate-300">
                        {exercise.reps}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-700 dark:text-slate-300">
                        {exercise.intensity}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-700 dark:text-slate-300">
                        {exercise.pause}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                        {exercise.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Cerrar
          </button>
          <button
            onClick={handleEditPlan}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Editar Plan
          </button>
        </div>
      </div>
    </div>
  );
}
