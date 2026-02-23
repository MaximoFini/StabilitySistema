# SISTEMA DE AUTENTICACIÓN Y REGISTRO UNIFICADO - STABILITY

## 🎯 OBJETIVO

Implementar un sistema de autenticación unificado para profesores y alumnos utilizando **Supabase Auth** con soporte para inicio de sesión mediante email/contraseña y Google OAuth. El sistema debe redirigir automáticamente a los usuarios a la pantalla correspondiente según su rol (profesor o alumno) después de la autenticación.

---

## 📋 CONTEXTO DEL PROYECTO

**Repositorio:** MaximoFini/StabilitySistema  
**Plataforma:** `professors-platform`  
**Stack actual:**
- React 18+ con TypeScript
- Vite como build tool
- Tailwind CSS
- Zustand para estado global
- React Router v6
- React Hook Form + Zod
- shadcn/ui components
- Firebase Auth (actualmente configurado) → **MIGRAR A SUPABASE**

**⚠️ IMPORTANTE:** El proyecto ya tiene skills personalizados configurados en `.agents/skills/`. **Usa los skills cuando lo creas necesario** para mejorar la calidad y consistencia del código.

---

## 🎨 ESTILOS Y UI

### Referencia de Estilos

**CRÍTICO:** Para todos los componentes y pantallas, debes **copiar y adaptar los estilos** de los archivos HTML de referencia ubicados en:

- **Login:** `professors-platform/iu/iuinicio.html`
- **Registro:** `professors-platform/iu/iuregistro.html`
- **Registro Alumno Step 1:** `professors-platform/iu/step1registroalumno.html`
- **Registro Alumno Step 2:** `professors-platform/iu/step2registroalumno.html`
- **Registro Profe:** `professors-platform/iu/iuregistroprofe.html`

**NO inventes estilos nuevos.** Utiliza:
- La misma paleta de colores
- Los mismos espaciados y bordes redondeados
- Las mismas sombras y efectos
- Los mismos patrones de fondo (geo-pattern)
- Los mismos componentes de Material Symbols Outlined

### Componentes UI Existentes

Ya están disponibles en `professors-platform/src/components/ui/`:
- `Button`
- `Input`
- `Label`
- `Checkbox`
- `Card` (con CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- `Progress`

**Reutiliza estos componentes** y crea nuevos solo si es absolutamente necesario, siempre siguiendo los estilos de referencia.

### Instalación de Librerías

Instala **TODAS** las librerías necesarias para la correcta implementación:

```bash
npm install @supabase/supabase-js
npm install react-hook-form @hookform/resolvers zod
npm install sonner
npm install lucide-react
```

Si necesitas alguna librería adicional para la implementación de la UI o funcionalidad, instálala.

---

## 🏗️ ARQUITECTURA DE AUTENTICACIÓN

### 1. Configuración de Supabase

**Ubicación:** `professors-platform/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

**Variables de entorno necesarias** (`.env`):
```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```
---

## 🔐 FLUJO DE AUTENTICACIÓN

### Flujo General

1. **Pantalla de Login Unificada** (`/login`)
   - Misma pantalla para profesores y alumnos
   - Opciones: Email/Contraseña o Google OAuth
   - La mayoría preferirá Google

2. **Verificación de Perfil**
   - Al iniciar sesión, verificar si el usuario tiene perfil completo
   - Si NO tiene perfil → Redirigir a completar datos
   - Si tiene perfil → Redirigir según rol:
     - **Coach** → Dashboard de profesores
     - **Student** → Dashboard de alumnos

3. **Registro/Completar Datos**
   - **Profesores:** Un paso simple (nombre, apellido, teléfono, foto opcional)
   - **Alumnos:** Dos pasos:
     - **Step 1:** Datos personales (Nombre completo, Edad, Género, Teléfono, Instagram, Foto de Perfil)
     - **Step 2:** Datos físicos y antropométricos (Altura, Peso, Lesiones previas/Afecciones, Datos Antropométricos, Objetivo (Estetico, Deportivo, Salud, Rehabilitacion), deporte, experiencia)

---

## 📁 ESTRUCTURA DE ARCHIVOS A CREAR/MODIFICAR

```
professors-platform/
├── src/
│   ├── lib/
│   │   ├── supabase.ts (NUEVO - reemplaza firebase.ts)
│   │   └── firebase.ts (ELIMINAR después de migrar)
│   ├── features/
│   │   └── auth/
│   │       ├── Login.tsx (MODIFICAR - agregar Supabase + Google)
│   │       ├── RegisterPage.tsx (MODIFICAR - usar Supabase)
│   │       ├── StudentRegister.tsx (MODIFICAR - 2 steps con datos antropométricos)
│   │       ├── CoachCompleteProfile.tsx (NUEVO)
│   │       ├── StudentCompleteProfile.tsx (NUEVO - 2 steps)
│   │       ├── store/
│   │       │   └── authStore.ts (MODIFICAR - integrar Supabase)
│   │       └── hooks/
│   │           ├── useAuth.ts (NUEVO)
│   │           └── useGoogleAuth.ts (NUEVO)
│   ├── components/
│   │   └── layout/
│   │       └── RequireAuth.tsx (MODIFICAR - verificar perfil completo)
│   └── router/
│       └── index.tsx (MODIFICAR - agregar rutas de completar perfil)
└── .env (ACTUALIZAR con variables de Supabase)
```

---

## 🔨 IMPLEMENTACIÓN DETALLADA

### 1. Auth Store con Supabase (Zustand)

**Ubicación:** `professors-platform/src/features/auth/store/authStore.ts`

**Funcionalidades:**
- `loginWithEmail(email, password)` - Login con email/contraseña
- `loginWithGoogle()` - Login con Google OAuth
- `signUpWithEmail(email, password, role)` - Registro inicial
- `logout()` - Cerrar sesión
- `checkSession()` - Verificar sesión activa
- `updateProfile(data)` - Actualizar perfil de usuario
- `checkProfileComplete()` - Verificar si el perfil está completo

**Estado:**
```typescript
interface AuthState {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  profileComplete: boolean
  
  // Actions
  loginWithEmail: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signUpWithEmail: (email: string, password: string, role: 'student' | 'coach') => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  checkProfileComplete: () => Promise<boolean>
}
```

**Integración con Supabase:**
- Usar `supabase.auth.signInWithPassword()` para email/contraseña
- Usar `supabase.auth.signInWithOAuth({ provider: 'google' })` para Google
- Escuchar cambios de sesión con `supabase.auth.onAuthStateChange()`
- Verificar perfil completo consultando tablas `coach_profiles` o `student_profiles`

### 2. Pantalla de Login Unificada

**Ubicación:** `professors-platform/src/features/auth/Login.tsx`

**Características:**
- Formulario con email y contraseña
- Botón "Continuar con Google" (prominente, mayoría lo preferirá)
- Checkbox "Recordarme"
- Link "¿Olvidaste tu contraseña?"
- Link "¿No tienes cuenta? Regístrate"
- Validaciones con Zod
- Toast notifications con Sonner

**Estilos:** Copiar de `professors-platform/iu/iuinicio.html`

**Validación (Zod):**
```typescript
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  rememberMe: z.boolean().optional(),
})
```

**Lógica:**
1. Al hacer submit, llamar `loginWithEmail(email, password)`
2. Al hacer clic en Google, llamar `loginWithGoogle()`
3. Después del login exitoso, verificar perfil:
   - Si perfil incompleto → redirigir a `/complete-profile/coach` o `/complete-profile/student`
   - Si perfil completo → redirigir según rol a `/` (dashboard)

### 3. Registro Inicial (Selección de Rol)

**Ubicación:** `professors-platform/src/features/auth/RegisterPage.tsx`

**Modificar para:**
1. Agregar selección de rol (Coach/Student) ANTES del formulario
2. Integrar con Supabase
3. Después del registro:
   - Crear usuario en Supabase Auth
   - Actualizar rol en tabla `profiles`
   - Redirigir a completar perfil según rol

**Estilos:** Copiar de `professors-platform/iu/iuregistro.html`

### 4. Completar Perfil - Profesores

**Ubicación:** `professors-platform/src/features/auth/CoachCompleteProfile.tsx` (NUEVO)

**Formulario simple (1 paso):**
- Nombre
- Apellido
- Teléfono
- Foto de perfil (upload opcional - usar Supabase Storage)

**Validación:**
```typescript
const coachProfileSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  phone: z.string().min(8, 'Teléfono inválido'),
  profileImage: z.instanceof(File).optional(),
})
```

**Al completar:**
- Insertar en tabla `coach_profiles`
- Actualizar `profileComplete = true` en el store
- Redirigir a dashboard de profesores (`/`)

### 5. Completar Perfil - Alumnos (2 Steps)

**Ubicación:** `professors-platform/src/features/auth/StudentCompleteProfile.tsx` (NUEVO)

**Step 1 - Datos Personales:**
- Nombre completo, Edad, Género, Teléfono, Instagram, Foto de Perfil

**Step 2 - Datos Físicos y Antropométricos:**
- Altura, Peso, Lesiones previas/Afecciones, Datos Antropométricos, Objetivo (Estetico, Deportivo, Salud, Rehabilitacion), deporte, experiencia

**Validación Step 1:**
```typescript
const studentPersonalSchema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres'),
  age: z.number().min(13, 'Edad mínima 13 años').max(100, 'Edad inválida'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(8, 'Teléfono inválido'),
  instagram: z.string().optional(),
  profileImage: z.instanceof(File).optional(),
})
```

**Validación Step 2:**
```typescript
const studentPhysicalSchema = z.object({
  weight: z.number().positive('Peso debe ser positivo'),
  height: z.number().positive('Altura debe ser positiva'),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  muscleMass: z.number().positive().optional(),
  goal: z.enum(['weight_loss', 'muscle_gain', 'maintenance', 'performance']),
  activityLevel: z.enum(['sedentary', 'moderate', 'active', 'very_active']),
  medicalConditions: z.string().optional(),
})
```

**Al completar:**
- Insertar todos los datos en tabla `student_profiles`
- Subir foto a Supabase Storage si existe
- Actualizar `profileComplete = true` en el store
- Redirigir a dashboard de alumnos

**UI:**
- Mostrar indicador de progreso (Step 1 of 2, Step 2 of 2)
- Botones "Siguiente" y "Atrás"
- Guardar datos del Step 1 en estado local antes de pasar al Step 2

### 6. Google OAuth Setup

**Configuración en Supabase:**
1. Ir a Authentication > Providers > Google
2. Habilitar Google provider
3. Configurar Client ID y Client Secret de Google Cloud Console
4. Agregar redirect URL autorizada

**Implementación:**
```typescript
const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  
  if (error) throw error
}
```

**Callback Handler:**
Crear `professors-platform/src/features/auth/AuthCallback.tsx`:
- Manejar el redirect de Google OAuth
- Verificar sesión
- Verificar si perfil existe y está completo
- Redirigir apropiadamente

### 7. Protected Routes y Verificación de Perfil

**Ubicación:** `professors-platform/src/components/layout/RequireAuth.tsx`

**Modificar para:**
```typescript
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, profileComplete, user } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // Verificar sesión al montar
    useAuthStore.getState().checkSession()
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!profileComplete) {
    // Redirigir a completar perfil según rol
    const role = user?.role
    if (role === 'coach') {
      return <Navigate to="/complete-profile/coach" replace />
    } else if (role === 'student') {
      return <Navigate to="/complete-profile/student" replace />
    }
  }

  return children
}
```

### 8. Router Configuration

**Ubicación:** `professors-platform/src/router/index.tsx`

**Actualizar rutas:**
```typescript
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/complete-profile/coach",
    element: <CoachCompleteProfile />,
  },
  {
    path: "/complete-profile/student",
    element: <StudentCompleteProfile />,
  },
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
        element: <Dashboard />, // Se mostrará dashboard según rol
      },
      // ... otras rutas protegidas
    ],
  },
])
```

---

## 🧪 TESTING Y VALIDACIÓN

### Flujos a Testear

1. **Login con Email/Contraseña:**
   - Login exitoso con perfil completo → Dashboard correcto
   - Login exitoso sin perfil → Completar perfil
   - Login fallido → Mensaje de error

2. **Login con Google:**
   - Primera vez (sin perfil) → Completar perfil
   - Usuario existente → Dashboard correcto
   - Error de OAuth → Manejo apropiado

3. **Registro:**
   - Registro como Coach → Completar perfil coach → Dashboard coach
   - Registro como Student → Step 1 → Step 2 → Dashboard student
   - Validaciones de formulario funcionando

4. **Navegación:**
   - Usuario no autenticado intenta acceder a ruta protegida → Redirect a login
   - Usuario autenticado sin perfil completo → Redirect a completar perfil
   - Logout → Limpieza de sesión

5. **Persistencia:**
   - "Recordarme" mantiene sesión
   - Refresh de página mantiene autenticación
   - Tokens se renuevan automáticamente

---

## 📝 NOTAS IMPORTANTES

### Para Antigravity:

1. **Usa los skills cuando lo creas necesario** - El proyecto tiene skills configurados en `.agents/skills/`, úsalos para mejorar calidad y consistencia.

2. **Copia los estilos exactos** de `professors-platform/iu/iuinicio.html` y `professors-platform/iu/iuregistro.html`. NO inventes estilos nuevos.

3. **Instala TODAS las dependencias necesarias**, incluyendo:
   - `@supabase/supabase-js`
   - Cualquier otra que necesites para la UI o funcionalidad

4. **Elimina Firebase** después de completar la migración a Supabase:
   - Borrar `professors-platform/src/lib/firebase.ts`
   - Remover dependencias de Firebase del `package.json`
   - Actualizar cualquier referencia a Firebase en el código

5. **Supabase Storage** para imágenes de perfil:
   - Crear bucket `profile-images` en Supabase Storage
   - Implementar upload de imágenes en los formularios de perfil
   - Guardar URL pública en las tablas correspondientes

6. **Manejo de errores robusto:**
   - Toast notifications para todos los errores
   - Mensajes claros y en español
   - Loading states en todos los botones y formularios

7. **Responsive design: (muy importante, sobre todo para los alumnos)**
   - Todos los componentes deben verse bien en móvil, tablet y desktop
   - Usar los breakpoints de Tailwind correctamente

8. **Accesibilidad:**
   - Labels correctos en todos los inputs
   - ARIA attributes donde corresponda
   - Navegación por teclado funcional

---

## ✅ ENTREGABLES ESPERADOS

1. ✅ Sistema de autenticación con Supabase funcionando
2. ✅ Login con email/contraseña y Google OAuth
3. ✅ Registro con selección de rol
4. ✅ Formulario de completar perfil para profesores (1 paso)
5. ✅ Formulario de completar perfil para alumnos (2 pasos)
6. ✅ Redirección automática según rol y estado de perfil
7. ✅ Protected routes con verificación de perfil
8. ✅ Upload de imágenes de perfil a Supabase Storage
9. ✅ Persistencia de sesión y auto-refresh de tokens
10. ✅ UI consistente con los archivos de referencia HTML
11. ✅ Validaciones robustas con Zod
12. ✅ Manejo de errores y loading states
13. ✅ Todas las dependencias instaladas
14. ✅ Firebase completamente removido

---

## 🚀 PRIORIDAD DE IMPLEMENTACIÓN

1. **Fase 1:** Configuración de Supabase + Auth Store
2. **Fase 2:** Login unificado (email + Google)
3. **Fase 3:** Completar perfil profesores
4. **Fase 4:** Completar perfil alumnos (2 steps)
5. **Fase 5:** Protected routes + redirecciones
6. **Fase 6:** Testing completo + refinamiento

---

## 📚 RECURSOS

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase OAuth (Google)](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

---

**¡Adelante Antigravity! 🚀 Espero un resultado impecable siguiendo todas estas especificaciones.**