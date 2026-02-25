import { useAuthStore } from "@/features/auth/store/authStore";
import WorkoutCalendar from "@/components/WorkoutCalendar";

export default function TrainingProgress() {
  const { professor } = useAuthStore();

  if (!professor?.id) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white pb-24 transition-colors duration-200 min-h-screen">
        <header className="px-6 pt-8 pb-4 bg-white dark:bg-background-dark/50 sticky top-0 z-10 backdrop-blur-md border-b border-transparent dark:border-white/10">
          <h1 className="text-3xl font-bold tracking-tight text-text-main dark:text-white leading-tight">
            Tu Evolución
          </h1>
          <p className="text-text-muted dark:text-slate-400 text-sm font-normal mt-1">
            Estadísticas y Marcas Personales
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white pb-24 transition-colors duration-200 min-h-screen">
      <header className="px-6 pt-8 pb-4 bg-white dark:bg-background-dark/50 sticky top-0 z-10 backdrop-blur-md border-b border-transparent dark:border-white/10">
        <h1 className="text-3xl font-bold tracking-tight text-text-main dark:text-white leading-tight">
          Tu Evolución
        </h1>
        <p className="text-text-muted dark:text-slate-400 text-sm font-normal mt-1">
          Estadísticas y Marcas Personales
        </p>
      </header>

      <main className="flex flex-col gap-6 px-4 pt-4">
        {/* Constancia Section */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-lg font-bold text-text-main dark:text-white">
              Constancia
            </h2>
          </div>

          <WorkoutCalendar studentId={professor.id} />
        </section>
      </main>
    </div>
  );
}
