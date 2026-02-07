import { createBrowserRouter } from "react-router-dom"
import MainLayout from "@/components/layout/MainLayout"
import Dashboard from "@/features/dashboard/Dashboard"
import Login from "@/features/auth/Login"
import { RequireAuth } from "@/components/layout/RequireAuth"

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
])
