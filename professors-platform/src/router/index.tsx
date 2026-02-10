import { createBrowserRouter } from "react-router-dom"
import MainLayout from "@/components/layout/MainLayout"
import { RequireAuth } from "@/components/layout/RequireAuth"
import RoleBasedDashboard from "@/features/dashboard/RoleBasedDashboard"
import Login from "@/features/auth/Login"
import RegisterPage from "@/features/auth/RegisterPage"
import StudentRegister from "@/features/auth/StudentRegister"
import StudentProfileSetup from "@/features/auth/StudentProfileSetup"

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
                element: <RoleBasedDashboard />,
            },
            // protected routes go here
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
    {
        path: "/register/complete-profile",
        element: (
            <RequireAuth>
                <StudentProfileSetup />
            </RequireAuth>
        ),
    },
])
