import { createBrowserRouter, Navigate } from "react-router-dom"
import MainLayout from "@/components/layout/MainLayout"
import { RequireAuth } from "@/components/layout/RequireAuth"
import Login from "@/features/auth/Login"
import RegisterPage from "@/features/auth/RegisterPage"
import StudentRegister from "@/features/auth/StudentRegister"
import StudentsList from "@/features/students/StudentsList"
import BusinessMetrics from "@/features/metrics/BusinessMetrics"
import Library from "@/features/library/Library"
import NewPlan from "@/features/plans/NewPlan"
import ResourceLibrary from "@/features/resources/ResourceLibrary"

export const router = createBrowserRouter([
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
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: "dashboard",
                element: <StudentsList />,
            },
            {
                path: "metrics",
                element: <BusinessMetrics />,
            },
            {
                path: "library",
                element: <Library />,
            },
            {
                path: "plans",
                element: <NewPlan />,
            },
            {
                path: "resources",
                element: <ResourceLibrary />,
            },
        ],
    },
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
])
