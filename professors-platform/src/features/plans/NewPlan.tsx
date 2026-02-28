import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useExerciseStages } from "../../hooks/useExerciseStages";
import {
  useTrainingPlans,
  useTrainingPlanDetail,
} from "../../hooks/useTrainingPlans";
import AddStageModal from "../../components/AddStageModal";
import AssignPlanModal from "../../components/AssignPlanModal";
import SavePlanModal from "../../components/SavePlanModal";
import type { SavePlanFormData } from "../../components/SavePlanModal";
import DatePicker from "../../components/DatePicker";
import type { PlanExercise } from "../../lib/types";
import { toast } from "sonner";
import ConfirmActionModal from "../../components/ConfirmActionModal";
import SortableExerciseRow from "./SortableExerciseRow";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface Day {
  id: string;
  number: number;
  name: string;
}

const STORAGE_KEY = "newPlan_draft";

// Helper functions for localStorage
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert date strings back to Date objects
      if (parsed.startDate) parsed.startDate = new Date(parsed.startDate);
      if (parsed.endDate) parsed.endDate = new Date(parsed.endDate);
      return parsed;
    }
  } catch (error) {
    console.error("Error loading plan from storage:", error);
  }
  return null;
};

const saveToStorage = (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving plan to storage:", error);
  }
};

export default function NewPlan() {
  const { stages, loading: stagesLoading, addStage } = useExerciseStages();
  const { savePlan, updatePlan, assignPlanToStudents } = useTrainingPlans();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Detect edit mode from URL params
  const planId = searchParams.get("planId");
  const isEditMode = searchParams.get("mode") === "edit" && !!planId;
  const shouldOpenAssign = searchParams.get("openAssign") === "true";

  // Load existing plan data when in edit mode
  const { plan: loadedPlan, loading: planLoading } =
    useTrainingPlanDetail(planId);

  // Track if plan has been loaded to prevent re-hydration
  const planLoadedRef = useRef(false);

  // Carga única desde localStorage usando useRef para evitar llamadas repetidas
  const initialData = useRef<ReturnType<typeof loadFromStorage> | null>(
    isEditMode ? null : loadFromStorage(),
  );

  const [exercises, setExercises] = useState<PlanExercise[]>(() => {
    if (isEditMode)
      return [
        {
          id: "1",
          day_id: "1",
          stage_id: "",
          stage_name: "Activación",
          exercise_name: "Plancha Lateral + Remo",
          series: 3,
          reps: "30s",
          intensity: 6,
          pause: "20s",
          notes: "Flexibilidad estática y dinámica",
          order: 0,
          write_weight: false,
        },
      ];
    return (
      initialData.current?.exercises || [
        {
          id: "1",
          day_id: "1",
          stage_id: "",
          stage_name: "Activación",
          exercise_name: "Plancha Lateral + Remo",
          series: 3,
          reps: "30s",
          intensity: 6,
          pause: "20s",
          notes: "Flexibilidad estática y dinámica",
          order: 0,
          write_weight: false,
        },
      ]
    );
  });
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);

  // Date state for plan duration
  const [startDate, setStartDate] = useState<Date>(() => {
    if (isEditMode) return new Date(2026, 1, 18);
    return initialData.current?.startDate || new Date(2026, 1, 18);
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    if (isEditMode) return new Date(2026, 1, 25);
    return initialData.current?.endDate || new Date(2026, 1, 25);
  });

  // Day management state
  const [days, setDays] = useState<Day[]>(() => {
    if (isEditMode) return [{ id: "1", number: 1, name: "Día 1" }];
    return initialData.current?.days || [{ id: "1", number: 1, name: "Día 1" }];
  });
  const [activeDay, setActiveDay] = useState<string>(() => {
    if (isEditMode) return "1";
    return initialData.current?.activeDay || "1";
  });
  const [planTitle, setPlanTitle] = useState<string>(() => {
    if (isEditMode) return "Nuevo Plan: Hipertrofia Fase 1";
    return initialData.current?.planTitle || "Nuevo Plan: Hipertrofia Fase 1";
  });
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(planId || null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editAssignedCount, setEditAssignedCount] = useState(0);
  const [isDeleteDayModalOpen, setIsDeleteDayModalOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);
  const [isClearDraftModalOpen, setIsClearDraftModalOpen] = useState(false);

  // Hydrate state from loaded plan (edit mode)
  useEffect(() => {
    if (!isEditMode || !loadedPlan || planLoadedRef.current) return;
    planLoadedRef.current = true;

    console.log("[NewPlan] Hydrating plan from DB:", loadedPlan);

    // Set plan metadata
    setPlanTitle(loadedPlan.title);
    setStartDate(new Date(loadedPlan.start_date));
    setEndDate(new Date(loadedPlan.end_date));

    // Build days from loaded plan
    interface LoadedDay {
      id: string;
      day_number: number;
      day_name: string;
      display_order: number;
      training_plan_exercises?: LoadedExercise[];
    }
    interface LoadedExercise {
      id: string;
      stage_id: string | null;
      stage_name: string | null;
      exercise_name: string;
      video_url: string | null;
      series: number;
      reps: string;
      intensity: number;
      pause: string;
      notes: string | null;
      display_order: number;
    }

    const sortedDays = [...(loadedPlan.training_plan_days || [])].sort(
      (a: LoadedDay, b: LoadedDay) => a.display_order - b.display_order,
    );

    const hydratedDays: Day[] = sortedDays.map((d: LoadedDay) => ({
      id: d.id,
      number: d.day_number,
      name: d.day_name,
    }));

    const hydratedExercises: PlanExercise[] = [];
    for (const day of sortedDays) {
      const dayExercises = [...(day.training_plan_exercises || [])].sort(
        (a: LoadedExercise, b: LoadedExercise) =>
          a.display_order - b.display_order,
      );
      for (const ex of dayExercises) {
        hydratedExercises.push({
          id: ex.id,
          day_id: day.id,
          stage_id: ex.stage_id || "",
          stage_name: ex.stage_name || "",
          exercise_name: ex.exercise_name,
          video_url: ex.video_url,
          series: ex.series,
          reps: ex.reps,
          intensity: ex.intensity,
          pause: ex.pause,
          notes: ex.notes || "",
          order: ex.display_order,
          write_weight: (ex as any).write_weight ?? false,
        });
      }
    }

    if (hydratedDays.length > 0) {
      setDays(hydratedDays);
      setActiveDay(hydratedDays[0].id);
    }
    if (hydratedExercises.length > 0) {
      setExercises(hydratedExercises);
    }

    // Get assigned count
    const assignedCount = loadedPlan.training_plan_assignments?.[0]?.count || 0;
    setEditAssignedCount(assignedCount);

    // Open assign modal if requested via URL
    if (shouldOpenAssign) {
      setIsAssignModalOpen(true);
    }

    console.log(
      "[NewPlan] Hydrated:",
      hydratedDays.length,
      "days,",
      hydratedExercises.length,
      "exercises",
    );
  }, [loadedPlan, isEditMode, shouldOpenAssign]);

  // Auto-save to localStorage whenever state changes (only for new plans)
  useEffect(() => {
    if (isEditMode) return; // Don't auto-save when editing existing plans

    const timer = setTimeout(() => {
      setSaveStatus("saving");
      const dataToSave = {
        exercises,
        days,
        activeDay,
        startDate,
        endDate,
        planTitle,
      };
      saveToStorage(dataToSave);

      setSaveStatus("saved");
      const clearTimer = setTimeout(() => setSaveStatus(null), 2000);
      return () => clearTimeout(clearTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, [exercises, days, activeDay, startDate, endDate, planTitle, isEditMode]);

  const handleAddDay = () => {
    const newDayNumber = days.length + 1;
    const newDay: Day = {
      id: Date.now().toString(),
      number: newDayNumber,
      name: `Día ${newDayNumber}`,
    };
    setDays([...days, newDay]);
    setActiveDay(newDay.id);
    toast.success(`Día ${newDayNumber} agregado`);
  };

  const handleDeleteDay = (dayId: string) => {
    if (days.length === 1) {
      toast.error("Debe haber al menos un día en el plan");
      return;
    }

    setDayToDelete(dayId);
    setIsDeleteDayModalOpen(true);
  };

  const confirmDeleteDay = () => {
    if (!dayToDelete) return;

    const dayId = dayToDelete;
    // Remove exercises for this day
    setExercises((prev) => prev.filter((ex) => ex.day_id !== dayId));

    // Remove day
    const newDays = days.filter((d) => d.id !== dayId);

    // Re-number days
    const reorderedDays = newDays.map((d, index) => ({
      ...d,
      number: index + 1,
      name: `Día ${index + 1}`,
    }));

    setDays(reorderedDays);

    // Switch active day if needed
    if (activeDay === dayId) {
      setActiveDay(reorderedDays[0].id);
    }
    toast.success("Día eliminado");
    setDayToDelete(null);
  };

  const handleAddExercise = () => {
    const newExercise: PlanExercise = {
      id: Date.now().toString(),
      day_id: activeDay,
      stage_id: stages.length > 0 ? stages[0].id : "",
      stage_name: stages.length > 0 ? stages[0].name : "",
      exercise_name: "",
      series: 3,
      reps: "10",
      intensity: 7,
      pause: "60s",
      notes: "",
      order: exercises.length,
      write_weight: false,
    };
    setExercises([...exercises, newExercise]);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleUpdateExercise = (
    id: string,
    field: keyof PlanExercise,
    value: any,
  ) => {
    setExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === id ? { ...ex, [field]: value } : ex,
      ),
    );
  };

  const handleStageChange = (exerciseId: string, stageId: string) => {
    const stage = stages.find((s) => s.id === stageId);
    if (stage) {
      handleUpdateExercise(exerciseId, "stage_id", stageId);
      handleUpdateExercise(exerciseId, "stage_name", stage.name);
    }
  };

  const handleAddStage = async (name: string, color: string) => {
    return await addStage(name, color);
  };

  const handleClearDraft = () => {
    setIsClearDraftModalOpen(true);
  };

  const confirmClearDraft = () => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);

    const newDayId = Date.now().toString();
    const today = new Date();

    // Reset to completely empty state
    setExercises([
      {
        id: Date.now().toString() + "_ex",
        day_id: newDayId,
        stage_id: "",
        stage_name: "",
        exercise_name: "",
        series: 0,
        reps: "",
        intensity: 0,
        pause: "",
        notes: "",
        order: 0,
      },
    ]);
    setDays([{ id: newDayId, number: 1, name: "Día 1" }]);
    setActiveDay(newDayId);
    setStartDate(today);
    setEndDate(today);
    setPlanTitle("Nuevo Plan: [Sin título]");
    setSavedPlanId(null);

    toast.success("Borrador limpiado — nuevo plan en blanco");
  };

  const handleOpenSaveModal = () => {
    // Validation before opening modal
    const exercisesWithContent = exercises.filter((ex) =>
      ex.exercise_name.trim(),
    );
    if (exercisesWithContent.length === 0) {
      toast.error("El plan debe tener al menos un ejercicio con nombre");
      return;
    }

    if (days.length === 0) {
      toast.error("El plan debe tener al menos un día");
      return;
    }

    setIsSaveModalOpen(true);
  };

  const handleSaveToLibrary = async (formData: SavePlanFormData) => {
    try {
      setIsSaving(true);

      const planPayload = {
        title: formData.name,
        startDate,
        endDate,
        days,
        exercises: exercises.filter((ex) => ex.exercise_name.trim()),
        isTemplate: true,
        durationWeeks: formData.durationWeeks,
      };

      const result =
        isEditMode && planId
          ? await updatePlan(planId, planPayload)
          : await savePlan(planPayload);

      if (result.success) {
        setSavedPlanId(result.planId!);
        toast.success(
          isEditMode ? "Plan actualizado" : "Plan guardado en biblioteca",
          {
            description: isEditMode
              ? `"${formData.name}" actualizado correctamente`
              : `"${formData.name}" disponible en Biblioteca > Planes y Rutinas`,
          },
        );
        setIsSaveModalOpen(false);
        if (isEditMode) {
          navigate("/biblioteca");
        }
      } else {
        toast.error(`Error al guardar: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Error inesperado al guardar el plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignPlan = async (studentIds: string[]) => {
    try {
      setIsAssigning(true);

      // If plan is not saved yet, save it first
      let planIdToAssign = savedPlanId || planId;

      if (!planIdToAssign) {
        // Save the plan first
        const saveResult = await savePlan({
          title: planTitle,
          startDate,
          endDate,
          days,
          exercises,
          isTemplate: false,
        });

        if (!saveResult.success) {
          toast.error(saveResult.error || "Error al guardar el plan");
          return;
        }

        planIdToAssign = saveResult.planId!;
        setSavedPlanId(planIdToAssign);
      }

      // Assign to students
      if (assignPlanToStudents && planIdToAssign) {
        const result = await assignPlanToStudents(
          planIdToAssign,
          studentIds,
          startDate,
          endDate,
        );

        if (result.success) {
          toast.success(
            `Plan asignado a ${studentIds.length} ${studentIds.length === 1 ? "alumno" : "alumnos"}`,
          );
          setIsAssignModalOpen(false);
        } else {
          toast.error(result.error || "Error al asignar plan");
        }
      }
    } catch (error) {
      console.error("Error assigning plan:", error);
      toast.error("Error al asignar plan");
    } finally {
      setIsAssigning(false);
    }
  };

  const getStageColor = (stageName: string) => {
    const stage = stages.find((s) => s.name === stageName);
    return stage?.color || "#3B82F6";
  };

  const handleExerciseSelect = (exerciseId: string, exercise: any) => {
    handleUpdateExercise(exerciseId, "exercise_name", exercise.name);
    handleUpdateExercise(exerciseId, "video_url", exercise.video_url);
    handleUpdateExercise(exerciseId, "notes", exercise.notes || "");
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setExercises((prev) => {
        const activeDayExs = prev.filter((ex) => ex.day_id === activeDay);
        const otherExs = prev.filter((ex) => ex.day_id !== activeDay);

        const oldIndex = activeDayExs.findIndex((ex) => ex.id === active.id);
        const newIndex = activeDayExs.findIndex((ex) => ex.id === over.id);

        const reorderedActiveDayExs = arrayMove(activeDayExs, oldIndex, newIndex);

        const updatedReordered = reorderedActiveDayExs.map((ex, idx) => ({
          ...ex,
          order: idx,
        }));

        return [...otherExs, ...updatedReordered];
      });
    }
  };

  const activeDayExercises = exercises.filter((ex) => ex.day_id === activeDay);

  return (
    <div className="flex flex-col h-full overflow-hidden relative min-w-0 bg-background-light dark:bg-background-dark">
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 z-20">
        <div className="px-8 pt-5 pb-1">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
              <div className="flex items-center gap-2">
                <span className="hover:text-primary cursor-pointer">
                  Planificador
                </span>
                <span className="material-symbols-outlined text-[10px]">
                  chevron_right
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  {isEditMode ? "Editar Plan" : "Nuevo Plan"}
                </span>
              </div>
              {planLoading && (
                <div className="flex items-center gap-1.5 text-[10px] text-primary ml-2">
                  <span className="material-symbols-outlined text-[14px] animate-spin">
                    progress_activity
                  </span>
                  <span>Cargando plan...</span>
                </div>
              )}
              {saveStatus && !planLoading && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 ml-2 transition-opacity">
                  {saveStatus === "saving" ? (
                    <>
                      <span className="material-symbols-outlined text-[14px] animate-spin">
                        progress_activity
                      </span>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[14px] text-green-600 dark:text-green-500">
                        check_circle
                      </span>
                      <span className="text-green-600 dark:text-green-500">
                        Cambios guardados
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {!isEditMode && (
                <button
                  onClick={handleClearDraft}
                  className="flex items-center justify-center rounded-lg h-9 px-4 bg-white border border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 font-bold transition-colors text-sm shadow-sm"
                  title="Limpiar borrador y comenzar nuevo plan"
                >
                  <span className="material-symbols-outlined text-lg mr-2">
                    refresh
                  </span>
                  Nuevo Borrador
                </button>
              )}
              {isEditMode && (
                <button
                  onClick={() => navigate("/biblioteca")}
                  className="flex items-center justify-center rounded-lg h-9 px-4 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold transition-colors text-sm shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg mr-2">
                    arrow_back
                  </span>
                  Volver a Biblioteca
                </button>
              )}
              <button
                onClick={handleOpenSaveModal}
                className={`flex items-center justify-center rounded-lg h-9 px-5 font-bold transition-colors text-sm shadow-sm ${isEditMode
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <span className="material-symbols-outlined text-lg mr-2">
                  {isEditMode ? "sync" : "save"}
                </span>
                {isEditMode ? "Actualizar Plan" : "Guardar en Biblioteca"}
              </button>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center justify-center rounded-lg h-9 px-5 bg-[#0056b3] text-white text-sm font-bold shadow-sm hover:bg-[#004494] transition-colors"
              >
                <span className="material-symbols-outlined text-lg mr-2">
                  person_add
                </span>
                Asignar plan a alumno
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input
              className="w-full max-w-2xl bg-transparent text-2xl font-bold leading-tight border-none p-0 focus:ring-0 text-[#101418] dark:text-white placeholder-gray-400 hover:bg-gray-50 rounded px-1 -ml-1 transition-colors"
              type="text"
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              placeholder="Nombre del plan..."
            />
            <span className="material-symbols-outlined text-gray-400 text-xl">
              edit
            </span>
          </div>
          {isEditMode && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-2 ${editAssignedCount > 0
                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {editAssignedCount > 0 ? "warning" : "edit_note"}
              </span>
              {editAssignedCount > 0
                ? `Editando plan con ${editAssignedCount} ${editAssignedCount === 1 ? "alumno asignado" : "alumnos asignados"}. Los cambios se reflejarán en sus planes activos.`
                : 'Modo edición — los cambios se guardarán al hacer click en "Actualizar Plan".'}
            </div>
          )}
        </div>
        <div className="px-8 flex flex-col gap-4 pb-0">
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <DatePicker
                  label="Desde"
                  icon="calendar_today"
                  value={startDate}
                  onChange={setStartDate}
                />
                <span className="text-gray-300 material-symbols-outlined text-sm">
                  arrow_forward
                </span>
                <DatePicker
                  label="Hasta"
                  icon="event"
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
            </div>
          </div>
          <div className="flex items-end gap-1 mt-2 overflow-x-auto">
            {days.map((day) => (
              <div key={day.id} className="relative group">
                <button
                  onClick={() => setActiveDay(day.id)}
                  className={`px-6 py-2.5 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeDay === day.id
                    ? "border-primary text-primary bg-white dark:bg-[#1a202c] font-bold"
                    : "border-transparent text-[#5e758d] hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                >
                  {day.name}
                </button>
                {days.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDay(day.id);
                    }}
                    className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 rounded-full shadow-sm hover:scale-110 p-0.5 z-10"
                    title="Eliminar día"
                  >
                    <span className="material-symbols-outlined text-red-500 text-[14px] leading-tight block">
                      delete
                    </span>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddDay}
              className="ml-2 flex items-center gap-1 px-3 py-2 text-[#5e758d] hover:text-primary font-bold text-xs uppercase tracking-wide transition-colors whitespace-nowrap mb-0.5"
            >
              <span className="material-symbols-outlined text-lg">
                add_circle
              </span>
              Agregar Día
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
        <div className="bg-white dark:bg-[#1a202c] shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[900px]">
          <div className="grid grid-cols-[140px_40px_3fr_50px_80px_80px_100px_80px_80px_2fr_50px] gap-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[11px] font-bold text-[#5e758d] uppercase tracking-wider items-center sticky top-0 z-10">
            <div className="py-3 text-center border-r border-gray-200 dark:border-gray-700">
              Etapa
            </div>
            <div className="py-3 text-center">#</div>
            <div className="py-3 px-3 border-l border-gray-100 dark:border-gray-800">
              Ejercicio
            </div>
            <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800">
              Video
            </div>
            <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800">
              Series
            </div>
            <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800">
              Reps
            </div>
            <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800">
              Intensidad
            </div>
            <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800">
              Pausa
            </div>
            <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800">
              Escribir Peso
            </div>
            <div className="py-3 px-3 border-l border-gray-100 dark:border-gray-800">
              Notas
            </div>
            <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800"></div>
          </div>

          {/* Exercise Rows */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeDayExercises.map((ex) => ex.id)}
              strategy={verticalListSortingStrategy}
            >
              {activeDayExercises.map((exercise) => (
                <SortableExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  stageColor={getStageColor(exercise.stage_name || "")}
                  stagesLoading={stagesLoading}
                  stages={stages}
                  handleStageChange={handleStageChange}
                  handleUpdateExercise={handleUpdateExercise}
                  handleExerciseSelect={handleExerciseSelect}
                  handleDeleteExercise={handleDeleteExercise}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Add New Exercise Button Area */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setIsAddStageModalOpen(true)}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-lg border-2 border-dashed border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400 transition-all shadow-sm bg-white dark:bg-gray-800"
            title="Agregar nueva etapa"
          >
            <span className="material-symbols-outlined">add</span>
            <span className="font-bold text-sm">Nueva Etapa</span>
          </button>

          <button
            onClick={handleAddExercise}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg border-2 border-dashed border-[#dae0e7] dark:border-gray-600 text-primary hover:bg-primary/5 hover:border-primary transition-all shadow-sm bg-white dark:bg-gray-800"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span className="font-bold text-sm">Agregar Nuevo Ejercicio</span>
          </button>
        </div>

        <div className="h-12"></div>
      </main>

      {/* Add Stage Modal */}
      <AddStageModal
        isOpen={isAddStageModalOpen}
        onClose={() => setIsAddStageModalOpen(false)}
        onAdd={handleAddStage}
      />

      {/* Assign Plan Modal */}
      <AssignPlanModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignPlan}
        isSubmitting={isAssigning}
        planTitle={planTitle}
        planStartDate={startDate}
        planEndDate={endDate}
      />

      {/* Save Plan Modal */}
      <SavePlanModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveToLibrary}
        isSubmitting={isSaving}
        initialData={{
          title: planTitle,
          daysCount: days.length,
          startDate,
          endDate,
        }}
      />
      <ConfirmActionModal
        isOpen={isDeleteDayModalOpen}
        onClose={() => setIsDeleteDayModalOpen(false)}
        onConfirm={confirmDeleteDay}
        title="¿Eliminar día?"
        description="Esta acción eliminará el día y todos los ejercicios asignados a él. Esta acción no se puede deshacer."
        confirmText="Eliminar día"
      />

      <ConfirmActionModal
        isOpen={isClearDraftModalOpen}
        onClose={() => setIsClearDraftModalOpen(false)}
        onConfirm={confirmClearDraft}
        title="¿Limpiar borrador?"
        description="¿Deseas limpiar el borrador y comenzar un nuevo plan? Esta acción no se puede deshacer y perderás el progreso actual."
        confirmText="Limpiar Borrador"
      />
    </div>
  );
}
