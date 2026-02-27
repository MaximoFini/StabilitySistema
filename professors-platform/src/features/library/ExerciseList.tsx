import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/features/auth/store/authStore"
import CategoryManager from "./CategoryManager"

interface Category {
    id: string
    name: string
    color: string
}

interface Exercise {
    id: string
    name: string
    video_url: string | null
    notes: string | null
    category_id: string
    category?: Category
    created_by: string
    created_at: string
}

export default function ExerciseList({ searchQuery }: { searchQuery: string }) {
    const { professor } = useAuthStore()
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [filter, setFilter] = useState<string>("Todos")
    const [isLoading, setIsLoading] = useState(false)
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        video_url: '',
        notes: ''
    })

    useEffect(() => {
        fetchCategories()
        fetchExercises()
    }, [])

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('exercise_categories')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setCategories(data || [])

            // Set default category if available
            if (data && data.length > 0 && !formData.category_id) {
                setFormData(prev => ({ ...prev, category_id: data[0].id }))
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error('Error al cargar las categorías')
        }
    }

    const fetchExercises = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('exercises')
                .select(`
                    *,
                    category:exercise_categories(id, name, color)
                `)
                .order('name', { ascending: true })

            if (error) throw error
            setExercises(data || [])
        } catch (error) {
            console.error('Error fetching exercises:', error)
            toast.error('Error al cargar los ejercicios')
        } finally {
            setIsLoading(false)
        }
    }

    // Filter Logic
    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filter === "Todos" || ex.category_id === filter
        return matchesSearch && matchesFilter
    })

    const handleEdit = (exercise: Exercise) => {
        setEditingExercise(exercise)
        setFormData({
            name: exercise.name,
            category_id: exercise.category_id,
            video_url: exercise.video_url || '',
            notes: exercise.notes || ''
        })
        setIsModalOpen(true)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!professor) {
            toast.error('Debes iniciar sesión para crear ejercicios')
            return
        }

        if (!formData.name.trim()) {
            toast.error('El nombre del ejercicio es requerido')
            return
        }

        if (!formData.category_id) {
            toast.error('Debes seleccionar una categoría')
            return
        }

        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('exercises')
                .insert({
                    name: formData.name.trim(),
                    category_id: formData.category_id,
                    video_url: formData.video_url.trim() || null,
                    notes: formData.notes.trim() || null,
                    created_by: professor.id
                })

            if (error) throw error

            toast.success("Ejercicio creado exitosamente")
            setFormData({ name: '', category_id: categories[0]?.id || '', video_url: '', notes: '' })
            setIsModalOpen(false)
            fetchExercises()
        } catch (error) {
            console.error('Error creating exercise:', error)
            toast.error('Error al crear el ejercicio')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editingExercise) return

        if (!formData.name.trim()) {
            toast.error('El nombre del ejercicio es requerido')
            return
        }

        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('exercises')
                .update({
                    name: formData.name.trim(),
                    category_id: formData.category_id,
                    video_url: formData.video_url.trim() || null,
                    notes: formData.notes.trim() || null
                })
                .eq('id', editingExercise.id)

            if (error) throw error

            toast.success("Ejercicio actualizado exitosamente")
            setFormData({ name: '', category_id: categories[0]?.id || '', video_url: '', notes: '' })
            setEditingExercise(null)
            setIsModalOpen(false)
            fetchExercises()
        } catch (error) {
            console.error('Error updating exercise:', error)
            toast.error('Error al actualizar el ejercicio')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('exercises')
                .delete()
                .eq('id', id)

            if (error) throw error
            toast.success('Ejercicio eliminado')
            fetchExercises()
        } catch (error) {
            console.error('Error deleting exercise:', error)
            toast.error('Error al eliminar el ejercicio')
        }
    }

    return (
        <div className="relative">
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2 flex-1">
                    <button
                        onClick={() => setFilter("Todos")}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                            filter === "Todos"
                                ? "bg-primary text-white border-primary"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                        )}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5",
                                filter === cat.id
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                            )}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 flex-none">
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:border-primary/30 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Categoría
                    </button>
                    <button
                        onClick={() => {
                            setEditingExercise(null)
                            setFormData({ name: '', category_id: categories[0]?.id || '', video_url: '', notes: '' })
                            setIsModalOpen(true)
                        }}
                        className="h-8 px-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 text-sm font-medium whitespace-nowrap"
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
                            <th className="px-4 py-3 w-16">Video</th>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Categoría</th>
                            <th className="px-4 py-3">Notas</th>
                            <th className="px-4 py-3 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {isLoading && exercises.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                    Cargando ejercicios...
                                </td>
                            </tr>
                        ) : filteredExercises.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                    No se encontraron ejercicios
                                </td>
                            </tr>
                        ) : (
                            filteredExercises.map((ex) => (
                                <tr key={ex.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-3">
                                        {ex.video_url ? (
                                            <a
                                                href={ex.video_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                                                title="Ver video"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                            </a>
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                        {ex.name}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-white"
                                            style={{ backgroundColor: ex.category?.color || '#3B82F6' }}
                                        >
                                            {ex.category?.name || 'Sin categoría'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
                                        {ex.notes || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex gap-1 justify-end">
                                            {professor?.id === ex.created_by && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(ex)}
                                                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                        title="Editar ejercicio"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ex.id, ex.name)}
                                                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Category Manager Modal */}
            <CategoryManager
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onCategoryCreated={() => {
                    fetchCategories()
                }}
            />

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-lg">{editingExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h3>
                            <button onClick={() => {
                                setIsModalOpen(false)
                                setEditingExercise(null)
                            }} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={editingExercise ? handleUpdate : handleCreate} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre del Ejercicio *</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                                    placeholder="Ej: Flexiones Diamante"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría *</label>
                                <select
                                    required
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Link de Video (Opcional)</label>
                                <input
                                    value={formData.video_url}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notas (Opcional)</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm resize-none"
                                    placeholder="Instrucciones o detalles adicionales..."
                                />
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
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg disabled:opacity-50"
                                >
                                    {editingExercise ? 'Actualizar Ejercicio' : 'Crear Ejercicio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
