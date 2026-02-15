import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Mock Data
const MOCK_EXERCISES = [
    { id: 1, name: "Sentadilla Búlgara", type: "Piernas", category: "Fuerza", description: "Ejercicio unilateral para cuádriceps y glúteo.", video: "https://example.com/thumb1.jpg" },
    { id: 2, name: "Press Banca Plano", type: "Empuje", category: "Fuerza", description: "Ejercicio compuesto para pectoral mayor.", video: "https://example.com/thumb2.jpg" },
    { id: 3, name: "Peso Muerto Rumano", type: "Tracción", category: "Fuerza", description: "Enfoque en cadena posterior e isquios.", video: "https://example.com/thumb3.jpg" },
    { id: 4, name: "Plancha Abdominal", type: "Core", category: "Estabilidad", description: "Isométrico para zona media.", video: "https://example.com/thumb4.jpg" },
    { id: 5, name: "Movilidad de Hombro", type: "Movilidad", category: "Movilidad", description: "Rotaciones externas e internas con banda.", video: "https://example.com/thumb5.jpg" },
]

export default function ExerciseList({ searchQuery }: { searchQuery: string }) {
    const [exercises, _setExercises] = useState(MOCK_EXERCISES)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filter, setFilter] = useState("Todos")

    // Filter Logic
    const filteredExercises = exercises.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filter === "Todos" || ex.category === filter)
    )

    const handleAdd = (name: string) => {
        toast.success(`"${name}" agregado al plan actual`)
    }

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        toast.success("Nuevo ejercicio creado exitosamente")
        setIsModalOpen(false)
    }

    return (
        <div className="relative">
            {/* Filters Row */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {["Todos", "Fuerza", "Cardio", "Movilidad", "Estabilidad"].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                            filter === cat 
                                ? "bg-primary text-white border-primary" 
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                        )}
                    >
                        {cat}
                    </button>
                ))}
                
                <div className="ml-auto">
                     <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nuevo Ejercicio
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
                        <tr>
                            <th className="px-4 py-3 w-16">Vista</th>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Categoría</th>
                            <th className="px-4 py-3 hidden md:table-cell">Descripción</th>
                            <th className="px-4 py-3 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredExercises.map((ex) => (
                            <tr key={ex.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                    {ex.name}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                        {ex.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell truncate max-w-xs">
                                    {ex.description}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button 
                                        onClick={() => handleAdd(ex.name)}
                                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                        title="Agregar al plan"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredExercises.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No se encontraron ejercicios
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-lg">Nuevo Ejercicio</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre del Ejercicio</label>
                                <input required className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm" placeholder="Ej: Flexiones Diamante" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría</label>
                                <select className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm">
                                    <option>Fuerza</option>
                                    <option>Cardio</option>
                                    <option>Movilidad</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Link de Video (Opcional)</label>
                                <input className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm" placeholder="https://youtube.com/..." />
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg"
                                >
                                    Crear Ejercicio
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
