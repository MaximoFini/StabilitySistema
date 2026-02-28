import { useState, useEffect } from "react";

interface SavePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SavePlanFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData: {
    title: string;
    daysCount: number;
    startDate: Date;
    endDate: Date;
  };
}

export interface SavePlanFormData {
  name: string;
  durationWeeks: number;
}

export default function SavePlanModal({
  isOpen,
  onClose,
  onSave,
  isSubmitting,
  initialData,
}: SavePlanModalProps) {
  const [name, setName] = useState(initialData.title);
  const [durationWeeks, setDurationWeeks] = useState(1);
  const [nameError, setNameError] = useState("");
  const daysPlanned = initialData.daysCount;

  // Reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setName(initialData.title);
    setNameError("");

    const msPerDay = 24 * 60 * 60 * 1000;
    const totalDaysInPeriod =
      Math.ceil(
        (initialData.endDate.getTime() - initialData.startDate.getTime()) /
        msPerDay
      ) + 1;
    const weeks = Math.max(1, Math.ceil(totalDaysInPeriod / 7));
    setDurationWeeks(weeks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("El nombre del plan es obligatorio");
      return;
    }

    setNameError("");
    await onSave({
      name: name.trim(),
      durationWeeks,
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNameError("");
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">
                save
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Guardar en Biblioteca
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completa los detalles del plan
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nombre del Plan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError("");
              }}
              placeholder="Ej: Plan de Hipertrofia Fase 1"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium ${nameError
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10"
                  : "border-gray-200 dark:border-gray-600 focus:ring-primary focus:border-primary bg-white dark:bg-slate-700"
                } text-gray-900 dark:text-white transition-colors`}
              disabled={isSubmitting}
              autoFocus
            />
            {nameError && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  error
                </span>
                {nameError}
              </p>
            )}
          </div>

          {/* Duration & Automatic Frequency Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Duración (semanas)
              </label>
              <input
                type="number"
                value={durationWeeks}
                onChange={(e) =>
                  setDurationWeeks(Math.max(1, parseInt(e.target.value) || 1))
                }
                min={1}
                max={52}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Días planificados
              </label>
              <div className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-800/50 flex items-center">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {daysPlanned} {daysPlanned === 1 ? 'día' : 'días'}
                </span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-2.5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">
              info
            </span>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              El plan se guardará como plantilla en tu biblioteca. Podrás
              asignarlo a alumnos y editarlo en cualquier momento.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    save
                  </span>
                  Guardar Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
