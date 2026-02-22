## CONTEXTO

Proyecto: `professors-platform` — React + TypeScript + Vite + React Router v6 + Zustand + Supabase.
Estoy teniendo tiempos de carga lentos. Necesito que implementes las siguientes optimizaciones de performance, una por una, sin romper ninguna funcionalidad existente.

---

## PROBLEMA 1 (CRÍTICO): No hay code splitting — bundle monolítico

**Archivo:** `professors-platform/src/router/index.tsx`

**Problema:** Todos los componentes de página se importan de forma estática al inicio de la app. Esto significa que cuando alguien abre `/login`, el browser descarga el código de `NewPlan`, `BusinessMetrics`, `Library`, `TrainingLayout`, etc. — todo innecesariamente.

**Solución:** Convertir todos los imports de páginas a `lazy()` de React con `Suspense`.

**Implementar así:**

```typescript
import { lazy, Suspense } from "react"
import { createBrowserRouter } from "react-router-dom"
import { RequireAuth } from "@/components/layout/RequireAuth"

// Skeleton/fallback para Suspense
function PageSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">
        progress_activity
      </span>
    </div>
  )
}

// Helper para wrappear en Suspense
function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  )
}

// TODOS los imports de páginas deben ser lazy:
const MainLayout = lazy(() => import("@/components/layout/MainLayout"))
const RoleBasedDashboard = lazy(() => import("@/features/dashboard/RoleBasedDashboard"))
const Login = lazy(() => import("@/features/auth/Login"))
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage"))
const StudentRegister = lazy(() => import("@/features/auth/StudentRegister"))
const StudentProfileSetup = lazy(() => import("@/features/auth/StudentProfileSetup"))
const StudentsList = lazy(() => import("@/features/students/StudentsList"))
const BusinessMetrics = lazy(() => import("@/features/metrics/BusinessMetrics"))
const Library = lazy(() => import("@/features/library/Library"))
const NewPlan = lazy(() => import("@/features/plans/NewPlan"))
const TrainingLayout = lazy(() => import("@/features/training/TrainingLayout"))
const TrainingHome = lazy(() => import("@/features/training/TrainingHome"))
const ExerciseList = lazy(() => import("@/features/training/ExerciseList"))
const ExerciseDetail = lazy(() => import("@/features/training/ExerciseDetail"))
const WorkoutComplete = lazy(() => import("@/features/training/WorkoutComplete"))
// TrainingPlaceholders — importar los named exports así:
const TrainingPlaceholders = lazy(() => import("@/features/training/TrainingPlaceholders"))

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <Suspense fallback={<PageSkeleton />}>
          <MainLayout />
        </Suspense>
      </RequireAuth>
    ),
    children: [
      { path: "/", element: withSuspense(RoleBasedDashboard) },
      { path: "inicio", element: withSuspense(StudentsList) },
      { path: "dashboard", element: withSuspense(BusinessMetrics) },
      { path: "biblioteca", element: withSuspense(Library) },
      { path: "planificador", element: withSuspense(NewPlan) },
    ],
  },
  // ... resto de rutas igual pero con withSuspense()
])
```

**IMPORTANTE para TrainingPlaceholders** (tiene named exports, no default export):

```typescript
// Crear lazy wrappers para los named exports:
const TrainingProgress = lazy(() =>
  import("@/features/training/TrainingPlaceholders").then((m) => ({
    default: m.TrainingProgress,
  })),
);
const TrainingProfile = lazy(() =>
  import("@/features/training/TrainingPlaceholders").then((m) => ({
    default: m.TrainingProfile,
  })),
);
```

---

## PROBLEMA 2 (CRÍTICO): `RequireAuth` muestra spinner artificial en cada navegación

**Archivo:** `professors-platform/src/components/layout/RequireAuth.tsx`

**Problema:** Hay un `setTimeout` de 100ms que siempre muestra un spinner, incluso cuando el usuario ya está autenticado y el estado está en memoria. Esto hace que cada navegación entre páginas tenga un flash de spinner innecesario.

**Solución:** Usar `useRef` para detectar si es la primera hidratación (cuando el store puede no estar listo aún) vs una navegación normal (donde el estado ya está en memoria):

```typescript
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useRef } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const professor = useAuthStore((state) => state.professor);
  const location = useLocation();

  // Si el store de Zustand ya tiene datos persistidos (localStorage hydration),
  // isAuthenticated ya es true desde el primer render — no necesitamos esperar.
  // Solo necesitamos el delay si ambos son false/null (cold start o no autenticado).
  const isHydrated = isAuthenticated || professor !== null;

  // Si no está autenticado ni hay datos → redirigir al login
  if (!isAuthenticated && !professor) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

**Por qué funciona:** Zustand con `persist` hidrata el estado SINCRONAMENTE desde localStorage antes del primer render. Así que si el usuario está logueado, `isAuthenticated` ya es `true` en el primer render — no hace falta esperar 100ms.

---

## PROBLEMA 3 (ALTO): `loadFromStorage()` se llama en cada re-render de `NewPlan`

**Archivo:** `professors-platform/src/features/plans/NewPlan.tsx`

**Problema:** La línea `const savedData = isEditMode ? null : loadFromStorage()` está en el body del componente, fuera del useState. Esto hace que lea y parsee el localStorage en CADA re-render del componente (incluyendo cuando se tipea en un campo).

**Solución:** Usar lazy initialization de `useState`:

```typescript
// ❌ ANTES — se ejecuta en cada render:
const savedData = isEditMode ? null : loadFromStorage();
const [exercises, setExercises] = useState<PlanExercise[]>(savedData?.exercises || [...])
const [startDate, setStartDate] = useState<Date>(savedData?.startDate || new Date(2026, 1, 18))
// etc...

// ✅ DESPUÉS — se ejecuta UNA sola vez, al montar:
const [exercises, setExercises] = useState<PlanExercise[]>(() => {
  if (isEditMode) return [{ id: "1", day_id: "1", stage_id: "", stage_name: "Activación", exercise_name: "Plancha Lateral + Remo", series: 3, reps: "30s", intensity: 6, pause: "20s", notes: "Flexibilidad estática y dinámica", order: 0 }]
  const saved = loadFromStorage()
  return saved?.exercises || [{ id: "1", day_id: "1", stage_id: "", stage_name: "Activación", exercise_name: "Plancha Lateral + Remo", series: 3, reps: "30s", intensity: 6, pause: "20s", notes: "Flexibilidad estática y dinámica", order: 0 }]
})

const [startDate, setStartDate] = useState<Date>(() => {
  if (isEditMode) return new Date(2026, 1, 18)
  const saved = loadFromStorage()
  return saved?.startDate || new Date(2026, 1, 18)
})

const [endDate, setEndDate] = useState<Date>(() => {
  if (isEditMode) return new Date(2026, 1, 25)
  const saved = loadFromStorage()
  return saved?.endDate || new Date(2026, 1, 25)
})

const [days, setDays] = useState<Day[]>(() => {
  if (isEditMode) return [{ id: "1", number: 1, name: "Día 1" }]
  const saved = loadFromStorage()
  return saved?.days || [{ id: "1", number: 1, name: "Día 1" }]
})

const [activeDay, setActiveDay] = useState<string>(() => {
  if (isEditMode) return "1"
  const saved = loadFromStorage()
  return saved?.activeDay || "1"
})

const [planTitle, setPlanTitle] = useState<string>(() => {
  if (isEditMode) return "Nuevo Plan: Hipertrofia Fase 1"
  const saved = loadFromStorage()
  return saved?.planTitle || "Nuevo Plan: Hipertrofia Fase 1"
})

// Eliminar completamente la línea:
// const savedData = isEditMode ? null : loadFromStorage(); ← BORRAR ESTA LÍNEA
```

Nota: para evitar llamar `loadFromStorage()` 6 veces (una por useState), podés crear un helper:

```typescript
// Al principio de NewPlan(), antes de los useState:
const initialData = useRef<ReturnType<typeof loadFromStorage> | null>(
  isEditMode ? null : loadFromStorage(),
);
// Y luego usar initialData.current en cada useState lazy
```

---

## PROBLEMA 4 (MEDIO): Auto-save de `NewPlan` debounce demasiado corto

**Archivo:** `professors-platform/src/features/plans/NewPlan.tsx`

**Problema:** El `useEffect` de auto-save tiene un debounce de solo 300ms. Cada keystroke en los campos de texto dispara el efecto y serializa todo el estado a JSON.

**Solución:** Aumentar el debounce a 1000ms y mover el `saveToStorage` dentro del setTimeout:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setSaveStatus("saving");
    const dataToSave = {
      exercises,
      days,
      activeDay,
      startDate,
      endDate,
      planTitle,
    };
    saveToStorage(dataToSave); // ← mover DENTRO del timeout

    setSaveStatus("saved");
    const clearTimer = setTimeout(() => setSaveStatus(null), 2000);
    return () => clearTimeout(clearTimer);
  }, 1000); // ← aumentar de 300ms a 1000ms

  return () => clearTimeout(timer);
}, [exercises, days, activeDay, startDate, endDate, planTitle]);
```

---

## RESUMEN DE ARCHIVOS A MODIFICAR

1. `professors-platform/src/router/index.tsx` → lazy imports + Suspense en todas las rutas
2. `professors-platform/src/components/layout/RequireAuth.tsx` → eliminar setTimeout, usar hydration sync
3. `professors-platform/src/features/plans/NewPlan.tsx` → lazy useState init + debounce 1000ms

## NO TOCAR

- `authStore.ts` — no modificar
- Ningún componente de UI, hooks de Supabase ni lógica de negocio
- El diseño visual de ninguna pantalla
- No instalar dependencias nuevas

## VERIFICAR DESPUÉS

Correr `npm run build` en `professors-platform/` y verificar que el output muestre múltiples chunks separados (chunks de ~50-200KB cada uno en vez de un solo bundle grande).
