import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Inicio', icon: 'home', path: '/entrenamiento' },
  { label: 'Progreso', icon: 'bar_chart', path: '/entrenamiento/progreso' },
  { label: 'Perfil', icon: 'person', path: '/entrenamiento/perfil' },
]

export default function TrainingLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const activeTab = tabs.findIndex((t) => {
    if (t.path === '/entrenamiento') {
      return location.pathname === '/entrenamiento' || location.pathname === '/entrenamiento/'
    }
    return location.pathname.startsWith(t.path)
  })

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f7f9fc] dark:bg-slate-950">
      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>

      {/* Bottom navigation — only shown on screens that aren't in the active workout flow */}
      <nav className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 safe-area-pb">
        <div className="flex items-center h-[60px] px-2">
          {tabs.map((tab, i) => {
            const isActive = activeTab === i
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 h-full rounded-xl transition-colors min-h-[44px]',
                  isActive
                    ? 'text-primary'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
                )}
              >
                <span
                  className={cn(
                    'material-symbols-outlined text-[22px] transition-all',
                    isActive && 'filled scale-110',
                  )}
                >
                  {tab.icon}
                </span>
                <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
