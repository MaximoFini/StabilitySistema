import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ExerciseAutocomplete from "../../components/ExerciseAutocomplete";
import type { PlanExercise } from "../../lib/types";

interface SortableExerciseRowProps {
    exercise: PlanExercise;
    stageColor: string;
    stagesLoading: boolean;
    stages: { id: string; name: string }[];
    handleStageChange: (exerciseId: string, stageId: string) => void;
    handleUpdateExercise: (exerciseId: string, field: keyof PlanExercise, value: any) => void;
    handleExerciseSelect: (exerciseId: string, selectedExercise: any) => void;
    handleDeleteExercise: (exerciseId: string) => void;
}

export default function SortableExerciseRow({
    exercise,
    stageColor,
    stagesLoading,
    stages,
    handleStageChange,
    handleUpdateExercise,
    handleExerciseSelect,
    handleDeleteExercise,
}: SortableExerciseRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: exercise.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        boxShadow: isDragging ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" : "none",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${isDragging ? "bg-white dark:bg-gray-800 opacity-90" : ""
                }`}
        >
            <div
                className="absolute left-0 top-0 bottom-0 w-1 z-10"
                style={{ backgroundColor: stageColor }}
            ></div>
            <div className="grid grid-cols-[140px_40px_3fr_50px_80px_80px_100px_80px_80px_2fr_50px] items-stretch hover:bg-blue-50/30 transition-colors">
                <div className="px-2 py-2 flex items-center justify-center border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="relative w-full">
                        <select
                            value={exercise.stage_id}
                            onChange={(e) => handleStageChange(exercise.id, e.target.value)}
                            className={`w-full text-[10px] font-bold uppercase tracking-wide bg-white border rounded py-1.5 pl-2 pr-6 focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer appearance-none shadow-sm ${exercise.stage_id
                                ? "text-primary border-blue-200 dark:border-blue-900"
                                : "text-gray-400 border-gray-200 dark:border-gray-600"
                                }`}
                            disabled={stagesLoading}
                        >
                            {!exercise.stage_id && (
                                <option value="" disabled>
                                    Seleccionar etapa
                                </option>
                            )}
                            {stages.map((stage) => (
                                <option key={stage.id} value={stage.id}>
                                    {stage.name}
                                </option>
                            ))}
                        </select>
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-sm pointer-events-none">
                            arrow_drop_down
                        </span>
                    </div>
                </div>
                <div
                    className="flex items-center justify-center h-12 text-gray-300 cursor-grab active:cursor-grabbing hover:text-primary outline-none"
                    {...attributes}
                    {...listeners}
                >
                    <span className="material-symbols-outlined text-lg pointer-events-none">
                        drag_indicator
                    </span>
                </div>
                <div className="px-3 h-12 flex items-center border-l border-gray-100 dark:border-gray-800">
                    <div className="relative w-full">
                        <ExerciseAutocomplete
                            value={exercise.exercise_name}
                            onChange={(value) => handleUpdateExercise(exercise.id, "exercise_name", value)}
                            onSelectExercise={(selectedExercise) => handleExerciseSelect(exercise.id, selectedExercise)}
                            placeholder="Nombre del ejercicio"
                        />
                    </div>
                </div>
                <div className="h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                    {exercise.video_url ? (
                        <a
                            href={exercise.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            title="Ver video"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                play_circle
                            </span>
                        </a>
                    ) : (
                        <span className="material-symbols-outlined text-[18px] text-gray-300">
                            videocam_off
                        </span>
                    )}
                </div>
                <div className="px-2 h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                    <input
                        className="w-full h-8 text-center text-sm font-medium bg-[#f5f7f8] dark:bg-gray-800 rounded border-none focus:ring-1 focus:ring-primary p-0"
                        type="number"
                        value={exercise.series}
                        onChange={(e) => handleUpdateExercise(exercise.id, "series", parseInt(e.target.value) || 0)}
                    />
                </div>
                <div className="px-2 h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                    <input
                        className="w-full h-8 text-center text-sm font-medium bg-[#f5f7f8] dark:bg-gray-800 rounded border-none focus:ring-1 focus:ring-primary p-0"
                        type="text"
                        value={exercise.reps}
                        onChange={(e) => handleUpdateExercise(exercise.id, "reps", e.target.value)}
                    />
                </div>
                <div className="px-2 h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                    <input
                        className="w-full h-8 text-center text-sm font-medium bg-[#f5f7f8] dark:bg-gray-800 rounded border-none focus:ring-1 focus:ring-primary p-0"
                        type="text"
                        value={exercise.carga}
                        onChange={(e) => handleUpdateExercise(exercise.id, "carga", e.target.value)}
                        placeholder="-"
                    />
                </div>
                <div className="px-2 h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                    <input
                        className="w-full h-8 text-center text-sm font-medium bg-[#f5f7f8] dark:bg-gray-800 rounded border-none focus:ring-1 focus:ring-primary p-0"
                        type="text"
                        value={exercise.pause}
                        onChange={(e) => handleUpdateExercise(exercise.id, "pause", e.target.value)}
                    />
                </div>
                {/* Columna: Escribir Peso */}
                <div className="h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={() => handleUpdateExercise(exercise.id, "write_weight", !exercise.write_weight)}
                        title="Indicar que el alumno debe escribir el peso"
                        className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${exercise.write_weight
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-emerald-400"
                            }`}
                    >
                        {exercise.write_weight && (
                            <span className="material-symbols-outlined text-[16px] filled">
                                check
                            </span>
                        )}
                    </button>
                </div>
                <div className="px-3 h-12 flex items-center border-l border-gray-100 dark:border-gray-800">
                    <input
                        className="w-full text-xs text-[#5e758d] bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300"
                        placeholder="Notas..."
                        type="text"
                        value={exercise.notes || ""}
                        onChange={(e) => handleUpdateExercise(exercise.id, "notes", e.target.value)}
                    />
                </div>
                <div className="h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800 group/row">
                    <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/row:opacity-100"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            delete
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
