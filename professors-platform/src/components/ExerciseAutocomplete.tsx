import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'

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
}

interface ExerciseAutocompleteProps {
    value: string
    onChange: (value: string) => void
    onSelectExercise: (exercise: Exercise) => void
    placeholder?: string
}

export default function ExerciseAutocomplete({
    value,
    onChange,
    onSelectExercise,
    placeholder = "Buscar ejercicio..."
}: ExerciseAutocompleteProps) {
    const [allExercises, setAllExercises] = useState<Exercise[]>([])
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [hasLoaded, setHasLoaded] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

    const updateDropdownPosition = useCallback(() => {
        if (isOpen && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom,
                left: rect.left,
                // Make sure it's at least 380px wide to show all text regardless of the narrow table cell
                width: Math.max(rect.width, 380)
            })
        }
    }, [isOpen])
    const loadAllExercises = useCallback(async () => {
        if (hasLoaded && allExercises.length > 0) return

        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('exercises')
                .select(`
                    *,
                    category:exercise_categories(id, name, color)
                `)
                .order('name', { ascending: true })
                .limit(100)

            if (error) throw error
            setAllExercises(data || [])
            setFilteredExercises(data || [])
            setHasLoaded(true)
        } catch (error) {
            console.error('Error loading exercises:', error)
            setAllExercises([])
            setFilteredExercises([])
        } finally {
            setIsLoading(false)
        }
    }, [hasLoaded, allExercises.length])

    // Focus search input when opening and update position
    useEffect(() => {
        if (isOpen) {
            updateDropdownPosition()

            // Re-calculate position on scroll/resize just in case
            window.addEventListener('scroll', updateDropdownPosition, true)
            window.addEventListener('resize', updateDropdownPosition)

            if (searchInputRef.current) {
                setTimeout(() => searchInputRef.current?.focus(), 50)
            }
        }

        return () => {
            window.removeEventListener('scroll', updateDropdownPosition, true)
            window.removeEventListener('resize', updateDropdownPosition)
        }
    }, [isOpen, updateDropdownPosition])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node
            if (
                wrapperRef.current && !wrapperRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false)
                setSearchQuery('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Filter exercises when search query changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredExercises(allExercises)
        } else {
            const query = searchQuery.toLowerCase()
            setFilteredExercises(
                allExercises.filter(ex =>
                    ex.name.toLowerCase().includes(query) ||
                    ex.category?.name?.toLowerCase().includes(query)
                )
            )
        }
    }, [searchQuery, allExercises])

    const handleOpen = async () => {
        if (!isOpen) {
            await loadAllExercises()
            setIsOpen(true)
            setSearchQuery('')
        }
    }

    const handleSelect = (exercise: Exercise) => {
        onSelectExercise(exercise)
        onChange(exercise.name)
        setIsOpen(false)
        setSearchQuery('')
    }

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div
                className="w-full flex items-center cursor-pointer"
                onClick={handleOpen}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value)
                        if (!isOpen) handleOpen()
                    }}
                    onFocus={handleOpen}
                    placeholder={placeholder}
                    className="w-full text-sm font-semibold text-[#101418] dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder-gray-400 cursor-pointer"
                    readOnly={false}
                />
            </div>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[99999] flex flex-col overflow-hidden"
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                        marginTop: '4px',
                        maxHeight: '380px'
                    }}
                >
                    {/* Search Input */}
                    <div className="p-2.5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[18px]">
                                search
                            </span>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nombre o categoría..."
                                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 dark:text-white placeholder-gray-400"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="overflow-y-auto flex-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8 gap-2">
                                <span className="material-symbols-outlined text-primary animate-spin text-lg">
                                    progress_activity
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Cargando ejercicios...
                                </span>
                            </div>
                        ) : filteredExercises.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 mb-2">
                                    search_off
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay ejercicios disponibles'}
                                </span>
                            </div>
                        ) : (
                            filteredExercises.map((exercise) => (
                                <button
                                    key={exercise.id}
                                    type="button"
                                    onClick={() => handleSelect(exercise)}
                                    className="w-full px-3 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-b-0 flex items-center gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                            {exercise.name}
                                        </div>
                                        {exercise.category && (
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                                                    style={{
                                                        backgroundColor: `${exercise.category.color}15`,
                                                        color: exercise.category.color,
                                                        border: `1px solid ${exercise.category.color}30`
                                                    }}
                                                >
                                                    <div
                                                        className="w-1.5 h-1.5 rounded-full"
                                                        style={{ backgroundColor: exercise.category.color }}
                                                    />
                                                    {exercise.category.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {exercise.video_url && (
                                        <span className="material-symbols-outlined text-blue-500 text-[20px] flex-shrink-0" title="Tiene video">
                                            play_circle
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer with count */}
                    {!isLoading && filteredExercises.length > 0 && (
                        <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 text-[11px] text-gray-400 font-medium">
                            {filteredExercises.length} ejercicio{filteredExercises.length !== 1 ? 's' : ''} encontrado{filteredExercises.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>,
                document.body
            )}

            <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm pointer-events-none">
                {isLoading ? 'progress_activity' : 'expand_more'}
            </span>
        </div>
    )
}
