import { createBrowserRouter } from "react-router-dom"
import MainLayout from "@/components/layout/MainLayout"
import { RequireAuth } from "@/components/layout/RequireAuth"
import RoleBasedDashboard from "@/features/dashboard/RoleBasedDashboard"
import Login from "@/features/auth/Login"
import RegisterPage from "@/features/auth/RegisterPage"
import StudentRegister from "@/features/auth/StudentRegister"
import StudentProfileSetup from "@/features/auth/StudentProfileSetup"
import StudentsList from "@/features/students/StudentsList"
import BusinessMetrics from "@/features/metrics/BusinessMetrics"
import Library from "@/features/library/Library"
import NewPlan from "@/features/plans/NewPlan"

// ── Student training screens ───────────────────────────────────────────────
import TrainingLayout from "@/features/training/TrainingLayout"
import TrainingHome from "@/features/training/TrainingHome"
import ExerciseList from "@/features/training/ExerciseList"
import ExerciseDetail from "@/features/training/ExerciseDetail"
import WorkoutComplete from "@/features/training/WorkoutComplete"
import { TrainingProgress, TrainingProfile } from "@/features/training/TrainingPlaceholders"

export const router = createBrowserRouter([
    // ── Coach routes (sidebar layout) ──────────────────────────────────────
    {
        path: "/",
        element: (
            <RequireAuth>
                <MainLayout />
            </RequireAuth>
        ),
        children: [
            {
                path: "/",
                element: <RoleBasedDashboard />,
            },
            {
                path: "inicio",
                element: <StudentsList />,
            },
            {
                path: "dashboard",
                element: <BusinessMetrics />,
            },
            {
                path: "biblioteca",
                element: <Library />,
            },
            {
                path: "planificador",
                element: <NewPlan />,
            },
        ],
    },

    // ── Student training routes (mobile layout with bottom nav) ─────────────
    {
        path: "/entrenamiento",
        element: (
            <RequireAuth>
                <TrainingLayout />
            </RequireAuth>
        ),
        children: [
            { index: true, element: <TrainingHome /> },
            { path: "progreso", element: <TrainingProgress /> },
            { path: "perfil", element: <TrainingProfile /> },
        ],
    },
    // Workout flow — full-screen, no bottom nav
    {
        path: "/entrenamiento/dia/:dayId",
        element: (
            <RequireAuth>
                <ExerciseList />
            </RequireAuth>
        ),
    },
    {
        path: "/entrenamiento/dia/:dayId/ejercicio/:exerciseNum",
        element: (
            <RequireAuth>
                <ExerciseDetail />
            </RequireAuth>
        ),
    },
    {
        path: "/entrenamiento/completado",
        element: (
            <RequireAuth>
                <WorkoutComplete />
            </RequireAuth>
        ),
    },

    // ── Auth routes ────────────────────────────────────────────────────────
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
    {
        path: "/register/student",
        element: <StudentRegister />,
    },
    {
        path: "/register/complete-profile",
        element: (
            <RequireAuth>
                <StudentProfileSetup />
            </RequireAuth>
        ),
    },
])
