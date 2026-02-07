import { Link, useLocation } from "react-router-dom"
import { Home, Users, BookOpen, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Students", href: "/students", icon: Users },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
    const location = useLocation()

    return (
        <div className={cn("flex h-screen w-64 flex-col border-r bg-card", className)}>
            <div className="flex h-14 items-center border-b px-6 font-bold text-lg tracking-tight">
                Professors Platform
            </div>
            <nav className="flex-1 space-y-1 p-3">
                {navigation.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    )
}
