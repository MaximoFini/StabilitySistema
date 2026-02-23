import { useAuthStore } from "@/features/auth/store/authStore";

export function TrainingProfile() {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#1F2937] dark:text-gray-100 flex flex-col min-h-screen overflow-hidden">
      <header className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark sticky top-0 z-10">
        <div className="w-8"></div>
        <h2 className="text-lg font-bold">Perfil</h2>
        <button className="w-8 flex items-center justify-end text-primary">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Profile Header */}
        <div className="flex flex-col items-center pt-6 pb-8 px-4">
          <div className="relative mb-4">
            <div
              className="w-28 h-28 rounded-full bg-center bg-cover shadow-lg border-4 border-white dark:border-surface-dark"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBL2T-T_I7zVwfz06sBPAE-6tdgJNvJjA8uf7QOkQzkIOZ0LTxbHpSdpd55Kt3T7oUyOJu1P8GNTRzQyHpU9l7aN59DJo6d2AeVS61o1hftgITOFUx31EUDzaTnj746dkQOMWzXIE2IxI7lE5NnF_4E3h-Zdy_S4uisolgy6rqIeH8d1csw4djqFWGjCFQWvt-t_ShZsjp9Gjf63y5N1SCKs3u92ev4RwO7PHlqRxpdlQdkqQrK2S-rEqiqcEY_tNPBM15jGqBwTUaA")`,
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-[#101418] dark:text-white mb-2">
            Juan Pérez
          </h1>
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[18px] mr-1.5">
              fitness_center
            </span>
            <span className="text-sm font-medium">
              Plan Activo: Hipertrofia
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 mb-8">
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-3 bg-surface-light dark:bg-surface-dark rounded-lg group active:scale-95 transition-transform duration-150">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="material-symbols-outlined text-primary text-[20px] opacity-0 group-hover:opacity-100 transition-opacity">
                  monitor_weight
                </span>
                <span className="material-symbols-outlined text-gray-400 text-[16px]">
                  edit
                </span>
              </div>
              <span className="text-lg font-bold text-[#101418] dark:text-white">
                78kg
              </span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Peso
              </span>
            </button>

            <button className="flex flex-col items-center justify-center p-3 bg-surface-light dark:bg-surface-dark rounded-lg group active:scale-95 transition-transform duration-150">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="material-symbols-outlined text-primary text-[20px] opacity-0 group-hover:opacity-100 transition-opacity">
                  height
                </span>
                <span className="material-symbols-outlined text-gray-400 text-[16px]">
                  edit
                </span>
              </div>
              <span className="text-lg font-bold text-[#101418] dark:text-white">
                175cm
              </span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Altura
              </span>
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-4 space-y-2">
          <div className="flex items-center p-3 bg-white dark:bg-surface-dark/50 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors cursor-pointer shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mr-4 shrink-0">
              <span className="material-symbols-outlined">
                medical_services
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-[#101418] dark:text-white">
                Mis Lesiones
              </h3>
              <p className="text-sm text-gray-500">Ficha Médica</p>
            </div>
            <span className="material-symbols-outlined text-gray-400">
              chevron_right
            </span>
          </div>

          <div className="h-4"></div>

          <div
            onClick={handleLogout}
            className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-transparent text-red-500 mr-4 shrink-0">
              <span className="material-symbols-outlined">logout</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-red-600 dark:text-red-400">
                Cerrar Sesión
              </h3>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
