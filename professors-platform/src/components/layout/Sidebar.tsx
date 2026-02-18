import { Link, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/authStore";

const coachNavigation = [
  { name: "Alumnos", href: "/inicio", icon: "group" },
  { name: "Dashboard", href: "/dashboard", icon: "bar_chart" },
  { name: "Biblioteca", href: "/biblioteca", icon: "fitness_center" },
  { name: "Planificador", href: "/planificador", icon: "calendar_month" },
];

const studentNavigation = [
  { name: "Mi Dashboard", href: "/", icon: "home" },
  { name: "Mi Plan", href: "/mi-plan", icon: "fitness_center" },
  { name: "Progreso", href: "/progreso", icon: "trending_up" },
  { name: "Mensajes", href: "/mensajes", icon: "chat" },
];

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { professor, logout } = useAuthStore();

  const isStudent = professor?.role === "student";
  const navigation = isStudent ? studentNavigation : coachNavigation;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
        <span className="text-xl font-bold tracking-tight text-primary">
          Stability
        </span>
        {/* Close button — only visible on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
      </div>

      {/* Role badge */}
      {professor && (
        <div className="px-4 pt-3 pb-1">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider",
              isStudent
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400",
            )}
          >
            <span className="material-symbols-outlined text-[13px]">
              {isStudent ? "school" : "sports"}
            </span>
            {isStudent ? "Alumno" : "Coach"}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-primary"
                  : "text-gray-500 dark:text-slate-400",
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[22px] transition-none",
                  isActive && "filled",
                )}
              >
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer: user info + logout */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 overflow-hidden">
            {professor?.profileImage ? (
              <img
                src={professor.profileImage}
                alt={`${professor.firstName} ${professor.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-[20px]">
                person
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
              {professor
                ? `${professor.firstName} ${professor.lastName}`
                : "Usuario"}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-normal">
              {professor?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside
        className={cn(
          "hidden lg:flex h-screen w-64 flex-col border-r bg-white dark:bg-slate-900 shrink-0",
          className,
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — slide-in drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 flex flex-col border-r bg-white dark:bg-slate-900",
          "transform transition-transform duration-300 ease-in-out",
          "lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
