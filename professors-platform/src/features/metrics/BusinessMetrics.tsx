

export default function BusinessMetrics() {
    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative">
            <header className="h-16 bg-white dark:bg-surface-light border-b border-gray-200 dark:border-border-light flex items-center justify-between px-8 flex-shrink-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Métricas del Negocio</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Visión general del rendimiento de tu gimnasio</p>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-surface-light rounded-xl p-6 shadow-card border border-gray-200 dark:border-border-light flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-200 transition-all">
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Alumnos Activos</span>
                                <span className="material-symbols-outlined text-primary bg-blue-50 p-1.5 rounded-md text-[20px]">groups</span>
                            </div>
                            <div className="relative z-10">
                                <span className="text-3xl font-bold text-gray-900">24</span>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/5 rounded-full group-hover:scale-110 transition-transform"></div>
                        </div>
                        <div className="bg-white dark:bg-surface-light rounded-xl p-6 shadow-card border border-gray-200 dark:border-border-light flex flex-col justify-between h-32 relative overflow-hidden group hover:border-green-200 transition-all">
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nuevos este Mes</span>
                                <span className="flex items-center text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
                                    +12.5%
                                </span>
                            </div>
                            <div className="relative z-10">
                                <span className="text-3xl font-bold text-gray-900">+3</span>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-green-500/5 rounded-full group-hover:scale-110 transition-transform"></div>
                        </div>
                        <div className="bg-white dark:bg-surface-light rounded-xl p-6 shadow-card border border-gray-200 dark:border-border-light flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-200 transition-all">
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Promedio de Edad</span>
                                <span className="material-symbols-outlined text-gray-500 bg-gray-50 p-1.5 rounded-md text-[20px]">cake</span>
                            </div>
                            <div className="relative z-10">
                                <span className="text-3xl font-bold text-gray-900">28 <span className="text-base font-medium text-gray-500">años</span></span>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gray-500/5 rounded-full group-hover:scale-110 transition-transform"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 bg-white dark:bg-surface-light rounded-xl shadow-card border border-gray-200 dark:border-border-light p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Objetivos de Alumnos</h2>
                                    <p className="text-sm text-gray-500">Distribución de metas principales de entrenamiento</p>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-full transition-colors">
                                    <span className="material-symbols-outlined">more_horiz</span>
                                </button>
                            </div>
                            <div className="flex flex-col gap-6 flex-1 justify-center">
                                <div className="group">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold text-gray-700">Hipertrofia</span>
                                        <span className="font-bold text-gray-900">12 alumnos</span>
                                    </div>
                                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full group-hover:bg-blue-700 transition-colors" style={{ width: "50%" }}></div>
                                    </div>
                                </div>
                                <div className="group">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold text-gray-700">Fuerza</span>
                                        <span className="font-bold text-gray-900">6 alumnos</span>
                                    </div>
                                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-secondary rounded-full group-hover:bg-blue-600 transition-colors" style={{ width: "25%" }}></div>
                                    </div>
                                </div>
                                <div className="group">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold text-gray-700">Salud</span>
                                        <span className="font-bold text-gray-900">4 alumnos</span>
                                    </div>
                                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent rounded-full group-hover:bg-cyan-600 transition-colors" style={{ width: "16%" }}></div>
                                    </div>
                                </div>
                                <div className="group">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold text-gray-700">Descenso de Peso</span>
                                        <span className="font-bold text-gray-900">2 alumnos</span>
                                    </div>
                                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-400 rounded-full group-hover:bg-purple-500 transition-colors" style={{ width: "8%" }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <div className="bg-white dark:bg-surface-light rounded-xl shadow-card border border-gray-200 dark:border-border-light p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Distribución por Género</h2>
                                <div className="flex flex-col items-center">
                                    <div className="relative w-48 h-48 mb-6">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" fill="none" r="40" stroke="#f3f4f6" strokeWidth="10"></circle>
                                            <circle className="text-primary" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeDasharray="100 251" strokeDashoffset="0" strokeLinecap="round" strokeWidth="10"></circle>
                                            <circle className="text-secondary" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeDasharray="150 251" strokeDashoffset="-105" strokeLinecap="round" strokeWidth="10"></circle>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-sm font-medium text-gray-400">Total</span>
                                            <span className="text-4xl font-bold text-gray-900 tracking-tight">24</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-8 w-full">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                                                <span className="text-sm font-medium text-gray-600">Hombres</span>
                                            </div>
                                            <span className="text-lg font-bold text-gray-900">60%</span>
                                        </div>
                                        <div className="w-px h-10 bg-gray-200"></div>
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                                                <span className="text-sm font-medium text-gray-600">Mujeres</span>
                                            </div>
                                            <span className="text-lg font-bold text-gray-900">40%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-surface-light rounded-xl shadow-card border border-gray-200 dark:border-border-light p-6 flex flex-col justify-center">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-bold text-gray-900">Retención de Clientes</h3>
                                    <span className="material-symbols-outlined text-gray-400">info</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100 mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-full text-red-500 shadow-sm">
                                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-red-600 uppercase">Archivados / Bajas</span>
                                            <span className="text-lg font-bold text-gray-900">2 Alumnos</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                                    <span>Churn Rate mensual</span>
                                    <span className="font-bold text-gray-700">8.3%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
