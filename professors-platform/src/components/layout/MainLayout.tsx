import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export default function MainLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground antialiased">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Outlet />
            </main>
        </div>
    )
}
