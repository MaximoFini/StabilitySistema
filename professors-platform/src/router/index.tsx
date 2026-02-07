import { createBrowserRouter } from "react-router-dom"
import MainLayout from "@/components/layout/MainLayout"
import { RequireAuth } from "@/components/layout/RequireAuth"
import Dashboard from "@/features/dashboard/Dashboard"
import Login from "@/features/auth/Login"
import RegisterPage from "@/features/auth/RegisterPage"

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
                element: <Dashboard />,
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
])
