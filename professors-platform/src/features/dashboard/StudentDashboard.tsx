export default function StudentDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard de Alumno</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Card: Progreso General */}
                <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5">
                        <h3 className="font-semibold leading-none tracking-tight">Progreso General</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-2xl font-bold">75%</div>
                        <p className="text-xs text-muted-foreground">Completado este mes</p>
                    </div>
                </div>

                {/* Card: Entrenamientos */}
                <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5">
                        <h3 className="font-semibold leading-none tracking-tight">Entrenamientos</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Esta semana</p>
                    </div>
                </div>

                {/* Card: Próxima Sesión */}
                <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5">
                        <h3 className="font-semibold leading-none tracking-tight">Próxima Sesión</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-2xl font-bold">Hoy</div>
                        <p className="text-xs text-muted-foreground">18:00 - Entrenamiento de fuerza</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                <h3 className="font-semibold leading-none tracking-tight mb-4">Actividad Reciente</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <span className="material-symbols-outlined text-primary">fitness_center</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Entrenamiento completado</p>
                            <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <span className="material-symbols-outlined text-primary">assignment</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Nueva rutina asignada</p>
                            <p className="text-xs text-muted-foreground">Ayer</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
