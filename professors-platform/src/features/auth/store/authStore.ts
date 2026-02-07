import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string
    email: string
    name: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    login: (email: string) => Promise<void>
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: async (email) => {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500))
                set({
                    user: { id: '1', email, name: 'Professor User' },
                    isAuthenticated: true,
                })
            },
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        { name: 'auth-storage' }
    )
)
