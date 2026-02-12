

export default function NewPlan() {
    return (
        <div className="flex flex-col h-full overflow-hidden relative min-w-0 bg-background-light dark:bg-background-dark">
            <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 z-20">
                <div className="px-8 pt-5 pb-1">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                            <span className="hover:text-primary cursor-pointer">Planificador</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span className="text-gray-600 dark:text-gray-300">Nuevo Plan</span>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-sky-100 hover:bg-sky-200 text-primary-light text-primary font-bold transition-colors text-sm">
                                <span className="material-symbols-outlined text-lg mr-2">content_copy</span>
                                Duplicar Semana
                            </button>
                            <button className="flex items-center justify-center rounded-lg h-9 px-5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold transition-colors text-sm shadow-sm">
                                <span className="material-symbols-outlined text-lg mr-2">save</span>
                                Guardar en Biblioteca
                            </button>
                            <button className="flex items-center justify-center rounded-lg h-9 px-5 bg-[#0056b3] text-white text-sm font-bold shadow-sm hover:bg-[#004494] transition-colors">
                                <span className="material-symbols-outlined text-lg mr-2">person_add</span>
                                Asignar plan a alumno
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <input className="w-full max-w-2xl bg-transparent text-2xl font-bold leading-tight border-none p-0 focus:ring-0 text-[#101418] dark:text-white placeholder-gray-400 hover:bg-gray-50 rounded px-1 -ml-1 transition-colors" type="text" defaultValue="Nuevo Plan: Hipertrofia Fase 1" />
                        <span className="material-symbols-outlined text-gray-400 text-xl">edit</span>
                    </div>
                </div>
                <div className="px-8 flex flex-col gap-4 pb-0">
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 shadow-sm">
                                    <label className="text-[10px] uppercase font-bold text-[#5e758d] tracking-wider mr-1">Desde</label>
                                    <span className="material-symbols-outlined text-[#5e758d] text-base">calendar_today</span>
                                    <span className="text-sm font-medium">12 Oct, 2023</span>
                                </div>
                                <span className="text-gray-300 material-symbols-outlined text-sm">arrow_forward</span>
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 shadow-sm">
                                    <label className="text-[10px] uppercase font-bold text-[#5e758d] tracking-wider mr-1">Hasta</label>
                                    <span className="material-symbols-outlined text-[#5e758d] text-base">event</span>
                                    <span className="text-sm font-medium">19 Oct, 2023</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-[#5e758d] bg-gray-50 dark:bg-gray-800 px-4 py-1.5 rounded-full">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">fitness_center</span>
                                <span className="font-medium">Total Series: <b className="text-[#101418] dark:text-white">13</b></span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end gap-1 mt-2">
                        <button className="px-6 py-2.5 bg-white dark:bg-[#1a202c] border-b-2 border-primary text-primary font-bold text-sm hover:bg-gray-50 transition-colors">
                            Día 1
                        </button>
                        <button className="px-6 py-2.5 border-b-2 border-transparent text-[#5e758d] hover:text-gray-800 dark:hover:text-gray-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Día 2
                        </button>
                        <button className="px-6 py-2.5 border-b-2 border-transparent text-[#5e758d] hover:text-gray-800 dark:hover:text-gray-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Día 3
                        </button>
                        <button className="ml-2 flex items-center gap-1 px-3 py-2 text-[#5e758d] hover:text-primary font-bold text-xs uppercase tracking-wide transition-colors">
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            Agregar Día
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
                <div className="bg-white dark:bg-[#1a202c] shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[900px]">
                    <div className="grid grid-cols-[140px_40px_3fr_80px_80px_100px_80px_2fr_50px] gap-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[11px] font-bold text-[#5e758d] uppercase tracking-wider items-center sticky top-0 z-10">
                        <div className="py-3 text-center border-r border-gray-200 dark:border-gray-700">Etapa</div>
                        <div className="py-3 text-center">#</div>
                        <div className="py-3 px-3 border-l border-gray-100 dark:border-gray-800">Ejercicio</div>
                        <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800">Series</div>
                        <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800">Reps</div>
                        <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800">Intensidad</div>
                        <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800">Pausa</div>
                        <div className="py-3 px-3 border-l border-gray-100 dark:border-gray-800">Notas</div>
                        <div className="py-3 text-center border-l border-gray-100 dark:border-gray-800"></div>
                    </div>
                    {/* Rows */}
                    <div className="group relative border-b border-gray-200 dark:border-gray-700">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-300 z-10"></div>
                        <div className="grid grid-cols-[140px_40px_3fr_80px_80px_100px_80px_2fr_50px] items-stretch hover:bg-blue-50/30 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                            <div className="px-2 py-2 flex items-center justify-center border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                                <div className="relative w-full">
                                    <select defaultValue="Activación" className="w-full text-[10px] font-bold uppercase tracking-wide text-primary bg-white border border-blue-200 dark:border-blue-900 rounded py-1.5 pl-2 pr-6 focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer appearance-none shadow-sm">
                                        <option>Activación</option>
                                        <option>Desarrollo</option>
                                        <option>Vuelta a la Calma</option>
                                    </select>
                                    <span className="absolute right-1 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-sm pointer-events-none">arrow_drop_down</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center h-12 text-gray-300 cursor-grab active:cursor-grabbing hover:text-primary">
                                <span className="material-symbols-outlined text-lg">drag_indicator</span>
                            </div>
                            <div className="px-3 h-12 flex items-center border-l border-gray-100 dark:border-gray-800">
                                <div className="relative w-full">
                                    <input className="w-full text-sm font-semibold text-[#101418] dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder-gray-400" type="text" defaultValue="Plancha Lateral + Remo" />
                                    <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div className="px-2 h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                                <input className="w-full h-8 text-center text-sm font-medium bg-[#f5f7f8] dark:bg-gray-800 rounded border-none focus:ring-1 focus:ring-primary p-0" type="number" defaultValue="3" />
                            </div>
                            <div className="px-2 h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                                <input className="w-full h-8 text-center text-sm font-medium bg-[#f5f7f8] dark:bg-gray-800 rounded border-none focus:ring-1 focus:ring-primary p-0" type="text" defaultValue="30s" />
                            </div>
                            <div className="px-2 h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                                <div className="relative w-full">
                                    <input className="w-full h-8 text-center text-sm font-medium bg-[#f5f7f8] dark:bg-gray-800 rounded border-none focus:ring-1 focus:ring-primary p-0 pr-4" type="number" defaultValue="6" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">RPE</span>
                                </div>
                            </div>
                            <div className="px-2 h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                                <input className="w-full h-8 text-center text-sm font-medium bg-[#f5f7f8] dark:bg-gray-800 rounded border-none focus:ring-1 focus:ring-primary p-0" type="text" defaultValue="20s" />
                            </div>
                            <div className="px-3 h-12 flex items-center border-l border-gray-100 dark:border-gray-800">
                                <input className="w-full text-xs text-[#5e758d] bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300" placeholder="Notas..." type="text" defaultValue="Flexibilidad estática y dinámica" />
                            </div>
                            <div className="h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800 group/row">
                                <button className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/row:opacity-100">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Add more rows here if needed or componentize Row */}
                    <div className="w-full p-2 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
                        <button className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border border-dashed border-blue-200 dark:border-blue-800 group">
                            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">add</span>
                            <span className="text-xs font-bold uppercase tracking-wide">+ Agregar Ejercicio a Activación</span>
                        </button>
                    </div>
                </div>
                <div className="mt-4 flex justify-center">
                    <button className="w-full flex items-center justify-center gap-2 h-12 rounded-lg border-2 border-dashed border-[#dae0e7] dark:border-gray-600 text-primary hover:bg-primary/5 hover:border-primary transition-all shadow-sm bg-white dark:bg-gray-800">
                        <span className="material-symbols-outlined">add_circle</span>
                        <span className="font-bold text-sm">Agregar Nuevo Bloque</span>
                    </button>
                </div>
                <div className="h-12"></div>
            </main>
        </div>
    )
}
