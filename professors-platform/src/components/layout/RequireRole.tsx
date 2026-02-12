import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/authStore"

interface RequireRoleProps {
    role: 'student' | 'coach'
    children: React.ReactNode
}

export function RequireRole({ role, children }: RequireRoleProps) {
    const professor = useAuthStore((state) => state.professor)

    if (!professor) {
        return <Navigate to="/login" replace />
    }

    if (professor.role !== role) {
        // Redirect to appropriate dashboard based on actual role
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
