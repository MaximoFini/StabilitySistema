import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/features/auth/store/authStore";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { professor } = useAuthStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground antialiased">
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content column */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top header — hidden on desktop */}
        <header className="flex items-center gap-3 px-4 h-14 border-b bg-white dark:bg-slate-900 lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Abrir menú de navegación"
            aria-expanded={sidebarOpen}
          >
            <Menu size={20} />
          </button>
          <img
            src="/logo-stability.png"
            alt="Stability Logo"
            className="h-8 w-auto object-contain"
          />

          {/* Avatar shortcut on mobile */}
          <div className="ml-auto w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0">
            {professor?.profileImage ? (
              <img
                src={professor.profileImage}
                alt={professor.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                person
              </span>
            )}
          </div>
        </header>

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
