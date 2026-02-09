# ARQUITECTURA DEL MÓDULO DE PROFESORES - PLATAFORMA DE ENTRENAMIENTO

Necesito que establezcas la arquitectura base del proyecto optimizada para vibecoding y desarrollo iterativo.

## STACK TÉCNICO DEFINITIVO
- Frontend: React 18+ con TypeScript
- Build tool: Vite
- Styling: Tailwind CSS
- Estado global: Zustand (más simple que Redux, perfecto para vibecoding)
- Routing: React Router v6
- Formularios: React Hook Form + Zod
- UI Components: shadcn/ui (componentes pre-construidos con Tailwind)
- Gráficos: Recharts
- Iconos: Lucide React
- Notificaciones: Sonner
- Autenticación: Firebase Auth (para Google OAuth fácil)
- Backend simulado: JSON Server (hasta integración real)

## CONFIGURACIÓN INICIAL

### 1. Crear proyecto base

### 2. Instalar dependencias

### 3. Setup Tailwind

### 4. Configurar path aliases en tsconfig.json

## PATRONES Y CONVENCIONES

### Zustand Stores (Estado Global)
```typescript
// Ejemplo: features/auth/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // lógica
        set({ user: userData, isAuthenticated: true })
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
)
```

### Custom Hooks
```typescript
// Ejemplo: features/students/hooks/useStudents.ts
export const useStudents = () => {
  const students = useStudentsStore((state) => state.students)
  const fetchStudents = useStudentsStore((state) => state.fetchStudents)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetchStudents().finally(() => setIsLoading(false))
  }, [])

  return { students, isLoading }
}
```

### Componentes
- Usar functional components con TypeScript
- Props siempre tipadas
- Extraer lógica compleja a custom hooks
- Componentes pequeños y reutilizables

## MANEJO DE AUTENTICACIÓN GOOGLE

**Implementación en ÚLTIMA FASE:**
- Dejar preparada la estructura en `features/auth`
- Por ahora usar auth simulada con email/password
- Cuando estemos listos, integrar Firebase Auth es solo configurar `lib/firebase.ts` y actualizar `authStore.ts`

## PRÓXIMOS PASOS

1. ✅ **Crear estructura de carpetas completa**
2. ✅ **Instalar todas las dependencias**
3. ✅ **Configurar Tailwind y path aliases**
4. ✅ **Crear layout base (Navbar + Sidebar)**
5. ✅ **Setup de routing básico**
6. → **CONTINUAR CON PROMPT 1: AUTENTICACIÓN**
