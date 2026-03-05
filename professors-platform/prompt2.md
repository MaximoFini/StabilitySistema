# 🚀 Plan de Optimización de Rendimiento Móvil - Stability Sistema

## Contexto

La aplicación muestra un **Interaction to Next Paint (INP) de 1,568ms** en mobile (P75), lo cual está marcado como "Poor". El umbral ideal es **<200ms**. Esto significa que la app está tardando casi **8x más** de lo recomendado en responder a las interacciones del usuario.

La app es una plataforma de entrenamiento con:

- **Stack**: React 19 + TypeScript + Vite + Supabase
- **Tipo**: Progressive Web App (PWA)
- **Rutas críticas con peor rendimiento**:
  - `/login` (1568ms)
  - `/entrenamiento` (1736ms)
  - `/inicio` (4704ms)
  - `/` (1280ms)
  - `/entrenamiento/perfil` (1656ms)

---

## 🎯 Objetivos de Optimización

1. **Reducir INP de 1,568ms a <200ms** (objetivo: 150ms o menos)
2. **Mejorar First Input Delay** de 32ms a <16ms
3. **Optimizar rutas de entrenamiento móvil** que son las más usadas por alumnos
4. **Mantener la funcionalidad actual** mientras se aplican las optimizaciones

---

## 🔴 PRIORIDAD CRÍTICA: Re-renders Innecesarios

### Problema Detectado

Basándome en el código analizado, hay varios patrones que causan re-renders excesivos:

#### 1. **Zustand Store sin Selectores Específicos**

**Archivo**: `src/features/training/TrainingHome.tsx`

```typescript
// ❌ MAL: Re-renderiza el componente CADA VEZ que CUALQUIER propiedad del store cambia
const { currentDay, isWorkoutComplete } = useTrainingStore();
```

**Solución**:

```typescript
// ✅ BIEN: Solo re-renderiza cuando currentDay o isWorkoutComplete cambian
const currentDay = useTrainingStore((state) => state.currentDay);
const isWorkoutComplete = useTrainingStore((state) => state.isWorkoutComplete);
```

**Archivos a modificar**:

- `src/features/training/TrainingHome.tsx` (líneas ~20-30)
- `src/features/training/ExerciseDetail.tsx` (líneas ~100-110)
- `src/features/training/ExerciseList.tsx`
- `src/features/training/TrainingProgress.tsx`
- `src/features/training/TrainingProfile.tsx`
- `src/components/layout/MainLayout.tsx` (línea 14)
- `src/features/students/StudentProfile.tsx`

#### 2. **Hook useActiveAssignment que Ejecuta Queries Pesadas**

**Archivo**: `src/hooks/useActiveAssignment.ts`

```typescript
// ❌ PROBLEMA: Hace 2 queries en paralelo en CADA render inicial
const [assignmentResult, completionsResult] = await Promise.all([
  supabase.from("training_plan_assignments").select(...),
  supabase.from("workout_completions").select(...)
]);
```

**Impacto**: La ruta `/entrenamiento` (1736ms INP) ejecuta esto en cada carga.

**Solución Inmediata**:

```typescript
// ✅ Agregar memoización con React.cache para deduplicación
import { cache } from 'react';

const fetchAssignment = cache(async (userId: string, todayISO: string) => {
  return await supabase
    .from("training_plan_assignments")
    .select(...)
    .eq("student_id", userId)
    .gte("end_date", todayISO)
    .eq("status", "active")
    .order("start_date", { ascending: false })
    .limit(1)
    .single();
});

const fetchCompletions = cache(async (assignmentId: string) => {
  return await supabase
    .from("workout_completions")
    .select("day_id")
    .eq("assignment_id", assignmentId);
});
```

#### 3. **Componentes Sin Memoización que Se Re-crean en Cada Render**

**Archivo**: `src/features/training/ExerciseDetail.tsx`

```typescript
// ❌ MAL: Este componente se recrea completamente en cada render del padre
function ExerciseDetail() {
  const navigate = useNavigate();
  const { dayId, exerciseNum } = useParams();
  // ... lógica pesada
}
```

**Solución**:

```typescript
// ✅ BIEN: Memoizar el componente completo
import { memo } from "react";

const ExerciseDetail = memo(function ExerciseDetail() {
  const navigate = useNavigate();
  const { dayId, exerciseNum } = useParams();
  // ... lógica pesada
});

export default ExerciseDetail;
```

**Archivos a memoizar**:

- `src/features/training/ExerciseDetail.tsx`
- `src/features/training/MoodCheckScreen.tsx`
- `src/features/training/WorkoutComplete.tsx`
- `src/components/InstallPWABanner.tsx`

---

## 🟠 PRIORIDAD ALTA: Carga de Imágenes y Assets

### Problema Detectado

#### 1. **Imágenes Sin Optimización**

**Archivo**: `src/features/auth/RegisterPage.tsx` (línea 147)

```tsx
<img
  alt="Gym weights background"
  className="w-full h-full object-cover opacity-40 mix-blend-multiply"
  src="https://images.unsplash.com/photo-..."
/>
```

**Problemas**:

- ❌ Carga imagen de Unsplash sin optimización
- ❌ No usa lazy loading
- ❌ No usa WebP
- ❌ No tiene sizes/srcset para responsive

**Solución**:

```tsx
<img
  alt="Gym weights background"
  className="w-full h-full object-cover opacity-40 mix-blend-multiply"
  src="https://images.unsplash.com/photo-...?w=800&q=80&fm=webp"
  srcSet="
    https://images.unsplash.com/photo-...?w=400&q=80&fm=webp 400w,
    https://images.unsplash.com/photo-...?w=800&q=80&fm=webp 800w,
    https://images.unsplash.com/photo-...?w=1200&q=80&fm=webp 1200w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
  decoding="async"
/>
```

**Archivos a modificar**:

- `src/features/auth/RegisterPage.tsx`
- `src/features/auth/Login.tsx`
- `src/features/training/TrainingHome.tsx` (imagen de hero)
- `src/features/resources/ResourceLibrary.tsx` (línea 74)

#### 2. **Google Fonts Bloqueando el Render**

**Archivo**: `index.html`

```html
<!-- ❌ MAL: Fonts bloquean el render -->
<link
  href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap"
  rel="stylesheet"
/>
```

**Solución**:

```html
<!-- ✅ BIEN: Preconnect + font-display + subset -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;600&family=Playfair+Display:wght@700&display=swap&text=StabilityPlatformCoachAlumnoDashboardEntrenamiProg"
  rel="stylesheet"
/>
```

**O mejor aún, self-host las fonts**:

1. Descargar Lexend y Playfair desde Google Fonts
2. Colocarlas en `/public/fonts/`
3. Usar `@font-face` en CSS

---

## 🟡 PRIORIDAD MEDIA: Optimización de JavaScript

### 1. **Estado Derivado Calculado en useEffect**

**Archivo**: `src/features/training/ExerciseList.tsx` (inferido)

```typescript
// ❌ MAL: Si hay lógica como esta
const [filteredExercises, setFilteredExercises] = useState([]);

useEffect(() => {
  setFilteredExercises(
    exercises.filter((ex) => ex.category === selectedCategory),
  );
}, [exercises, selectedCategory]);
```

**Solución**:

```typescript
// ✅ BIEN: Calcular durante el render
const filteredExercises = useMemo(
  () => exercises.filter((ex) => ex.category === selectedCategory),
  [exercises, selectedCategory],
);
```

### 2. **Variables Transitorias en useState**

**Archivo**: `src/features/training/ExerciseDetail.tsx` (línea 95)

```typescript
// ❌ Si hay algo como esto (para timers, posiciones, etc.)
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

useEffect(() => {
  const handleMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
  window.addEventListener("mousemove", handleMove);
  return () => window.removeEventListener("mousemove", handleMove);
}, []);
```

**Solución**:

```typescript
// ✅ BIEN: Usar useRef para valores que no necesitan re-render
const mousePosition = useRef({ x: 0, y: 0 });

useEffect(() => {
  const handleMove = (e) => {
    mousePosition.current = { x: e.clientX, y: e.clientY };
  };
  window.addEventListener("mousemove", handleMove);
  return () => window.removeEventListener("mousemove", handleMove);
}, []);
```

### 3. **Componentes Estáticos Recreándose**

**Archivo**: `src/components/layout/Sidebar.tsx`

```typescript
// ❌ MAL: Este array se recrea en cada render
function Sidebar() {
  const navigation = [
    { name: "Alumnos", href: "/inicio", icon: "group" },
    { name: "Planificador", href: "/planificador", icon: "calendar_month" },
    // ...
  ];
}
```

**Solución**:

```typescript
// ✅ BIEN: Mover fuera del componente
const NAVIGATION_ITEMS = [
  { name: "Alumnos", href: "/inicio", icon: "group" },
  { name: "Planificador", href: "/planificador", icon: "calendar_month" },
  // ...
] as const;

function Sidebar() {
  // Usa NAVIGATION_ITEMS
}
```

---

## 🔵 OPTIMIZACIONES ESPECÍFICAS POR RUTA

### 1. `/login` (1568ms INP)

**Archivos**: `src/features/auth/Login.tsx`

**Optimizaciones**:

```typescript
// 1. Lazy load de validación Zod
const loginSchema = lazy(() => import('./schemas/loginSchema'));

// 2. Defer de animaciones
import { useTransition } from 'react';
const [isPending, startTransition] = useTransition();

const handleSubmit = async (data) => {
  startTransition(() => {
    // Lógica de submit
  });
};

// 3. Preload de la siguiente ruta
<Link to="/inicio" onMouseEnter={() => {
  import('@/features/dashboard/RoleBasedDashboard');
}}>
  Login
</Link>
```

### 2. `/entrenamiento` (1736ms INP)

**Archivos**:

- `src/features/training/TrainingHome.tsx`
- `src/features/training/TrainingLayout.tsx`

**Optimizaciones**:

```typescript
// 1. Virtualizar lista de ejercicios si hay más de 10
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: exercises.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
  overscan: 5,
});

// 2. Separar el banner de instalación PWA en un chunk separado
const InstallPWABanner = lazy(() => import('@/components/InstallPWABanner'));

// 3. Usar React.Activity para el bottom nav
import { Activity } from 'react';

<Activity mode={isVisible ? 'visible' : 'hidden'}>
  <BottomNavigation />
</Activity>
```

### 3. `/inicio` (4704ms INP) - EL MÁS CRÍTICO

**Archivo**: `src/features/students/StudentsList.tsx` (inferido)

**Optimizaciones**:

```typescript
// 1. Implementar paginación virtual
import { useInfiniteQuery } from '@tanstack/react-query';

const {
  data,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery({
  queryKey: ['students'],
  queryFn: ({ pageParam = 0 }) => fetchStudents(pageParam),
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
});

// 2. Debounce del search
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value) => setSearchQuery(value),
  300
);

// 3. Memoizar las cards de estudiantes
const StudentCard = memo(({ student }) => {
  return (/* ... */);
});
```

---

## 🛠️ IMPLEMENTACIÓN: Orden Recomendado

### Fase 1: Quick Wins (2-4 horas) - **Impacto: -40% INP**

1. ✅ Convertir todos los `useTrainingStore()` a selectores específicos
2. ✅ Agregar `memo()` a `ExerciseDetail`, `MoodCheckScreen`, `WorkoutComplete`
3. ✅ Agregar `loading="lazy"` a TODAS las imágenes
4. ✅ Optimizar Google Fonts (preconnect + display=swap + subset)

### Fase 2: Optimizaciones de Estado (4-6 horas) - **Impacto: -30% INP**

1. ✅ Refactorizar `useActiveAssignment` con React.cache
2. ✅ Mover arrays/objetos constantes fuera de componentes
3. ✅ Reemplazar useState por useRef donde no se necesite re-render
4. ✅ Convertir efectos que setean estado derivado a cálculos directos

### Fase 3: Optimizaciones Avanzadas (6-8 horas) - **Impacto: -20% INP**

1. ✅ Implementar virtualización en listas largas (`/inicio`, `/biblioteca`)
2. ✅ Agregar code splitting agresivo con dynamic imports
3. ✅ Implementar React Query para cacheo de datos de Supabase
4. ✅ Usar `useTransition` para operaciones no urgentes

### Fase 4: Imágenes y Assets (2-3 horas) - **Impacto: -10% INP**

1. ✅ Convertir todas las imágenes a WebP con srcset
2. ✅ Self-host Google Fonts
3. ✅ Agregar `content-visibility: auto` a cards off-screen
4. ✅ Implementar skeleton screens para estados de carga

---

## 📊 Monitoreo Post-Implementación

### Métricas a Trackear

Después de cada fase, medir en **Chrome DevTools > Performance**:

```javascript
// Agregar estos logs temporales en producción
performance.mark("interaction-start");
// ... lógica de interacción
performance.mark("interaction-end");
performance.measure("INP", "interaction-start", "interaction-end");

console.log(performance.getEntriesByName("INP")[0].duration);
```

### Objetivos por Fase

- **Fase 1**: INP < 900ms (actual: 1568ms)
- **Fase 2**: INP < 500ms
- **Fase 3**: INP < 250ms
- **Fase 4**: INP < 150ms ✅

---

## 🚨 Advertencias Importantes

### NO Hacer Estas Optimizaciones (Son Contraproducentes)

❌ **NO usar `useMemo` para expresiones simples**:

```typescript
// ❌ MAL
const isLoading = useMemo(() => user.isLoading || data.isLoading, [user, data]);

// ✅ BIEN
const isLoading = user.isLoading || data.isLoading;
```

❌ **NO crear RegExp en cada render**:

```typescript
// ❌ MAL
function Highlighter({ query }) {
  const regex = new RegExp(query, "gi"); // Se recrea en cada render
}

// ✅ BIEN
function Highlighter({ query }) {
  const regex = useMemo(() => new RegExp(query, "gi"), [query]);
}
```

❌ **NO usar `&&` para renderizado condicional (causa hydration mismatches)**:

```typescript
// ❌ MAL
{count && <div>{count} items</div>}

// ✅ BIEN
{count > 0 ? <div>{count} items</div> : null}
```

---

## 🔍 Testing en Live Coding

Como estás **vivecodeando**, aquí hay un checklist para testing rápido:

### 1. **Simular Throttling de CPU**

En Chrome DevTools:

- Performance Tab > CPU: 6x slowdown
- Grabar interacción
- Ver si INP baja a <200ms

### 2. **Testing en Dispositivo Real**

```bash
# Tunnel local a móvil
npx localtunnel --port 5173

# O usar Vercel Preview
vercel --prod
```

### 3. **Lighthouse CI en Cada Commit**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://your-preview-url.vercel.app/login
            https://your-preview-url.vercel.app/entrenamiento
          uploadArtifacts: true
```

---

## 📝 Checklist de Implementación

Usa esto para ir marcando progreso:

```markdown
### Fase 1: Quick Wins

- [ ] Refactorizar useTrainingStore en TrainingHome.tsx
- [ ] Refactorizar useTrainingStore en ExerciseDetail.tsx
- [ ] Refactorizar useTrainingStore en ExerciseList.tsx
- [ ] Refactorizar useTrainingStore en TrainingProgress.tsx
- [ ] Refactorizar useTrainingStore en TrainingProfile.tsx
- [ ] Refactorizar useAuthStore en MainLayout.tsx
- [ ] Agregar memo() a ExerciseDetail
- [ ] Agregar memo() a MoodCheckScreen
- [ ] Agregar memo() a WorkoutComplete
- [ ] Agregar memo() a InstallPWABanner
- [ ] Agregar loading="lazy" a imagen en RegisterPage
- [ ] Agregar loading="lazy" a imagen en Login
- [ ] Agregar loading="lazy" a imagen en TrainingHome hero
- [ ] Agregar loading="lazy" a imagen en ResourceLibrary
- [ ] Optimizar Google Fonts en index.html

### Fase 2: Estado

- [ ] Implementar React.cache en useActiveAssignment
- [ ] Mover coachNavigation fuera de Sidebar
- [ ] Mover studentNavigation fuera de Sidebar
- [ ] Mover MOCK_PLAN fuera de trainingStore
- [ ] Auditar useEffect innecesarios en TrainingHome
- [ ] Auditar useEffect innecesarios en ExerciseDetail
- [ ] Reemplazar useState por useRef donde aplique

### Fase 3: Avanzadas

- [ ] Implementar virtualización en StudentsList
- [ ] Implementar virtualización en ExerciseList
- [ ] Agregar React Query a useActiveAssignment
- [ ] Agregar React Query a useStudents
- [ ] Agregar useTransition en forms
- [ ] Code split de StudentProfileSetup schemas

### Fase 4: Assets

- [ ] Convertir imágenes a WebP
- [ ] Self-host Lexend font
- [ ] Self-host Playfair Display font
- [ ] Agregar content-visibility a student cards
- [ ] Implementar skeleton screens
```

---

## 🎬 Ejemplo de Refactor Completo: TrainingHome.tsx

**ANTES** (código actual):

```typescript
export default function TrainingHome() {
  const { professor } = useAuthStore(); // ❌ Re-render en cualquier cambio
  const { currentDay, isWorkoutComplete } = useTrainingStore(); // ❌ Mismo problema
  const { assignment, days, isLoading } = useActiveAssignment(); // ❌ Queries pesadas
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  // ... resto del código
}
```

**DESPUÉS** (optimizado):

```typescript
import { memo, useMemo, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";

const TrainingHome = memo(function TrainingHome() {
  // ✅ Selectores específicos
  const professorName = useAuthStore((state) => state.professor?.name);
  const currentDay = useTrainingStore((state) => state.currentDay);
  const isWorkoutComplete = useTrainingStore(
    (state) => state.isWorkoutComplete,
  );

  // ✅ React Query con stale-while-revalidate
  const { data: assignment, isLoading } = useQuery({
    queryKey: ["activeAssignment", professorName],
    queryFn: fetchActiveAssignment,
    staleTime: 5 * 60 * 1000, // 5 min
    cacheTime: 10 * 60 * 1000, // 10 min
  });

  // ✅ useTransition para transiciones no críticas
  const [isPending, startTransition] = useTransition();
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const handleDaySelect = (dayId: string) => {
    startTransition(() => {
      setSelectedDayId(dayId);
    });
  };

  // ✅ Memoizar cálculos derivados
  const sortedDays = useMemo(
    () => assignment?.days.sort((a, b) => a.day_number - b.day_number) ?? [],
    [assignment?.days],
  );

  // ... resto del código
});

export default TrainingHome;
```

---

## 🚀 Resultado Esperado

Después de implementar estas optimizaciones:

| Métrica                 | Antes   | Después    | Mejora      |
| ----------------------- | ------- | ---------- | ----------- |
| **INP (P75)**           | 1,568ms | **<150ms** | **-90%**    |
| **FID**                 | 32ms    | **<16ms**  | **-50%**    |
| **Lighthouse Mobile**   | ~67     | **>90**    | **+23 pts** |
| **Time to Interactive** | ~3.5s   | **<2s**    | **-43%**    |

---

## 📚 Referencias

- [Web Vitals - INP](https://web.dev/inp/)
- [React Best Practices - Vercel](https://vercel.com/blog/react-best-practices)
- [React 19 Performance](https://react.dev/blog/2024/04/25/react-19)
- [Supabase Performance](https://supabase.com/docs/guides/database/performance)

---

**Autor**: Generado por GitHub Copilot
**Fecha**: 2026-03-04
**Versión**: 1.0
