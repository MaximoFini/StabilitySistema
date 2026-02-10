import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "@/router"
import { useAuthStore } from "@/features/auth/store/authStore"

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return <RouterProvider router={router} />
}

export default App
