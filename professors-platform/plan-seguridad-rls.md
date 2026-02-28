# Plan de Seguridad RLS — Stability Sistema

> Generado el 27/02/2026 · Análisis automático basado en el esquema real de la base de datos y el código del frontend.

---

## 📋 Resumen Ejecutivo

El proyecto tiene **15 tablas** en el schema `public`. El RLS (Row Level Security) está **habilitado en todas ellas**, lo cual es correcto. Sin embargo, el análisis del Security Advisor de Supabase encontró **3 tablas con RLS activo pero SIN ninguna política definida**, lo que provoca que esas tablas bloqueen _todas_ las operaciones (nadie puede leer ni escribir). Esto rompe funcionalidad en producción. Además, se detectaron **vulnerabilidades de lógica** en las políticas existentes que se documentan a continuación.

---

## 🔴 1. Diagnóstico — Tablas sin Políticas (Bloqueadas Totalmente)

Estas tablas tienen RLS encendido **pero cero políticas**. Supabase las bloquea al 100%: ni el coach ni el alumno pueden acceder a ellas. Esto rompería silenciosamente cualquier funcionalidad que las use.

| Tabla                  | Filas actuales | Impacto                                               |
| ---------------------- | -------------- | ----------------------------------------------------- |
| `exercise_weight_logs` | 7              | 🔴 CRÍTICO — logs de pesos del alumno inaccesibles    |
| `workout_completions`  | 7              | 🔴 CRÍTICO — marcado de entrenamientos no funciona    |
| `exercise_rm_notes`    | 0              | 🟡 MEDIO — notas de RM del coach no se pueden guardar |

---

## 🟡 2. Diagnóstico — Vulnerabilidades en Políticas Existentes

Estas tablas tienen políticas, pero con problemas de lógica o seguridad:

| Tabla                       | Problema detectado                                                                                                                                                                                                                                                                     | Riesgo                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `profiles`                  | Política `All authenticated users can view student profiles` usa rol `authenticated` con `role = 'student'`, pero no permite que un coach vea sus propios datos de `profiles.role = 'coach'`. Además hay **dos políticas duplicadas** de SELECT y UPDATE que pueden causar conflictos. | 🟡 Medio                             |
| `student_profiles`          | La política `All authenticated users can view student profiles` expone los datos médicos/físicos de todos los alumnos a cualquier usuario autenticado (incluso otros alumnos). Un alumno no debe ver el perfil de otro alumno.                                                         | 🔴 CRÍTICO — violación de privacidad |
| `exercise_stages`           | Los alumnos no pueden leer los stages, por lo que no pueden ver las etapas de su plan asignado.                                                                                                                                                                                        | 🟡 Funcional                         |
| `training_plan_assignments` | La política `Students can view their assignments` permite que el alumno vea el campo `coach_id` y `personalization_notes` (notas privadas del coach). Podría considerarse una fuga de información.                                                                                     | 🟡 Bajo                              |
| `profiles`                  | Las políticas con `roles: {public}` en INSERT/UPDATE deberían usar `{authenticated}` para evitar acceso anónimo.                                                                                                                                                                       | 🟠 Medio                             |

---

## 🛠️ 3. Instrucciones — Cómo Activar/Verificar RLS en Supabase

> El RLS ya está **habilitado** en todas tus tablas. Los pasos de abajo son para verificarlo y para acceder al SQL Editor donde correrás las políticas.

### Paso a paso en el Panel de Supabase

1. Abrí [https://supabase.com/dashboard](https://supabase.com/dashboard) e ingresá a tu proyecto **Stability**.
2. En el menú lateral izquierdo, hacé clic en **"Table Editor"** → seleccioná cualquier tabla → fijate el ícono de escudo 🛡️. Si aparece verde, RLS está activo.
3. Para verificar/activar RLS en cualquier tabla:
   - Andá a **"Authentication"** (menú lateral) → **"Policies"**
   - Buscá la tabla → si dice **"RLS enabled"**, está bien.
   - Si no, hacé clic en el botón **"Enable RLS"** para esa tabla.
4. Para ejecutar las políticas SQL de este documento:
   - Andá a **"SQL Editor"** (menú lateral, ícono de código `</>`)
   - Pegá el bloque SQL que querés ejecutar
   - Hacé clic en **"Run"** (▶️)

---

## 📝 4. Código SQL — Políticas a Ejecutar

### ⚡ PASO 1 — Ejecutar PRIMERO: Limpiar políticas duplicadas/conflictivas en `profiles` y `student_profiles`

> Eliminá las políticas antiguas que tienen roles `public` en lugar de `authenticated`, para reemplazarlas con versiones más seguras.

```sql
-- Eliminar políticas antiguas duplicadas en "profiles"
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Eliminar política oversharing en student_profiles
DROP POLICY IF EXISTS "All authenticated users can view student profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Students can view own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students can update own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students can insert own profile" ON public.student_profiles;
```

---

### 📌 PASO 2 — Políticas para `profiles`

**Lógica:** Cada usuario ve/edita solo su propio perfil. Los coaches pueden ver los perfiles de todos los alumnos para mostrarlos en su panel. Los alumnos no pueden ver perfiles de otros alumnos.

```sql
-- SELECT: Cada usuario puede ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- SELECT: Los coaches pueden ver los perfiles de sus alumnos asignados
CREATE POLICY "Coaches pueden ver perfiles de sus alumnos"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Soy coach y el perfil que quiero ver es de un alumno que tengo asignado
  EXISTS (
    SELECT 1 FROM public.profiles AS coach_profile
    WHERE coach_profile.id = auth.uid()
      AND coach_profile.role = 'coach'
  )
  AND role = 'student'
);

-- INSERT: Solo el propio usuario puede crear su perfil (al registrarse)
CREATE POLICY "Usuarios pueden insertar su propio perfil"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE: Solo el propio usuario puede editar su perfil
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

**Explicaciones:**

- `"Usuarios pueden ver su propio perfil"` → Permite a cualquier usuario autenticado leer únicamente su propia fila.
- `"Coaches pueden ver perfiles de sus alumnos"` → Permite a un coach leer el perfil de cualquier alumno (necesario para el panel de gestión).
- `"Usuarios pueden insertar su propio perfil"` → Permite el INSERT solo si el `id` coincide con el usuario autenticado (seguridad en el registro).
- `"Usuarios pueden actualizar su propio perfil"` → Restringe el UPDATE a la propia fila del usuario.

---

### 📌 PASO 3 — Políticas para `student_profiles`

**Lógica:** Datos médicos y físicos sensibles. Un alumno solo ve los suyos. Un coach ve los de sus alumnos.

```sql
-- SELECT: El alumno puede ver su propio perfil físico
CREATE POLICY "Alumno puede ver su propio perfil físico"
ON public.student_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- SELECT: El coach puede ver los perfiles físicos de SUS alumnos (no de todos)
CREATE POLICY "Coach puede ver perfil físico de sus alumnos asignados"
ON public.student_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.training_plan_assignments tpa
    WHERE tpa.student_id = student_profiles.id
      AND tpa.coach_id = auth.uid()
  )
);

-- INSERT: El alumno crea su propio perfil físico al completar el registro
CREATE POLICY "Alumno puede insertar su propio perfil físico"
ON public.student_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE: El alumno actualiza sus propios datos
CREATE POLICY "Alumno puede actualizar su propio perfil físico"
ON public.student_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

**Explicaciones:**

- `"Alumno puede ver su propio perfil físico"` → Un alumno solo accede a su propia fila (previene que alumno A vea datos médicos del alumno B).
- `"Coach puede ver perfil físico de sus alumnos asignados"` → Reemplaza la política anterior que exponía todos los perfiles. Ahora el coach solo ve datos de alumnos que realmente tiene asignados.
- `"Alumno puede insertar su propio perfil físico"` → Permite el INSERT del paso de registro completo.
- `"Alumno puede actualizar su propio perfil físico"` → Permite editar datos propios desde la pantalla de perfil.

---

### 📌 PASO 4 — Políticas para `workout_completions` _(tabla sin políticas)_

**Lógica:** El alumno registra sus entrenamientos completados. El coach los puede leer para hacer seguimiento.

```sql
-- SELECT: El alumno ve sus propias completaciones
CREATE POLICY "Alumno puede ver sus propias completaciones"
ON public.workout_completions
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- SELECT: El coach ve las completaciones de sus alumnos asignados
CREATE POLICY "Coach puede ver completaciones de sus alumnos"
ON public.workout_completions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.training_plan_assignments tpa
    WHERE tpa.student_id = workout_completions.student_id
      AND tpa.coach_id = auth.uid()
  )
);

-- INSERT: El alumno registra su propio entrenamiento completado
CREATE POLICY "Alumno puede insertar sus completaciones"
ON public.workout_completions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

-- UPDATE: El alumno puede editar sus propias completaciones (ej: agregar notas)
CREATE POLICY "Alumno puede actualizar sus propias completaciones"
ON public.workout_completions
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);
```

**Explicaciones:**

- `"Alumno puede ver sus propias completaciones"` → El alumno accede a su historial de entrenamientos.
- `"Coach puede ver completaciones de sus alumnos"` → El coach puede hacer seguimiento del progreso de sus alumnos.
- `"Alumno puede insertar sus completaciones"` → Permite guardar el registro al finalizar un día de entrenamiento.
- `"Alumno puede actualizar sus propias completaciones"` → Permite agregar notas o corregir el RPE registrado.

---

### 📌 PASO 5 — Políticas para `exercise_weight_logs` _(tabla sin políticas)_

**Lógica:** Registros de pesos por ejercicio. Privados del alumno, visibles para el coach asignado.

```sql
-- SELECT: El alumno ve sus propios registros de peso
CREATE POLICY "Alumno puede ver sus logs de peso"
ON public.exercise_weight_logs
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- SELECT: El coach ve los logs de peso de sus alumnos
CREATE POLICY "Coach puede ver logs de peso de sus alumnos"
ON public.exercise_weight_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.training_plan_assignments tpa
    WHERE tpa.student_id = exercise_weight_logs.student_id
      AND tpa.coach_id = auth.uid()
  )
);

-- INSERT: El alumno guarda su registro de peso al entrenar
CREATE POLICY "Alumno puede insertar sus logs de peso"
ON public.exercise_weight_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

-- UPDATE: El alumno puede corregir un registro de peso
CREATE POLICY "Alumno puede actualizar sus logs de peso"
ON public.exercise_weight_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- DELETE: El alumno puede eliminar sus propios registros
CREATE POLICY "Alumno puede eliminar sus logs de peso"
ON public.exercise_weight_logs
FOR DELETE
TO authenticated
USING (auth.uid() = student_id);
```

**Explicaciones:**

- `"Alumno puede ver sus logs de peso"` → Acceso de lectura al propio historial de pesos.
- `"Coach puede ver logs de peso de sus alumnos"` → El coach puede revisar la progresión de cargas de un alumno.
- `"Alumno puede insertar sus logs de peso"` → Permite guardar el peso levantado en cada ejercicio.
- `"Alumno puede actualizar sus logs de peso"` → Permite corregir un dato ingresado incorrectamente.
- `"Alumno puede eliminar sus logs de peso"` → Permite borrar un registro equivocado.

---

### 📌 PASO 6 — Políticas para `exercise_rm_notes` _(tabla sin políticas)_

**Lógica:** Notas de 1RM escritas por el coach. Solo el coach que las escribió las puede gestionar. El alumno cuyo weight_log está referenciado puede verlas.

```sql
-- SELECT: El coach ve las notas de RM que él mismo escribió
CREATE POLICY "Coach puede ver sus propias notas de RM"
ON public.exercise_rm_notes
FOR SELECT
TO authenticated
USING (auth.uid() = coach_id);

-- SELECT: El alumno puede ver las notas de RM sobre sus propios logs
CREATE POLICY "Alumno puede ver notas de RM sobre sus logs"
ON public.exercise_rm_notes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exercise_weight_logs ewl
    WHERE ewl.id = exercise_rm_notes.weight_log_id
      AND ewl.student_id = auth.uid()
  )
);

-- INSERT: Solo el coach puede crear notas de RM
CREATE POLICY "Coach puede insertar notas de RM"
ON public.exercise_rm_notes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = coach_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'coach'
  )
);

-- UPDATE: El coach puede editar sus propias notas de RM
CREATE POLICY "Coach puede actualizar sus notas de RM"
ON public.exercise_rm_notes
FOR UPDATE
TO authenticated
USING (auth.uid() = coach_id)
WITH CHECK (auth.uid() = coach_id);

-- DELETE: El coach puede borrar sus propias notas de RM
CREATE POLICY "Coach puede eliminar sus notas de RM"
ON public.exercise_rm_notes
FOR DELETE
TO authenticated
USING (auth.uid() = coach_id);
```

**Explicaciones:**

- `"Coach puede ver sus propias notas de RM"` → El coach accede a las notas que él mismo anotó.
- `"Alumno puede ver notas de RM sobre sus logs"` → El alumno puede ver el feedback de RM que el coach dejó sobre sus registros.
- `"Coach puede insertar notas de RM"` → Solo usuarios con `role = 'coach'` pueden crear estas notas.
- `"Coach puede actualizar sus notas de RM"` → Permite al coach corregir o actualizar el valor de RM.
- `"Coach puede eliminar sus notas de RM"` → Permite al coach borrar una nota errónea.

---

### 📌 PASO 7 — Agregar lectura de `exercise_stages` para alumnos

**Problema:** Los alumnos no pueden leer `exercise_stages`, pero los planes que se les asignan tienen referencias a stages. Esto provoca que no puedan ver la etapa de su propio entrenamiento.

```sql
-- Agrega permiso de lectura de stages a los alumnos autenticados
CREATE POLICY "Alumnos pueden ver los stages para leer sus planes"
ON public.exercise_stages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'student'
  )
);
```

**Explicación:** `"Alumnos pueden ver los stages"` → Permite que los alumnos lean la tabla de stages para poder renderizar correctamente los ejercicios de su plan asignado.

---

## 🔧 5. Corrección de Vulnerabilidad en Funciones SQL

El Security Advisor también detectó que las siguientes funciones tienen un `search_path` mutable (vector de ataque de schema injection):

- `public.update_updated_at_column`
- `public.handle_updated_at`
- `public.validate_student_profile`
- `public.handle_new_user`

**Fix — Ejecutar este SQL para cada función afectada:**

```sql
-- Fijar el search_path de las funciones de triggers
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.validate_student_profile() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
```

---

## 🔐 6. Mejora Adicional: Habilitar Protección de Contraseñas Comprometidas

El Security Advisor detectó que la protección de contraseñas comprometidas (HaveIBeenPwned) está desactivada.

**Cómo activarlo:**

1. En el panel de Supabase → **"Authentication"** → **"Sign In / Up"**
2. Buscá la sección **"Password Security"**
3. Activá el toggle **"Prevent use of leaked passwords"**

---

## ✅ Orden de Ejecución Recomendado

Ejecutá los bloques SQL **en este orden exacto** en el SQL Editor de Supabase:

| #   | Acción                                                | Urgencia       |
| --- | ----------------------------------------------------- | -------------- |
| 1   | Ejecutar PASO 1 (DROP de políticas duplicadas)        | 🔴 PRIMERO     |
| 2   | Ejecutar PASO 2 (Políticas de `profiles`)             | 🔴 Crítico     |
| 3   | Ejecutar PASO 3 (Políticas de `student_profiles`)     | 🔴 Crítico     |
| 4   | Ejecutar PASO 4 (Políticas de `workout_completions`)  | 🔴 Crítico     |
| 5   | Ejecutar PASO 5 (Políticas de `exercise_weight_logs`) | 🔴 Crítico     |
| 6   | Ejecutar PASO 6 (Políticas de `exercise_rm_notes`)    | 🟠 Importante  |
| 7   | Ejecutar PASO 7 (Fix stage lectura para alumnos)      | 🟡 Funcional   |
| 8   | Ejecutar SECCIÓN 5 (Fix search_path de funciones)     | 🟠 Importante  |
| 9   | Activar protección de contraseñas comprometidas       | 🟡 Recomendado |

---

## 🧪 7. Cómo Verificar que las Políticas Funcionan

Después de ejecutar los SQLs, verificá con estas consultas en el SQL Editor:

```sql
-- Ver todas las políticas activas en tus tablas
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Ver tablas con RLS activo pero sin políticas (debe dar 0 resultados tras aplicar las fixes)
SELECT c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relrowsecurity = true
  AND n.nspname = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid
  );
```

El segundo query debe devolver **0 filas** al terminar. Si devuelve alguna tabla, esa tabla todavía está bloqueada sin políticas.
