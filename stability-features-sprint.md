# 🏋️ Stability — Sprint de Funcionalidades

> **Proyecto:** Stability · Stack: React + TypeScript + Supabase + Zustand + Tailwind CSS  
> **Contexto:** Aplicación de gestión de entrenamiento con dos roles: `coach` (desktop/sidebar) y `student` (mobile/bottom-nav).  
> **Archivos clave:**
> - `professors-platform/src/features/plans/NewPlan.tsx` — Planificador del coach
> - `professors-platform/src/features/library/PlanPreview.tsx` — Preview de planes en Biblioteca
> - `professors-platform/src/features/training/ExerciseDetail.tsx` — Vista de ejercicio del alumno
> - `professors-platform/src/features/training/WorkoutComplete.tsx` — Pantalla de cierre de sesión
> - `professors-platform/src/features/students/StudentProfile.tsx` — Perfil de alumno (coach side)
> - `professors-platform/src/features/students/StudentsList.tsx` — Lista de alumnos (`/inicio`)
> - `professors-platform/src/features/training/store/trainingStore.ts` — Zustand store del entrenamiento
> - `professors-platform/src/lib/supabase.ts` — Tipos de base de datos
> - `professors-platform/src/lib/types.ts` — Tipo `PlanExercise`
> - `professors-platform/src/features/training/types.ts` — Tipos `Exercise`, `ExerciseSet`, `SeriesLog`

---

## 📋 Índice de Fases

1. [Fase 1 — Columna "Escribir Peso" en el Planificador](#fase-1)
2. [Fase 2 — Control de inputs en ExerciseDetail (alumno)](#fase-2)
3. [Fase 3 — Guardado de datos de peso/RM al finalizar sesión](#fase-3)
4. [Fase 4 — Sección "Entrenamiento y Fuerza" en `/alumno/:studentId`](#fase-4)
5. [Fase 5 — Bienestar post-sesión en WorkoutComplete](#fase-5)
6. [Fase 6 — Alerta de RPE anómalo en `/inicio` (lista de alumnos)](#fase-6)

---

## Fase 1 — Columna "Escribir Peso" en el Planificador {#fase-1}

### Objetivo
Agregar un campo booleano `write_weight` a cada ejercicio del plan, para que el coach indique en cuáles el alumno debe registrar el peso y las repeticiones reales que usó.

### 1.1 Base de datos — Supabase

Ejecutar la siguiente migración SQL en el proyecto Supabase:

```sql
ALTER TABLE training_plan_exercises
  ADD COLUMN IF NOT EXISTS write_weight BOOLEAN NOT NULL DEFAULT FALSE;
```

### 1.2 Tipos TypeScript

**Archivo:** `professors-platform/src/lib/types.ts`  
Agregar el campo `write_weight` a la interfaz `PlanExercise`:

```typescript
export interface PlanExercise {
    id: string;
    day_id: string;
    stage_id: string;
    stage_name?: string;
    exercise_name: string;
    video_url?: string | null;
    series: number;
    reps: string;
    intensity: number;
    pause: string;
    notes: string;
    order: number;
    write_weight?: boolean; // ← NUEVO
}
```

**Archivo:** `professors-platform/src/lib/supabase.ts`  
Agregar `write_weight` en `Row`, `Insert` y `Update` de la tabla `training_plan_exercises`:

```typescript
// En Row:
write_weight: boolean;
// En Insert:
write_weight?: boolean;
// En Update:
write_weight?: boolean;
```

**Archivo:** `professors-platform/src/features/training/types.ts`  
Agregar el campo en la interfaz `Exercise`:

```typescript
export interface Exercise {
  id: number
  name: string
  category: ExerciseCategory
  sets: ExerciseSet[]
  restSeconds: number
  videoUrl?: string
  instructions?: string
  writeWeight?: boolean  // ← NUEVO: true si el coach quiere que el alumno registre peso
}
```

### 1.3 Frontend — NewPlan.tsx

**Archivo:** `professors-platform/src/features/plans/NewPlan.tsx`

#### Cambios en la cabecera de la tabla
La cabecera actual usa una grilla CSS con `grid-cols-[140px_40px_3fr_50px_80px_80px_100px_80px_2fr_50px]`. Agregar una columna más para "Escribir Peso":

- Cambiar el grid a: `grid-cols-[140px_40px_3fr_50px_80px_80px_100px_80px_80px_2fr_50px]`
- Agregar el header de la nueva columna después de "Pausa":

```tsx
<div className="py-3 text-center border-l border-gray-100 dark:border-gray-800">
  Escribir Peso
</div>
```

#### Cambios en cada fila de ejercicio
En el render de cada ejercicio, agregar la celda de checkbox después de la columna Pausa y antes de Notas:

```tsx
{/* Columna: Escribir Peso */}
<div className="h-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
  <button
    type="button"
    onClick={() =>
      handleUpdateExercise(
        exercise.id,
        "write_weight",
        !exercise.write_weight,
      )
    }
    title="Indicar que el alumno debe escribir el peso"
    className={
      `w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
        exercise.write_weight
          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-emerald-400"
      }`
    }
  >
    {exercise.write_weight && (
      <span className="material-symbols-outlined text-[16px] filled">
        check
      </span>
    )}
  </button>
</div>
```

#### Cambios en handleAddExercise
Al crear un nuevo ejercicio, incluir el valor por defecto:

```typescript
const newExercise: PlanExercise = {
  // ...campos existentes...
  write_weight: false, // ← NUEVO
};
```

#### Cambios en useTrainingPlans (al guardar/actualizar)
**Archivo:** `professors-platform/src/hooks/useTrainingPlans.ts`
En todos los `.insert()` y `.update()` de `training_plan_exercises`, incluir el campo:

```typescript
write_weight: ex.write_weight ?? false,
```

#### Cambios en la carga de planes existentes (modo edición)
En la hydration de ejercicios cargados desde Supabase (dentro de `NewPlan.tsx`), mapear el campo:

```typescript
write_weight: ex.write_weight ?? false,
```

### 1.4 Frontend — PlanPreview.tsx (Biblioteca)

**Archivo:** `professors-platform/src/features/library/PlanPreview.tsx`

#### Actualizar la interfaz local `TrainingPlanExercise`:

```typescript
interface TrainingPlanExercise {
  // ...campos existentes...
  write_weight: boolean; // ← NUEVO
}
```

#### Agregar columna en la tabla de preview:

En el `<thead>`, agregar después de "Pausa":
```tsx
<th className="text-center py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
  Peso requerido
</th>
```

En el `<tbody>`, agregar la celda correspondiente:
```tsx
<td className="py-3 px-4 text-center">
  {exercise.write_weight ? (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
      <span className="material-symbols-outlined text-[14px] text-emerald-600 dark:text-emerald-400 filled">
        check
      </span>
    </span>
  ) : (
    <span className="text-slate-300 dark:text-slate-600 text-sm">—</span>
  )}
</td>
```

---

## Fase 2 — Control de inputs en ExerciseDetail (alumno) {#fase-2}

### Objetivo
En la pantalla de ejercicio del alumno (`/entrenamiento/dia/:dayId/ejercicio/:exerciseNum`), solo los ejercicios con `writeWeight = true` deben permitir escribir el peso y las repeticiones reales. El número de series permanece igual al planificado.

### 2.1 Propagación del flag `writeWeight`

El campo `write_weight` debe llegar desde Supabase hasta el tipo `Exercise` del store. Al transformar ejercicios de `training_plan_exercises` → `Exercise` (en el hook que carga el plan del alumno, por ejemplo `useActiveDayExercises` o similar):

```typescript
writeWeight: dbExercise.write_weight ?? false,
```

### 2.2 Cambios en ExerciseDetail.tsx

**Archivo:** `professors-platform/src/features/training/ExerciseDetail.tsx`

Dentro del render de cada serie (`exercise.sets.map`), usar `exercise.writeWeight` para condicionar los inputs:

```tsx
{/* KG input — solo si el coach lo indica */}
{exercise.writeWeight ? (
  <input
    type="number"
    inputMode="decimal"
    placeholder={set.targetWeight ? String(set.targetWeight) : "kg"}
    value={log?.kg ?? ""}
    onChange={(e) => updateSeriesLog(key, "kg", e.target.value)}
    className={cn(
      "w-full text-center text-sm font-bold rounded-xl border px-2 py-2 min-h-[40px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all",
      isDone && "border-emerald-200 dark:border-emerald-800",
    )}
  />
) : (
  <div className="w-full text-center text-sm font-bold text-slate-400 dark:text-slate-500 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 px-2 py-2 min-h-[40px] flex items-center justify-center">
    —
  </div>
)}

{/* Reps input — solo si el coach lo indica */}
{exercise.writeWeight ? (
  <input
    type="number"
    inputMode="numeric"
    placeholder={set.targetReps}
    value={log?.reps ?? ""}
    onChange={(e) => updateSeriesLog(key, "reps", e.target.value)}
    className={cn(
      "w-full text-center text-sm font-bold rounded-xl border px-2 py-2 min-h-[40px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all",
      isDone && "border-emerald-200 dark:border-emerald-800",
    )}
  />
) : (
  <div className="w-full text-center text-sm font-bold text-slate-400 dark:text-slate-500 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 px-2 py-2 min-h-[40px] flex items-center justify-center">
    {set.targetReps}
  </div>
)}
```

> **Nota:** El header de la tabla (columnas KG / REPS) siempre se muestra. Solo los inputs quedan deshabilitados visualmente cuando `writeWeight = false`.

---

## Fase 3 — Guardado de datos de peso/RM al finalizar sesión {#fase-3}

### Objetivo
Al presionar "Guardar y Volver al Inicio" en `WorkoutComplete`, además de guardar en `workout_completions`, registrar en una nueva tabla `exercise_weight_logs` cada ejercicio donde `write_weight = true` con el peso y repeticiones reales ingresados.

### 3.1 Nueva tabla Supabase — `exercise_weight_logs`

```sql
CREATE TABLE exercise_weight_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assignment_id   UUID NOT NULL REFERENCES training_plan_assignments(id) ON DELETE CASCADE,
  exercise_id     UUID NOT NULL,                          -- ID del training_plan_exercises
  exercise_name   TEXT NOT NULL,                          -- Nombre del ejercicio (desnormalizado para consultas fáciles)
  plan_day_number INTEGER NOT NULL,                       -- Día del plan (1, 2, 3...)
  plan_day_name   TEXT NOT NULL,                          -- Nombre del día (ej: "Piernas e Hipertrofia")
  series          INTEGER NOT NULL,                       -- Cantidad de series planificadas
  sets_detail     JSONB NOT NULL,                         -- [{set_number, target_reps, actual_reps, kg}]
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ewl_student_id ON exercise_weight_logs(student_id);
CREATE INDEX idx_ewl_exercise_name ON exercise_weight_logs(exercise_name);
CREATE INDEX idx_ewl_logged_at ON exercise_weight_logs(logged_at);
```

El campo `sets_detail` es un array JSONB con la siguiente estructura por elemento:

```json
[
  { "set_number": 1, "target_reps": "10", "actual_reps": "9", "kg": 80 },
  { "set_number": 2, "target_reps": "10", "actual_reps": "10", "kg": 80 },
  { "set_number": 3, "target_reps": "10", "actual_reps": "8", "kg": 82.5 }
]
```

### 3.2 Agregar tipo al `supabase.ts`

**Archivo:** `professors-platform/src/lib/supabase.ts`

```typescript
exercise_weight_logs: {
  Row: {
    id: string;
    student_id: string;
    assignment_id: string;
    exercise_id: string;
    exercise_name: string;
    plan_day_number: number;
    plan_day_name: string;
    series: number;
    sets_detail: Array<{
      set_number: number;
      target_reps: string;
      actual_reps: string | null;
      kg: number | null;
    }>;  
    logged_at: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    student_id: string;
    assignment_id: string;
    exercise_id: string;
    exercise_name: string;
    plan_day_number: number;
    plan_day_name: string;
    series: number;
    sets_detail: Array<{
      set_number: number;
      target_reps: string;
      actual_reps: string | null;
      kg: number | null;
    }>;  
    logged_at?: string;
    created_at?: string;
  };
};
```

### 3.3 Modificar WorkoutComplete.tsx

**Archivo:** `professors-platform/src/features/training/WorkoutComplete.tsx`

Modificar `handleGoHome` para, antes de navegar, guardar los logs de peso de los ejercicios con `writeWeight = true`:

```typescript
const handleGoHome = async () => {
  setIsSaving(true);

  if (assignmentId) {
    // 1. Guardar workout_completion (lógica ya existente del plan-alumno-conexion.md)
    const doneSetsCount = Object.values(seriesLog).filter((s) => s.done).length;
    const result = await saveCompletion({
      assignmentId,
      dayNumber: currentDayNumber,
      rpe: rpe,
      mood: mood,           // ← Fase 5
      moodComment: moodComment, // ← Fase 5
      totalSetsDone: doneSetsCount,
      seriesLog: seriesLog as Record<string, unknown>,
    });

    if (result.success) {
      toast.success("¡Entrenamiento guardado! 💪");
    } else {
      toast.error("No se pudo guardar. Intenta de nuevo.");
    }

    // 2. Guardar exercise_weight_logs para ejercicios con writeWeight = true
    const exercisesToLog = currentDay?.exercises.filter((ex) => ex.writeWeight) ?? [];

    if (exercisesToLog.length > 0 && professor?.id) {
      const logsToInsert = exercisesToLog.map((ex) => {
        const setsDetail = ex.sets.map((set, setIndex) => {
          const key = `${ex.id}-${setIndex}`;
          const log = seriesLog[key];
          return {
            set_number: set.setNumber,
            target_reps: set.targetReps,
            actual_reps: log?.reps ?? null,
            kg: log?.kg ? parseFloat(log.kg) : null,
          };
        });

        return {
          student_id: professor.id,
          assignment_id: assignmentId,
          exercise_id: String(ex.id),
          exercise_name: ex.name,
          plan_day_number: currentDayNumber,
          plan_day_name: currentDay?.name ?? "",
          series: ex.sets.length,
          sets_detail: setsDetail,
        };
      });

      await supabase.from("exercise_weight_logs").insert(logsToInsert);
    }
  }

  setIsSaving(false);
  resetTraining();
  navigate("/entrenamiento", { replace: true });
};
```

---

## Fase 4 — Sección "Entrenamiento y Fuerza" en `/alumno/:studentId` {#fase-4}

### Objetivo
En la página `StudentProfile` del coach (ruta `/alumno/:studentId`), agregar una nueva pestaña **"Entrenamiento y Fuerza"** que muestre:
1. Una lista de los registros de `exercise_weight_logs` del alumno, agrupados por ejercicio bajo acordeones desplegables.
2. Dentro de cada acordeón: tabla de registros + gráfico de RM a lo largo del tiempo.
3. Un campo editable de RM calculado por el coach en cada registro.

### 4.1 Nueva tabla Supabase — `exercise_rm_notes`

Para guardar el RM calculado por el coach:

```sql
CREATE TABLE exercise_rm_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weight_log_id   UUID NOT NULL REFERENCES exercise_weight_logs(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rm_kg           NUMERIC(6,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.2 Nuevo hook — `useExerciseWeightLogs`

**Ubicación:** `professors-platform/src/hooks/useExerciseWeightLogs.ts`

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface SetDetail {
  set_number: number;
  target_reps: string;
  actual_reps: string | null;
  kg: number | null;
}

export interface ExerciseWeightLog {
  id: string;
  exercise_name: string;
  plan_day_number: number;
  plan_day_name: string;
  series: number;
  sets_detail: SetDetail[];
  logged_at: string;
  rm_kg?: number | null;           // del join con exercise_rm_notes
  rm_note_id?: string | null;       // para poder hacer UPSERT
}

export interface ExerciseGroup {
  exercise_name: string;
  logs: ExerciseWeightLog[];
}

export function useExerciseWeightLogs(studentId: string | undefined) {
  const [groups, setGroups] = useState<ExerciseGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("exercise_weight_logs")
        .select(`
          id,
          exercise_name,
          plan_day_number,
          plan_day_name,
          series,
          sets_detail,
          logged_at,
          exercise_rm_notes (
            id,
            rm_kg
          )
        `)
        .eq("student_id", studentId)
        .order("logged_at", { ascending: true });

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Agrupar por nombre de ejercicio
      const groupMap = new Map<string, ExerciseWeightLog[]>();
      for (const row of data) {
        const rmNote = (row.exercise_rm_notes as any)?.[0];
        const log: ExerciseWeightLog = {
          id: row.id,
          exercise_name: row.exercise_name,
          plan_day_number: row.plan_day_number,
          plan_day_name: row.plan_day_name,
          series: row.series,
          sets_detail: row.sets_detail as SetDetail[],
          logged_at: row.logged_at,
          rm_kg: rmNote?.rm_kg ?? null,
          rm_note_id: rmNote?.id ?? null,
        };
        if (!groupMap.has(row.exercise_name)) {
          groupMap.set(row.exercise_name, []);
        }
        groupMap.get(row.exercise_name)!.push(log);
      }

      setGroups(
        Array.from(groupMap.entries()).map(([name, logs]) => ({
          exercise_name: name,
          logs,
        }))
      );
      setLoading(false);
    };

    load();
  }, [studentId]);

  return { groups, loading };
}
```

### 4.3 Nuevo tab en StudentProfile.tsx

**Archivo:** `professors-platform/src/features/students/StudentProfile.tsx`

#### Actualizar el tipo de tabs:
```typescript
type TabKey = "general" | "historial" | "progreso" | "fuerza";

const TABS = [
  { key: "general",   label: "General & Antropometría", icon: "person" },
  { key: "historial", label: "Historial",                icon: "history" },
  { key: "progreso",  label: "Progreso",                 icon: "trending_up" },
  { key: "fuerza",    label: "Entrenamiento y Fuerza",   icon: "fitness_center" }, // ← NUEVO
];
```

#### Agregar la renderización del tab:
```tsx
{activeTab === "fuerza" && <FuerzaTab studentId={studentId} />}
```

#### Nuevo componente `FuerzaTab`:
```tsx
import { useExerciseWeightLogs } from "@/hooks/useExerciseWeightLogs";
// Instalar recharts si no existe: npm install recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

function FuerzaTab({ studentId }: { studentId: string | undefined }) {
  const { groups, loading } = useExerciseWeightLogs(studentId);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        Cargando registros de fuerza...
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">
          fitness_center
        </span>
        <p className="text-gray-500 text-sm">
          No hay registros de peso aún. Se generarán cuando el alumno complete
          ejercicios con "Escribir Peso" activado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isOpen = openGroup === group.exercise_name;

        // Datos para el gráfico: fecha vs RM
        const chartData = group.logs
          .filter((l) => l.rm_kg != null)
          .map((l) => ({
            date: new Date(l.logged_at).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
            }),
            rm: l.rm_kg,
          }));

        return (
          <div
            key={group.exercise_name}
            className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
          >
            {/* Acordeón header */}
            <button
              onClick={() =>
                setOpenGroup(isOpen ? null : group.exercise_name)
              }
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  fitness_center
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {group.exercise_name}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {group.logs.length} registro{group.logs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <span
                className={`material-symbols-outlined text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>

            {/* Contenido del acordeón */}
            {isOpen && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 space-y-6">
                {/* Tabla de registros */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                        <th className="pb-2 pr-4">Fecha</th>
                        <th className="pb-2 pr-4">Día del Plan</th>
                        <th className="pb-2 pr-4">Series</th>
                        <th className="pb-2 pr-4">Detalle (Sets)</th>
                        <th className="pb-2">RM Calculado (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {group.logs.map((log) => (
                        <LogRow key={log.id} log={log} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Gráfico RM vs Fecha */}
                {chartData.length >= 2 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Evolución del RM
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f0f0f0"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#9ca3af" }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#9ca3af" }}
                          unit=" kg"
                        />
                        <Tooltip
                          formatter={(value) => [`${value} kg`, "RM"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="rm"
                          stroke="#0056b3"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: "#0056b3" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Sub-componente de cada fila de la tabla
function LogRow({ log }: { log: ExerciseWeightLog }) {
  const [rmValue, setRmValue] = useState<string>(
    log.rm_kg != null ? String(log.rm_kg) : ""
  );
  const [saving, setSaving] = useState(false);

  const handleRmSave = async () => {
    const parsed = parseFloat(rmValue);
    if (isNaN(parsed)) return;
    setSaving(true);

    if (log.rm_note_id) {
      // Actualizar existente
      await supabase
        .from("exercise_rm_notes")
        .update({ rm_kg: parsed, updated_at: new Date().toISOString() })
        .eq("id", log.rm_note_id);
    } else {
      // Crear nuevo
      await supabase.from("exercise_rm_notes").insert({
        weight_log_id: log.id,
        coach_id: (await supabase.auth.getUser()).data.user!.id,
        rm_kg: parsed,
      });
    }
    setSaving(false);
  };

  return (
    <tr>
      <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
        {new Date(log.logged_at).toLocaleDateString("es-AR")}
      </td>
      <td className="py-2 pr-4 text-gray-500 dark:text-gray-400 text-xs">
        Día {log.plan_day_number} — {log.plan_day_name}
      </td>
      <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
        {log.series}
      </td>
      <td className="py-2 pr-4">
        <div className="flex flex-wrap gap-1">
          {log.sets_detail.map((s) => (
            <span
              key={s.set_number}
              className="text-[10px] bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-gray-600 dark:text-gray-300"
            >
              S{s.set_number}: {s.actual_reps ?? s.target_reps} reps
              {s.kg != null ? ` @ ${s.kg}kg` : ""}
            </span>
          ))}
        </div>
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={rmValue}
            onChange={(e) => setRmValue(e.target.value)}
            onBlur={handleRmSave}
            placeholder="— kg"
            className="w-20 text-center text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {saving && (
            <span className="material-symbols-outlined text-[14px] animate-spin text-primary">
              progress_activity
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
```

---

## Fase 5 — Bienestar post-sesión en WorkoutComplete {#fase-5}

### Objetivo
Después del selector de RPE en `WorkoutComplete.tsx`, agregar:
1. Una pregunta `¿Cómo te sentiste?` con 4 opciones visuales (Excelente, Normal, Fatigado, Molestia).
2. Un campo de texto opcional para comentario libre.

### 5.1 Tipos

Definir el tipo de mood:

```typescript
export type WorkoutMood = "excelente" | "normal" | "fatigado" | "molestia";
```

### 5.2 Actualizar el store — trainingStore.ts

**Archivo:** `professors-platform/src/features/training/store/trainingStore.ts`

Agregar al estado y a las acciones:
```typescript
// En el interface TrainingState:
mood: WorkoutMood | null;
moodComment: string;
setMood: (value: WorkoutMood) => void;
setMoodComment: (value: string) => void;

// En el store (implementación):
mood: null,
moodComment: "",
setMood: (value) => set({ mood: value }),
setMoodComment: (value) => set({ moodComment: value }),

// En resetTraining():
mood: null,
moodComment: "",
```

### 5.3 Actualizar la tabla `workout_completions`

```sql
ALTER TABLE workout_completions
  ADD COLUMN IF NOT EXISTS mood TEXT CHECK (mood IN ('excelente', 'normal', 'fatigado', 'molestia')),
  ADD COLUMN IF NOT EXISTS mood_comment TEXT;
```
Actualizar el tipo en `supabase.ts` para incluir `mood` y `mood_comment`.

### 5.4 UI en WorkoutComplete.tsx

**Archivo:** `professors-platform/src/features/training/WorkoutComplete.tsx`

Agregar después del bloque de RPE, antes del botón "Volver al Inicio":
```tsx
{/* ── ¿Cómo te sentiste? ──────────────────────────────────── */}
<div className="w-full mt-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
  <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">
    ¿Cómo te sentiste?
  </p>

  <div className="grid grid-cols-4 gap-2">
    {(
      [
        { value: "excelente", emoji: "🔥", label: "Excelente" },
        { value: "normal",    emoji: "😊", label: "Normal" },
        { value: "fatigado",  emoji: "😓", label: "Fatigado" },
        { value: "molestia",  emoji: "🤕", label: "Molestia" },
      ] as const
    ).map(({ value, emoji, label }) => (
      <button
        key={value}
        onClick={() => setMood(value)}
        className={cn(
          "flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 font-medium text-xs transition-all active:scale-95",
          mood === value
            ? "border-primary bg-primary/10 text-primary"
            : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary/40"
        )}
      >
        <span className="text-2xl">{emoji}</span>
        {label}
      </button>
    ))}
  </div>

  {/* Comentario libre */}
  <textarea
    value={moodComment}
    onChange={(e) => setMoodComment(e.target.value)}
    placeholder="Comentario opcional... (dolor, molestia, observación)"
    rows={2}
    className="mt-4 w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
  />
</div>
```

### 5.5 Pasar mood y moodComment al saveCompletion

En `handleGoHome`, incluir en el objeto del `saveCompletion`:
```typescript
mood: mood,
moodComment: moodComment,
```
Actualizar el hook `useWorkoutCompletions.ts` para que el `insert` en `workout_completions` incluya `mood` y `mood_comment`.

---

## Fase 6 — Alerta de RPE anómalo en `/inicio` {#fase-6}

### Objetivo
Si un alumno registra **3 sesiones consecutivas** con RPE ≤ 3 (muy bajo) o RPE ≥ 8 (muy alto), mostrar un aviso visual en su tarjeta en la lista de alumnos (`/inicio`) y en la sección **"Constancia"** de `StudentProfile` → pestaña `Progreso`.

### 6.1 Lógica de detección

La detección se realiza del lado del cliente al cargar los datos. El hook de alumnos (o el componente) debe:

1. Por cada alumno, consultar sus últimas 3 entradas de `workout_completions` ordenadas por `completed_at DESC`.
2. Verificar si `rpe` de las 3 es ≥ 8 (muy alto) o las 3 son ≤ 3 (muy bajo).
3. Si se cumple, retornar un flag `rpeAlert: "high" | "low" | null`.

```typescript
// Ejemplo de función de detección (puede usarse en el hook useStudents o en un helper)
function detectRpeAlert(
  lastThreeRpes: (number | null)[]
): "high" | "low" | null {
  const valid = lastThreeRpes.filter((r): r is number => r !== null);
  if (valid.length < 3) return null;
  if (valid.every((r) => r >= 8)) return "high";
  if (valid.every((r) => r <= 3)) return "low";
  return null;
}
```

### 6.2 Consulta Supabase en useStudents

**Archivo:** `professors-platform/src/hooks/useStudents.ts` (o donde se carguen los alumnos)

Modificar la query para incluir las últimas 3 sesiones de cada alumno:
```typescript
// Al cargar cada alumno, hacer una query adicional:
const { data: recentCompletions } = await supabase
  .from("workout_completions")
  .select("rpe")
  .eq("student_id", student.id)
  .order("completed_at", { ascending: false })
  .limit(3);

const rpeAlert = detectRpeAlert(
  (recentCompletions ?? []).map((c) => c.rpe)
);

// Incluir rpeAlert en el objeto del alumno
```

> ⚠️ **Optimización:** Si la lista de alumnos es grande, considerar una función RPC de Supabase o una query más eficiente. Para MVP, la consulta por alumno es aceptable.

### 6.3 UI — Tarjeta del alumno en StudentsList.tsx

**Archivo:** `professors-platform/src/features/students/StudentsList.tsx`

Agregar el badge de alerta en la tarjeta del alumno cuando `rpeAlert !== null`:
```tsx
{student.rpeAlert && (
  <div
    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-2 w-fit mx-auto ${
      student.rpeAlert === "high"
        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
        : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
    }`}
  >
    <span className="material-symbols-outlined text-[14px]">
      {student.rpeAlert === "high" ? "warning" : "info"}
    </span>
    {student.rpeAlert === "high"
      ? "3 sesiones con RPE muy alto"
      : "3 sesiones con RPE muy bajo"}
  </div>
)}
```

### 6.4 UI — Sección "Constancia" en ProgresoTab (StudentProfile)

**Archivo:** `professors-platform/src/features/students/StudentProfile.tsx`

En `ProgresoTab`, cargar el estado de alerta del alumno específico y mostrarlo en la sección de Constancia:
```tsx
function ProgresoTab({ studentId }: { studentId: string }) {
  // Cargar últimas 3 sesiones
  const [rpeAlert, setRpeAlert] = useState<"high" | "low" | null>(null);

  useEffect(() => {
    supabase
      .from("workout_completions")
      .select("rpe")
      .eq("student_id", studentId)
      .order("completed_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setRpeAlert(detectRpeAlert((data ?? []).map((c) => c.rpe)));
      });
  }, [studentId]);

  return (
    <div className="space-y-4">
      {/* Alerta de RPE */}
      {rpeAlert && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            rpeAlert === "high"
              ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
              : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] mt-0.5 ${
              rpeAlert === "high"
                ? "text-red-500"
                : "text-amber-500"
            }`}
          >
            {rpeAlert === "high" ? "warning" : "info"}
          </span>
          <div>
            <p
              className={`font-bold text-sm ${
                rpeAlert === "high"
                  ? "text-red-700 dark:text-red-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {rpeAlert === "high"
                ? "⚠️ 3 sesiones consecutivas con RPE muy alto (≥8)"
                : "ℹ️ 3 sesiones consecutivas con RPE muy bajo (≤3)"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {rpeAlert === "high"
                ? "Considera revisar la carga de entrenamiento o consultar con el alumno sobre su recuperación."
                : "Puede indicar que el plan es demasiado liviano o que el alumno no está registrando el esfuerzo real."}
            </p>
          </div>
        </div>
      )}

      {/* Resto de la sección de Constancia... */}
    </div>
  );
}
```

---

## 📋 Resumen de Cambios por Archivo

| Archivo | Cambios |
|---------|---------|
| **Supabase (SQL)** | +columna `write_weight` en `training_plan_exercises`; +tabla `exercise_weight_logs`; +tabla `exercise_rm_notes`; +columnas `mood`, `mood_comment` en `workout_completions` |
| `professors-platform/src/lib/supabase.ts` | Agregar `write_weight` en tipos de `training_plan_exercises`; agregar tipos de `exercise_weight_logs`, `exercise_rm_notes` |
| `professors-platform/src/lib/types.ts` | Agregar `write_weight?: boolean` a `PlanExercise` |
| `professors-platform/src/features/training/types.ts` | Agregar `writeWeight?: boolean` a `Exercise`; agregar `WorkoutMood` type |
| `professors-platform/src/features/plans/NewPlan.tsx` | +columna "Escribir Peso" en tabla; +checkbox por ejercicio; +campo en `handleAddExercise` |
| `professors-platform/src/features/library/PlanPreview.tsx` | +columna "Peso requerido" en tabla de preview |
| `professors-platform/src/hooks/useTrainingPlans.ts` | Incluir `write_weight` en insert/update de ejercicios |
| `professors-platform/src/features/training/ExerciseDetail.tsx` | Condicionar inputs KG/Reps según `exercise.writeWeight` |
| `professors-platform/src/features/training/WorkoutComplete.tsx` | +UI de mood/comment; lógica de guardado de `exercise_weight_logs`; pasar mood al `saveCompletion` |
| `professors-platform/src/features/training/store/trainingStore.ts` | +`mood`, `moodComment`, `setMood`, `setMoodComment` en el store |
| `professors-platform/src/hooks/useExerciseWeightLogs.ts` | **NUEVO** — Hook para cargar y agrupar registros de peso por ejercicio |
| `professors-platform/src/features/students/StudentProfile.tsx` | +tab "Entrenamiento y Fuerza"; +`FuerzaTab` component; actualizar `ProgresoTab` con alerta RPE |
| `professors-platform/src/features/students/StudentsList.tsx` | +badge de alerta RPE en tarjetas de alumnos |
| `professors-platform/src/hooks/useStudents.ts` | Cargar últimas 3 sesiones RPE por alumno para calcular `rpeAlert` |

---

## ⚠️ Notas para el Agente

1. **No instalar `recharts` si ya existe** — verificar `package.json` antes. Si no está, ejecutar `npm install recharts`.
2. **El flag `write_weight` en el store del alumno** — al transformar ejercicios de Supabase a `Exercise`, asegurarse de incluir `writeWeight: dbExercise.write_weight ?? false`.
3. **La migración SQL debe hacerse manualmente** en el panel de Supabase antes de ejecutar el código. Incluir los SQL en comentarios al inicio de los hooks relevantes.
4. **El campo `mood` y `moodComment` en `saveCompletion`** — actualizar la firma de `SaveCompletionParams` en `useWorkoutCompletions.ts` para incluir los nuevos campos.
5. **RLS de Supabase** — Las nuevas tablas `exercise_weight_logs` y `exercise_rm_notes` necesitan políticas RLS. Mínimo:
   - `exercise_weight_logs`: estudiante puede INSERT sus propios registros; coach puede SELECT de sus alumnos.
   - `exercise_rm_notes`: coach puede INSERT/UPDATE/SELECT; estudiante puede SELECT.
6. **El `studentId` en `ProgresoTab`** — actualmente `ProgresoTab` no recibe props. Pasar `studentId` desde el componente padre `StudentProfile`.