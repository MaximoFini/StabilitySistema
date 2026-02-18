import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

// ─── Simple Coming Soon placeholder ──────────────────────────────────────

function PlaceholderPage({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center gap-4">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-[36px] text-primary filled">
          {icon}
        </span>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          {description}
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
        <span className="material-symbols-outlined text-[13px]">
          construction
        </span>
        Próximamente
      </span>
    </div>
  );
}

export function TrainingProgress() {
  return (
    <PlaceholderPage
      icon="bar_chart"
      title="Tu Progreso"
      description="Aquí verás tus métricas, récords personales, historial de entrenamientos y evolución de peso a lo largo del tiempo."
    />
  );
}

export function TrainingProfile() {
  const navigate = useNavigate();
  const { professor, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (!professor) {
    return null;
  }

  return (
    <div className="min-h-full px-4 pt-6 pb-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Perfil
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Tu información personal
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Avatar header */}
        <div className="relative h-24 bg-gradient-to-br from-primary to-brand-blue">
          <div className="absolute -bottom-10 left-4">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center overflow-hidden">
              {professor.profileImage ? (
                <img
                  src={professor.profileImage}
                  alt={professor.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-[32px] text-slate-400 filled">
                  person
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pt-14 px-4 pb-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {professor.firstName} {professor.lastName}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {professor.email}
            </p>
          </div>

          {/* Role badge */}
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
              <span className="material-symbols-outlined text-[13px]">
                {professor.role === "student" ? "school" : "sports"}
              </span>
              {professor.role === "student" ? "Alumno" : "Coach"}
            </span>
          </div>
        </div>
      </div>

      {/* User options placeholder */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-4">
        <div className="flex items-center gap-3 py-2 opacity-40">
          <span className="material-symbols-outlined text-[20px] text-slate-400">
            settings
          </span>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Configuración
          </span>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Próximamente
          </span>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-red-500/30 active:scale-[0.98] transition-all min-h-[52px]"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        {isLoading ? "Cerrando sesión..." : "Cerrar Sesión"}
      </button>
    </div>
  );
}
