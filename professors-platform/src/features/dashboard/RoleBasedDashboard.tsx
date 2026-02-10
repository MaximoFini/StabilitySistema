import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/authStore"
import StudentDashboard from "./StudentDashboard"
import CoachDashboard from "./CoachDashboard"

export default function RoleBasedDashboard() {
    const { professor } = useAuthStore()

    if (!professor) {
        return <Navigate to="/login" replace />
    }

    // If student and profile is incomplete, redirect to complete profile
    if (professor.role === 'student' && !professor.hasCompletedProfile) {
        return <Navigate to="/register/complete-profile" replace />
    }

    // Show appropriate dashboard based on role
    if (professor.role === 'student') {
        return <StudentDashboard />
    }

    return <CoachDashboard />
}
