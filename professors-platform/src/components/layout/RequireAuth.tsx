import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/authStore"

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}
