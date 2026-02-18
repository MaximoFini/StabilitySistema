import { useState } from "react";
import { useStudents } from "@/hooks/useStudents";

interface AssignPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (studentIds: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export default function AssignPlanModal({
  isOpen,
  onClose,
  onAssign,
  isSubmitting,
}: AssignPlanModalProps) {
  const { students, loading, error } = useStudents();
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set(),
  );

  if (!isOpen) return null;

  const handleToggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudentIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.size === students.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(students.map((s) => s.id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.size === 0) return;
    await onAssign(Array.from(selectedStudentIds));
    setSelectedStudentIds(new Set());
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedStudentIds(new Set());
      onClose();
    }
  };

  const allSelected =
    students.length > 0 && selectedStudentIds.size === students.length;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Asignar Plan a Alumnos
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">
                refresh
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && students.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                group
              </span>
              <p className="text-gray-500 dark:text-gray-400">
                No hay alumnos disponibles
              </p>
            </div>
          )}

          {!loading && !error && students.length > 0 && (
            <>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">
                    {allSelected ? "check_box" : "check_box_outline_blank"}
                  </span>
                  {allSelected ? "Deseleccionar Todos" : "Seleccionar Todos"}
                </button>
              </div>

              <div className="space-y-2">
                {students.map((student) => {
                  const isSelected = selectedStudentIds.has(student.id);
                  return (
                    <label
                      key={student.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleStudent(student.id)}
                        disabled={isSubmitting}
                        className="sr-only"
                      />

                      <span
                        className={`material-symbols-outlined text-2xl ${isSelected ? "text-primary" : "text-gray-400"}`}
                      >
                        {isSelected ? "check_box" : "check_box_outline_blank"}
                      </span>

                      <div className="flex-shrink-0">
                        {student.profileImageUrl ? (
                          <img
                            src={student.profileImageUrl}
                            alt={student.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400">
                              person
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {student.fullName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sin planes asignados
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          {selectedStudentIds.size > 0 && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="material-symbols-outlined text-lg">
                check_circle
              </span>
              <span>
                {selectedStudentIds.size}{" "}
                {selectedStudentIds.size === 1
                  ? "alumno seleccionado"
                  : "alumnos seleccionados"}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={
                isSubmitting || selectedStudentIds.size === 0 || loading
              }
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    refresh
                  </span>
                  Asignando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    assignment
                  </span>
                  Asignar Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
