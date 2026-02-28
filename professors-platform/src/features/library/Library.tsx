import { useState } from "react"
import { useNavigate } from "react-router-dom"
import RoutineList from "./RoutineList"
import ExerciseList from "./ExerciseList"

export default function Library() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'routines' | 'exercises'>('routines')
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="flex flex-col h-full overflow-hidden relative min-w-0 bg-background-light dark:bg-background-dark">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-none">
                <div className="px-8 pt-8 pb-0">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Biblioteca</h1>
                    <div className="flex gap-8 border-b border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('routines')}
                            className={`pb-3 px-2 border-b-[3px] font-bold text-sm transition-colors ${activeTab === 'routines'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300"
                                }`}
                        >
                            Planes y Rutinas
                        </button>
                        <button
                            onClick={() => setActiveTab('exercises')}
                            className={`pb-3 px-2 border-b-[3px] font-bold text-sm transition-colors ${activeTab === 'exercises'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300"
                                }`}
                        >
                            Base de Ejercicios
                        </button>
                    </div>
                </div>
                <div className="px-8 py-5 flex items-center justify-between gap-4 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3 flex-1 max-w-2xl">
                        <div className="relative w-full max-w-md">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                placeholder={activeTab === 'routines' ? "Buscar rutina..." : "Buscar ejercicio..."}
                                type="text"
                            />
                        </div>

                    </div>
                    {activeTab === 'routines' && (
                        <button
                            onClick={() => navigate("/planificador?mode=new")}
                            className="h-10 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all duration-200 font-medium text-sm whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Crear Plantilla
                        </button>
                    )}
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
                {activeTab === 'routines' ? (
                    <RoutineList searchQuery={searchQuery} />
                ) : (
                    <ExerciseList searchQuery={searchQuery} />
                )}
            </main>
        </div>
    )
}
