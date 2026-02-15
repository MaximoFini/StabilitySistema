import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Inicio", href: "/inicio", icon: "home" },
    { name: "Dashboard", href: "/dashboard", icon: "bar_chart" },
    { name: "Biblioteca", href: "/biblioteca", icon: "fitness_center" },
    { name: "Planificador", href: "/planificador", icon: "calendar_month" },
]

export function Sidebar({ className }: { className?: string }) {
    const location = useLocation()

    return (
        <div className={cn("flex h-screen w-64 flex-col border-r bg-white dark:bg-slate-900", className)}>
            <div className="flex h-16 items-center px-6 border-b border-gray-100 dark:border-slate-800">
                <span className="text-xl font-bold tracking-tight text-primary">Stability</span>
            </div>
            <nav className="flex-1 space-y-1 p-3">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary",
                                isActive ? "bg-blue-50 dark:bg-blue-900/20 text-primary" : "text-gray-500 dark:text-slate-400"
                            )}
                        >
                            <span className={cn("material-symbols-outlined text-[24px]", isActive && "filled")}>
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                <button className="flex items-center gap-3 w-full px-2 py-2 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">Coach Admin</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-normal">admin@stability.com</p>
                    </div>
                </button>
            </div>
        </div>
    )
}
