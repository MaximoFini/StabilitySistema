

export default function Library() {
    return (
        <div className="flex flex-col h-full overflow-hidden relative min-w-0 bg-background-light dark:bg-background-dark">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-none">
                <div className="px-8 pt-8 pb-0">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Biblioteca</h1>
                    <div className="flex gap-8 border-b border-slate-200 dark:border-slate-700">
                        <button className="pb-3 px-2 border-b-[3px] border-primary text-primary font-bold text-sm">
                            Planes y Rutinas
                        </button>
                        <button className="pb-3 px-2 border-b-[3px] border-transparent text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 transition-all">
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
                            <input className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" placeholder="Buscar rutina..." type="text" />
                        </div>
                        <button className="h-10 px-3 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">filter_list</span>
                            <span className="text-sm font-medium hidden sm:inline">Filtros</span>
                        </button>
                    </div>
                    <button className="h-10 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all duration-200 font-medium text-sm whitespace-nowrap">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Crear Plantilla
                    </button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                    <article className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-shadow duration-200 flex flex-col group h-full">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Hipertrofia Fase 1</h3>
                            <button className="h-8 w-8 -mr-2 -mt-2 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">more_vert</span>
                            </button>
                        </div>
                        <div className="flex gap-2 mb-6 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                4 Semanas
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                3 Días/Sem
                            </span>
                        </div>
                        <div className="mt-auto border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Asignado a:</span>
                            <div className="flex items-center -space-x-2">
                                <img alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjyWSyr8nHP8CVPUTd7hfLd1S4h7bAqWDvv54UO0Nwg2URKLKRFcGhxYaw4miTIM_44853PYlKyKX0MvYzFIyoO0bIdmZESfL09tML85lQIqH3c7U9s5cX0JLY31Y49E4RvO2BavEzPtakPdnSWDqPxJAZr-DiJrB7AH5Q3yrIyVe9Iz1nU--8sg-PA12JDryh9QQcyiyfZfY4fU7ngN193SPR3MZi5nhu-EWprB4u1oC-jG11MW7H97k4QWpVRXFeNRlfBnHEj39k" />
                                <img alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNcgHvk_8h5XeWb9tMaC-Kj0rPaL0El8TUGirXYc3XBIfzS3U9qQyTTYRcRVoXVfZyP1vhOaCpdTNStrpp2HMaMbJgC69QjM1_KpuOQbT4mZoBbAmpeMqRt0J-GE6CjaXQqEWEDsEGBHarGVMsUM3TatGMemEsalfLHAqmuuaivKuey0umGAkX6fG9sQzFINcMnAP1Gy1ADSdg_W4rkql9ccGlviX51LG3CnxarE9KLhKbZKMd21IwuvaENthYZ_BS0GY0aeOcc9Xw" />
                                <img alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXR8DvpA9uwYeeGvC4PLOB84Mhi6SxodjMxZ2exfsPO7-Vzb66fS7bNPdSSDud_2TVYt2CthlZ1G3ws9UxBcS9g_Aiyfqejd-c4Ox1hhL17-aOESDy1MkKOKoiuZPpDuXfN-_JjOmpELfyugUgA7WWlAFE3lcw4gyaw1xpSjZcE64Td-RmMyQTw7dPnCQtN7UgH66mMyWS1svDGXnzgEIdCZtGrhTumfMSqSTKGrPXaSZaXUX1SMNmXrtxEgVZr0o6L50ZAmR9QPpt" />
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                    +9
                                </div>
                            </div>
                        </div>
                    </article>
                    <article className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-shadow duration-200 flex flex-col group h-full">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Fuerza Básica</h3>
                            <button className="h-8 w-8 -mr-2 -mt-2 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">more_vert</span>
                            </button>
                        </div>
                        <div className="flex gap-2 mb-6 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                6 Semanas
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                4 Días/Sem
                            </span>
                        </div>
                        <div className="mt-auto border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Asignado a:</span>
                            <div className="flex items-center -space-x-2">
                                <img alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDQ0fKyb5OZi1vRDWpbrHgzWjkwJbJWuAn2dzjmp1uazaEBxqWc8cLsMMLGZ95Ihz5QnHThXn1Tt2a_ppCfXi6e2PuLb5RPjdQFmjYQrbbNk1S-CBdyyiDTF0sptX_07hjPHYd12Wa6kU9VMw-zvL3m6BhV_PrLA22hqzfzqLb8Qc5ReomOpbcJhkveFgUQPEfZNnOwidqx_GrFXhJPRuqHa9TdxLbwF-2tdupEo8W8wakoRQTstspTKCEduZTbM4VQRrKI1Zwid3f" />
                                <img alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ4Wm7fRFyDmW-zbhajBwjcMbUyCqFQDkVlwur1l_9n2AkBmCmM-J7T8_Esx-HlHySjeT6fCkWMJCmJ1pwH0fxGnrXgGdF2r8qNfa9Xg2LbDG7iGjMY-WfKtdZ6BDK1lXJUWWjfRyxbEa8b24u2W4paDLv8pqU4FsP9znHPFvbMQrl3MOczs0RmazDHikIqd02XwPJP12ua6WbB1G5O_oO7A0_E573cGbWBNSqXq1pq96lHoE9yhx204hZCsQvWOGYHyDQUctYRNol" />
                            </div>
                        </div>
                    </article>
                    <article className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-shadow duration-200 flex flex-col group h-full">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Movilidad de Cadera</h3>
                            <button className="h-8 w-8 -mr-2 -mt-2 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">more_vert</span>
                            </button>
                        </div>
                        <div className="flex gap-2 mb-6 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                2 Semanas
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                Diario
                            </span>
                        </div>
                        <div className="mt-auto border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Asignado a:</span>
                            <div className="flex items-center -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                                </div>
                                <span className="ml-3 text-xs text-slate-400">Sin asignar</span>
                            </div>
                        </div>
                    </article>
                    <article className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-shadow duration-200 flex flex-col group h-full">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Rehabilitación ACL</h3>
                            <button className="h-8 w-8 -mr-2 -mt-2 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">more_vert</span>
                            </button>
                        </div>
                        <div className="flex gap-2 mb-6 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                12 Semanas
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                3 Días/Sem
                            </span>
                        </div>
                        <div className="mt-auto border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Asignado a:</span>
                            <div className="flex items-center -space-x-2">
                                <img alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHppwwwhmnQAmX1-OjeqUQ1qLcmqRWrRHno2h1K_Fql7Cjd2N9k-V3mMHKPV4VV1ZPfi0fxEyQyRxnywUDhAK8TurlZZqoAq9aGPNzLTcWBCsugguLrETiBk1b24ncBobZSwcw8SIaEVcUWQtSRRvxbdj2e31h16n1DOKVmHiIsERp-3nKnk6gDUoFrsRsALHdKUa76fQHxyonwwSFiIM7aPnQCzB6yLUOPFPVJqLqkKVhO0H3hwBBwsMdlhxAx9FSyhwvGaB6gYoq" />
                            </div>
                        </div>
                    </article>
                </div>
            </main>
        </div>
    )
}
