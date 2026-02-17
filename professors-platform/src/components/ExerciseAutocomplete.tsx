import { useState, useEffect, useRef } from 'react'
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
    placeholder = "Nombre del ejercicio"
}: ExerciseAutocompleteProps) {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

    // Update dropdown position when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            })
        }
    }, [isOpen])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Search exercises with debounce
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        if (value.length < 2) {
            setExercises([])
            setIsOpen(false)
            return
        }

        timeoutRef.current = setTimeout(async () => {
            setIsLoading(true)
            try {
                const { data, error } = await supabase
                    .from('exercises')
                    .select(`
                        *,
                        category:exercise_categories(id, name, color)
                    `)
                    .ilike('name', `%${value}%`)
                    .limit(10)

                if (error) throw error
                console.log('📊 Exercises fetched from DB:', data)
                setExercises(data || [])
                setIsOpen((data || []).length > 0)
            } catch (error) {
                console.error('Error searching exercises:', error)
                setExercises([])
            } finally {
                setIsLoading(false)
            }
        }, 300)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [value])

    const handleSelect = (exercise: Exercise) => {
        // First, let the parent handle the full exercise data
        onSelectExercise(exercise)

        // Then update the input value to match
        onChange(exercise.name)

        setIsOpen(false)
        setExercises([])
    }

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full text-sm font-semibold text-[#101418] dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder-gray-400"
            />

            {isOpen && exercises.length > 0 && (
                <div
                    className="fixed bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[99999] max-h-64 overflow-y-auto"
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                        marginTop: '4px'
                    }}
                >
                    {exercises.map((exercise) => (
                        <button
                            key={exercise.id}
                            type="button"
                            onClick={() => handleSelect(exercise)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center gap-2"
                        >
                            <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900 dark:text-white">
                                    {exercise.name}
                                </div>
                                {exercise.category && (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: exercise.category.color }}
                                        />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {exercise.category.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {exercise.video_url && (
                                <span className="material-symbols-outlined text-blue-500 text-[18px]">
                                    play_circle
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {isLoading && value.length >= 2 && (
                <div
                    className="fixed bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[99999] px-3 py-2"
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                        marginTop: '4px'
                    }}
                >
                    <div className="text-sm text-gray-500 dark:text-gray-400">Buscando...</div>
                </div>
            )}

            <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm pointer-events-none">
                {isLoading ? 'progress_activity' : 'expand_more'}
            </span>
        </div>
    )
}
