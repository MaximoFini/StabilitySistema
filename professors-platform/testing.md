🚀 Checklist Pre-Producción — Stability Sistema

> _Proyecto:_ Plataforma de entrenamiento (Coach + Alumno)
> _Stack:_ React + TypeScript (Vite) / Supabase (Auth + DB + Storage) / Firebase (Auth secundario)
> _Fecha:_ 2026-02-27

---

s

## 1. 🔐 SEGURIDAD

### 1.1 Autenticación & Sesiones

- [ ] _Variables de entorno expuestas:_ Verificar que VITE*FIREBASE_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY y demás VITE*\* NO contengan secrets sensibles (las VITE\_ se exponen al cliente). Confirmar que las claves son del tipo anon (no service_role).
- [ ] _Doble sistema de auth:_ El proyecto importa tanto Firebase Auth (src/lib/firebase.ts) como Supabase Auth (src/lib/supabase.ts). Confirmar cuál es el sistema activo en producción y _remover_ o deshabilitar el que no se use para evitar vectores de ataque dobles.
- [ ] _Token de sesión:_ authStore maneja tokenExpiry y lastActivity — verificar que la sesión expira correctamente y que un usuario con sesión vencida NO puede hacer requests a Supabase.
- [ ] _Auto-logout por inactividad deshabilitado:_ El código tiene un comentario // Auto-logout by inactivity is disabled. _Decisión requerida:_ ¿Es aceptable para producción? Considerar habilitarlo para sesiones de coach con datos sensibles.
- [ ] _Persistencia de sesión en localStorage:_ Zustand con persist guarda estado de auth en localStorage. Confirmar que NO se persisten tokens ni datos sensibles directamente.

### 1.2 Autorización (RLS & Roles)

- [ ] _Row Level Security (RLS) en TODAS las tablas de Supabase:_
  - profiles — Solo el usuario puede editar su perfil; coaches solo lectura de sus alumnos.
  - student_profiles — Solo el alumno puede escribir; el coach asignado puede leer.
  - training_plans — Solo el coach creador puede CRUD.
  - training_plan_assignments — Coach puede asignar; alumno solo lee su asignación.
  - training_plan_days / training_plan_exercises — Heredan permisos del plan.
  - workout_completions — Solo el alumno puede insertar sus completions; coach puede leer.
  - exercise_weight_logs — Solo el alumno inserta; coach puede leer.
  - exercise_rm_notes — Solo el coach inserta.
  - exercises / exercise_categories — Verificar política de lectura/escritura.
- [ ] _Verificación de role en frontend:_ RequireAuth solo verifica isAuthenticated. Confirmar que RequireRole se usa en TODAS las rutas de coach (/inicio, /planificador, /biblioteca, /dashboard) para que un alumno no pueda acceder.
- [ ] _Coach solo ve SUS alumnos:_ Verificar que las queries en useStudents y useStudentProfile filtran por coach_id y no exponen datos de otros coaches.

### 1.3 Protección de Datos

- [ ] _Sanitización de inputs:_ Los formularios usan Zod para validación (Login, Register, StudentProfileSetup). Verificar que NO hay inputs que vayan directamente a queries sin pasar por validación.
- [ ] _Subida de archivos (Storage):_ uploadProfileImage acepta archivos — confirmar que en Supabase Storage hay restricciones de:
  - Tamaño máximo (el frontend valida 5MB, ¿el backend también?).
  - Tipos MIME permitidos (PNG, JPG, WEBP).
  - Políticas de acceso al bucket profile-images.
- [ ] _Datos médicos sensibles:_ El sistema almacena previous_injuries, medical_conditions, weight_kg, etc. Evaluar si se necesita encriptación adicional o cumplimiento con regulaciones de datos de salud.

### 1.4 Secrets & Configuración

- [ ] _.env no está en el repo_ — Confirmar que .gitignore incluye .env\*.
- [ ] _Firebase config:_ Verificar que las API keys de Firebase están restringidas por dominio en la consola de Firebase.
- [ ] _Supabase URL:_ En producción, confirmar que el proyecto Supabase tiene habilitado HTTPS y que la anon key tiene permisos mínimos.

---

## 2. ⚡ RENDIMIENTO

### 2.1 Problemas Conocidos (del análisis de tiemposcarga.md)

- [ ] _Login lento:_ userToProfessor hace 2 queries secuenciales a Supabase en cada login, init y token refresh. _Paralelizar con Promise.all_.
- [ ] _Logout lento:_ El componente espera la respuesta de Supabase antes de navegar. _Limpiar estado local primero, Supabase en background._
- [ ] _useStudents waterfall:_ 3 queries secuenciales al cargar la lista de alumnos. _Paralelizar queries independientes._
- [ ] _register con setTimeout:_ Hay un setTimeout de 1000ms hardcodeado que bloquea el registro. _Eliminar._
- [ ] _initializeAuth redundante:_ Hace fetch de perfil desde Supabase aunque Zustand ya tiene datos en localStorage. _Skipear si hay datos hidratados._

### 2.2 Bundle & Carga

- [ ] _Code Splitting:_ El router usa lazy() para todas las páginas ✅. Verificar que los chunks generados por Vite son de tamaño razonable (npx vite build --report).
- [ ] _Tree Shaking:_ Confirmar que no se importan librerías completas innecesariamente (ej: import { X } from "lucide-react" está bien, import \* as lucide no).
- [ ] _Imágenes:_ Verificar que las imágenes del landing/login están optimizadas (WebP, lazy loading).
- [ ] _Fonts:_ Se cargan Google Fonts (Playfair Display) con display=swap ✅. Considerar self-hosting para evitar dependencia de terceros.

### 2.3 Queries a Base de Datos

- [ ] _N+1 queries:_ En useStudents, por cada alumno se hacen queries adicionales. Evaluar usar una sola query con JOINs o una función RPC en Supabase.
- [ ] _Índices en Supabase:_ Verificar índices en columnas frecuentemente consultadas:
  - training_plan_assignments.student_id
  - training_plan_assignments.coach_id
  - training_plan_assignments.status
  - workout_completions.student_id
  - workout_completions.assignment_id
  - exercise_weight_logs.student_id
- [ ] _Paginación:_ Si el coach tiene muchos alumnos o planes, ¿hay paginación? Considerar para listas largas.

### 2.4 Estado del Cliente

- [ ] _Re-renders innecesarios:_ useAuthStore se accede en muchos componentes. Verificar que se usen selectores específicos (state.professor) y no se suscriban al store completo.
- [ ] _Zustand persist:_ Verificar que el store persistido no crece indefinidamente con datos obsoletos.

---

## 3. 🧠 LÓGICA DE NEGOCIO

### 3.1 Flujo de Entrenamiento (Alumno)

- [ ] _Asignación activa:_ useActiveAssignment busca asignación con status active. ¿Qué pasa si un alumno tiene 2 asignaciones activas? Debe devolver solo la más reciente o manejar el conflicto.
- [ ] _Progresión de días:_ current_day_number se actualiza dinámicamente en useActiveAssignment. Verificar que NO se pueda completar el mismo día dos veces.
- [ ] _Workout completion:_ saveCompletion valida assignmentId y dayNumber. Testear:
  - ¿Qué pasa si el alumno cierra la app a mitad de un workout y vuelve?
  - ¿Se pierde el progreso parcial? (trainingStore está en memoria).
  - ¿Se puede completar un workout sin internet y sincronizar después?
- [ ] _Mood check obligatorio:_ El alumno pasa por MoodCheckScreen antes de iniciar. ¿Es realmente obligatorio o se puede saltar con navegación directa por URL?
- [ ] _Estado "completed":_ Cuando completed_days >= total_days, el assignment pasa a completed. Verificar que el alumno ve un estado final correcto y no puede seguir entrenando.
- [ ] _RPE y mood mapping:_ El mapeo de moods (excelente→excellent, etc.) está hardcodeado. Verificar que los valores coinciden con el constraint de la BD.

### 3.2 Flujo de Coach

- [ ] _Crear plan:_ Validar que un plan debe tener al menos 1 día y 1 ejercicio ✅. Testear edge cases: plan con un solo ejercicio, plan con 7 días.
- [ ] _Asignar plan a alumno:_ Verificar que no se pueda asignar un plan a un alumno que ya tiene una asignación activa del mismo plan.
- [ ] _Desasignar/pausar/cancelar:_ Verificar que los estados paused y cancelled funcionan correctamente y el alumno deja de ver el plan.
- [ ] _Editar plan asignado:_ ¿Qué pasa si el coach edita un plan que ya está asignado? ¿Se actualiza para el alumno?
- [ ] _Eliminar plan:_ Verificar que ON DELETE CASCADE funciona y limpia assignments, days, exercises.

### 3.3 Registro & Perfiles

- [ ] _Registro de coach:_ Flujo completo — email → verificación → login → dashboard.
- [ ] _Registro de alumno:_ Flujo completo — registro → login → completar perfil (StudentProfileSetup) → acceso a entrenamiento.
- [ ] _hasCompletedProfile:_ Si un alumno no completó el perfil, se redirige a /register/complete-profile. Verificar que no puede acceder a /entrenamiento sin completar.
- [ ] _Google Login:_ loginWithGoogle existe en el store. Verificar que funciona end-to-end o removerlo si no está listo.

### 3.4 Guardado de Pesos (exercise_weight_logs)

- [ ] _Sets detail:_ Cada log incluye un array de sets_detail con set_number, target_reps, actual_reps, kg. Verificar que se guarda correctamente al finalizar workout.
- [ ] _RM Notes del coach:_ Verificar que exercise_rm_notes permite al coach agregar notas sobre RM.
- [ ] _Integridad de datos:_ ¿Qué pasa si el alumno no completa todos los sets? ¿Se guardan parcialmente?

---

## 4. 🧪 TESTING

### 4.1 Tests Críticos a Escribir/Ejecutar

- [ ] _Auth flow E2E:_ Login coach → ver alumnos → asignar plan → logout.
- [ ] _Auth flow E2E:_ Register alumno → completar perfil → ver plan → hacer workout → completar.
- [ ] _Error handling:_ Simular Supabase caído — ¿la app muestra errores amigables o crashea?
- [ ] _Concurrent sessions:_ ¿Qué pasa si el mismo usuario abre la app en 2 tabs? (onAuthStateChange lo maneja).
- [ ] _Navegación directa:_ Testear acceso directo a URLs protegidas sin estar logueado.
- [ ] _Responsive:_ Testear en mobile (la app tiene UI mobile-first para alumnos).

### 4.2 Tests de Borde

- [ ] _Alumno sin plan asignado:_ Debe ver "Sin plan asignado" en TrainingHome.
- [ ] _Coach sin alumnos:_ Lista vacía con CTA para invitar alumnos.
- [ ] _Plan sin ejercicios:_ No debería poder guardarse (validación existe ✅).
- [ ] _Datos numéricos extremos:_ Peso de 0kg, reps negativas, RPE > 10.
- [ ] _Strings largas:_ Nombre de plan de 500 caracteres, notas de coach muy largas.
- [ ] _Caracteres especiales:_ Ñ, acentos, emojis en nombres y notas.

---

## 5. 🛠️ INFRAESTRUCTURA & DEPLOY

### 5.1 Preparación

- [ ] _Variables de entorno de producción:_ Configurar TODAS las VITE\_\* en el hosting (Vercel/Netlify/otro):
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_FIREBASE_API_KEY
  - VITE_FIREBASE_AUTH_DOMAIN
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_STORAGE_BUCKET
  - VITE_FIREBASE_MESSAGING_SENDER_ID
  - VITE_FIREBASE_APP_ID
- [ ] _Dominio personalizado:_ Configurar dominio + SSL.
- [ ] _CORS en Supabase:_ Configurar dominios permitidos en el panel de Supabase.

### 5.2 Monitoreo

- [ ] _Remover console.log de producción:_ Hay MUCHOS console.log en el código (authStore, supabase-storage, useTrainingPlans, useWorkoutCompletions, etc.). _Eliminar o reemplazar con un logger condicional._
- [ ] _Error tracking:_ Configurar Sentry o similar para capturar errores en producción.
- [ ] _Analytics:_ ¿Se necesitan métricas de uso? Configurar si es necesario.

### 5.3 Backup & Recuperación

- [ ] _Backup de Supabase:_ Configurar backups automáticos de la base de datos.
- [ ] _Storage backup:_ Las imágenes de perfil en Supabase Storage — ¿tienen backup?

---

## 6. 🎨 UX & CALIDAD

### 6.1 Estados de UI

- [ ] _Loading states:_ Todos los componentes principales manejan estados de carga ✅ (skeletons, spinners). Verificar que no hay pantallas en blanco.
- [ ] _Error states:_ StudentsList, StudentProfile, PlanPreview muestran errores ✅. Verificar TODAS las pantallas.
- [ ] _Empty states:_ Verificar mensajes para listas vacías (sin alumnos, sin planes, sin completions).
- [ ] _Offline:_ ¿Qué pasa sin conexión? La app debería mostrar un mensaje, no quedarse cargando infinitamente.

### 6.2 Accesibilidad

- [ ] _Labels en formularios:_ Verificar que todos los inputs tienen labels correctos para screen readers.
- [ ] _Contraste:_ Colores de texto sobre fondo — verificar con herramienta de contraste (especialmente dark mode).
- [ ] _Keyboard navigation:_ ¿Se puede usar la app solo con teclado?

### 6.3 Internacionalización

- [ ] _Consistencia de idioma:_ La app está en español pero hay mensajes en inglés mezclados en logs y algunos componentes. Unificar todo al español para la UI.
- [ ] _Fechas:_ Se usa es-ES para formateo de fechas ✅. Verificar consistencia.

---

## 7. 📋 PRIORIDADES — ORDEN DE EJECUCIÓN

| Prioridad  | Área        | Item                                               |
| ---------- | ----------- | -------------------------------------------------- |
| 🔴 Crítica | Seguridad   | RLS en TODAS las tablas de Supabase                |
| 🔴 Crítica | Seguridad   | Remover/deshabilitar Firebase si no se usa         |
| 🔴 Crítica | Seguridad   | Verificar que service_role key NO está en frontend |
| 🔴 Crítica | Producción  | Remover todos los console.log                      |
| 🟠 Alta    | Rendimiento | Paralelizar userToProfessor y useStudents          |
| 🟠 Alta    | Lógica      | Evitar doble completion del mismo día              |
| 🟠 Alta    | Lógica      | Testear flujo completo coach + alumno E2E          |
| 🟡 Media   | Rendimiento | Eliminar setTimeout del register                   |
| 🟡 Media   | Seguridad   | Restricciones en Firebase console (dominio)        |
| 🟡 Media   | Infra       | Error tracking (Sentry)                            |
| 🟢 Baja    | UX          | Offline state handling                             |
| 🟢 Baja    | UX          | Accesibilidad completa                             |

---
