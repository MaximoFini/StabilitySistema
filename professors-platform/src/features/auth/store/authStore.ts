import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Professor {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'student' | 'coach'
    createdAt: string
    profileImage?: string
}

export interface RegisterData {
    firstName: string
    lastName: string
    email: string
    password: string
    role: 'student' | 'coach'
    acceptTerms: boolean
    acceptPrivacy: boolean
}

interface AuthState {
    professor: Professor | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    rememberMe: boolean

    // Actions
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => void
    clearError: () => void
    setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            professor: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            rememberMe: false,

            login: async (email, password, rememberMe = false) => {
                set({ isLoading: true, error: null })

                try {
                    // Simulate API call
                    await new Promise((resolve) => setTimeout(resolve, 800))

                    // Demo validation
                    if (email === 'demo@trainer.com' && password === 'Demo1234') {
                        set({
                            professor: {
                                id: '1',
                                email,
                                firstName: 'Juan',
                                lastName: 'Pérez',
                                role: 'coach',
                                createdAt: new Date().toISOString(),
                            },
                            isAuthenticated: true,
                            isLoading: false,
                            rememberMe,
                        })
                    } else if (email && password.length >= 6) {
                        // Accept any valid-looking credentials for testing
                        set({
                            professor: {
                                id: crypto.randomUUID(),
                                email,
                                firstName: 'Usuario',
                                lastName: 'Demo',
                                role: 'coach',
                                createdAt: new Date().toISOString(),
                            },
                            isAuthenticated: true,
                            isLoading: false,
                            rememberMe,
                        })
                    } else {
                        throw new Error('Credenciales inválidas')
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Error de autenticación',
                        isLoading: false
                    })
                    throw error
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null })

                try {
                    // Simulate API call
                    await new Promise((resolve) => setTimeout(resolve, 1000))

                    const newProfessor: Professor = {
                        id: crypto.randomUUID(),
                        email: data.email,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        role: data.role,
                        createdAt: new Date().toISOString(),
                    }

                    set({
                        professor: newProfessor,
                        isAuthenticated: true,
                        isLoading: false,
                        rememberMe: true,
                    })
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Error en el registro',
                        isLoading: false
                    })
                    throw error
                }
            },

            logout: () => {
                set({
                    professor: null,
                    isAuthenticated: false,
                    error: null,
                    rememberMe: false,
                })
            },

            clearError: () => set({ error: null }),

            setLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) =>
                state.rememberMe
                    ? { professor: state.professor, isAuthenticated: state.isAuthenticated, rememberMe: state.rememberMe }
                    : {},
        }
    )
)
