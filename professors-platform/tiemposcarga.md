# Fix: Tiempos de carga lentos y logout lento

## CONTEXTO DEL PROYECTO

Stack: React + TypeScript + Vite + Supabase + Zustand (con `persist`).
Proyecto en `professors-platform/`.
**NO instalar dependencias nuevas. NO cambiar el diseño visual. NO romper lógica existente.**

---

## PROBLEMA 1 (CRÍTICO): Login lento — `userToProfessor` hace 2 queries secuenciales en cada login, init, y token refresh

**Archivo:** `professors-platform/src/features/auth/store/authStore.ts`

**Líneas del problema:** L78–L120 — la función `userToProfessor` primero espera el resultado de `profiles`, y _después_ lanza la query a `student_profiles`. Son 2 round-trips a Supabase en cadena.

**Además:** Esta misma función se llama en 3 lugares distintos:

- `initializeAuth` (L162)
- `onAuthStateChange` → `SIGNED_IN` (L190)
- `login` (L272)

Lo que significa que en cada evento de auth, hay **2 queries seriales**.

**Solución:** Paralelizar las 2 queries con `Promise.all`. Si el usuario es coach, la segunda query no se ejecuta.

```typescript
// ✅ REEMPLAZAR la función userToProfessor completa (L78–L120) con esta versión:

const userToProfessor = async (user: User): Promise<Professor | null> => {
  try {
    // Query 1: siempre necesaria
    const profilePromise = supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Query 2: lanzarla en paralelo desde ya (no esperamos el resultado de profiles)
    const studentProfilePromise = supabase
      .from("student_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    // Esperar ambas en paralelo
    const [{ data: profile, error }, { data: studentProfile }] =
      await Promise.all([profilePromise, studentProfilePromise]);

    if (error || !profile) {
      console.error("Error fetching profile:", error);
      return null;
    }

    // Para coaches, ignorar el resultado de student_profiles
    const hasCompletedProfile =
      profile.role === "coach" ? true : !!studentProfile;

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role as "student" | "coach",
      createdAt: profile.created_at,
      profileImage: profile.profile_image || undefined,
      hasCompletedProfile,
    };
  } catch (error) {
    console.error("Error converting user to professor:", error);
    return null;
  }
};
```

---

## PROBLEMA 2 (CRÍTICO): Logout lento — el componente espera a Supabase antes de navegar

**Archivos afectados:**

- `professors-platform/src/components/layout/Sidebar.tsx` — `handleLogout` (L38–L45)
- `professors-platform/src/features/training/TrainingPlaceholders.tsx` — `handleLogout` (L56–L59)

**Problema:** El `handleLogout` en ambos componentes hace `await logout()` y _después_ navega. El `logout()` en el store espera a que `supabase.auth.signOut()` responda (puede tardar 500ms–2s dependiendo de la red).

El usuario ve la pantalla congelada hasta que Supabase confirma el logout.

**Solución en `authStore.ts` (L433–L454):** Limpiar el estado local PRIMERO (instantáneo), y luego hacer el signOut de Supabase en segundo plano sin bloquear.

```typescript
// ✅ REEMPLAZAR la función logout completa en authStore.ts con esta versión:

logout: async () => {
  // 1. Limpiar timer de inactividad
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  // 2. Limpiar estado local INMEDIATAMENTE (el usuario ve el logout al instante)
  set({
    professor: null,
    isAuthenticated: false,
    error: null,
    rememberMe: false,
    lastActivity: null,
    tokenExpiry: null,
  });

  // 3. Llamar a Supabase en segundo plano (fire-and-forget, no bloquea)
  supabase.auth.signOut().catch((error) => {
    console.error("Error signing out from Supabase (non-blocking):", error);
  });
},
```

**Solución en `Sidebar.tsx` — `handleLogout` (L38–L45):** No necesita cambios de lógica, pero asegurarse de que sea así:

```typescript
// ✅ handleLogout en Sidebar.tsx — verificar que quede así:
const handleLogout = async () => {
  try {
    await logout(); // Ahora es instantáneo porque limpia estado local primero
    navigate("/login", { replace: true });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    navigate("/login", { replace: true }); // Navegar igual aunque falle
  }
};
```

**Solución en `TrainingPlaceholders.tsx` — `handleLogout` (L56–L59):** Igual:

```typescript
// ✅ handleLogout en TrainingPlaceholders.tsx — verificar que quede así:
const handleLogout = async () => {
  await logout(); // Instantáneo ahora
  navigate("/login", { replace: true });
};
```

---

## PROBLEMA 3 (ALTO): `useStudents` hace 3 queries secuenciales al cargar la lista de alumnos

**Archivo:** `professors-platform/src/hooks/useStudents.ts` — función `loadStudents` (L65–L140)

**Problema:** Las queries se hacen en este orden, cada una esperando a la anterior:

1. Fetch `profiles` → esperar resultado → extraer IDs
2. Fetch `student_profiles` → esperar resultado
3. Fetch `training_plan_assignments` → esperar resultado

Queries 2 y 3 **no dependen entre sí**, solo necesitan los IDs de la query 1. Se pueden paralizar.

**Solución:** Paralelizar queries 2 y 3 con `Promise.all` una vez que tenemos los IDs:

```typescript
// ✅ DENTRO de loadStudents, REEMPLAZAR las queries 2 y 3 con esto:

// Una vez que tenemos studentIds de la query 1, lanzar 2 y 3 en paralelo:
const [
  { data: studentDetails, error: detailsError },
  { data: assignmentsData, error: assignmentsError },
] = await Promise.all([
  supabase
    .from("student_profiles")
    .select(
      "id, profile_image_url, training_experience, primary_goal, activity_level, phone, instagram",
    )
    .in("id", studentIds),
  supabase
    .from("training_plan_assignments")
    .select(
      `
      student_id,
      plan_id,
      start_date,
      end_date,
      status,
      training_plans ( title )
    `,
    )
    .in("student_id", studentIds)
    .in("status", ["active", "paused"]),
]);

if (detailsError) throw detailsError;
if (assignmentsError) {
  console.warn("Could not load assignments:", assignmentsError);
}
// El resto del código de transformación de datos queda exactamente igual
```

---

## PROBLEMA 4 (ALTO): `register` tiene un `setTimeout` de 1000ms hardcodeado — bloquea el registro

**Archivo:** `professors-platform/src/features/auth/store/authStore.ts` — L332–L333

```typescript
// LÍNEA PROBLEMÁTICA — agrega 1 segundo fijo al proceso de registro:
await new Promise((resolve) => setTimeout(resolve, 1000));
```

**Problema:** Este delay artificial de 1000ms se pensó para "esperar al trigger de Supabase", pero ya hay un fallback manual si el perfil no existe (L339–L365). El delay es innecesario.

**Solución:** Eliminar completamente esas 2 líneas del `register`. El código ya maneja el caso donde el perfil no existe.

```typescript
// ❌ ELIMINAR estas 2 líneas (L332–L333):
// await new Promise((resolve) => setTimeout(resolve, 1000));

// El código continúa directamente con:
// 3. Try to get the profile (trigger should have created it)
let professor = await userToProfessor(authData.user);
```

---

## PROBLEMA 5 (MEDIO): `initializeAuth` hace fetch de perfil desde Supabase aunque Zustand `persist` ya tiene los datos en localStorage

**Archivo:** `professors-platform/src/features/auth/store/authStore.ts` — `initializeAuth` (L155–L206)

**Problema:** Al cargar la app, `initializeAuth` se llama en `App.tsx`. Hace una llamada a `supabase.auth.getSession()` y si hay sesión, llama a `userToProfessor()` (2 queries a la BD). Pero Zustand `persist` ya hidrata el `professor` desde localStorage antes del primer render. Esto significa que se hacen queries redundantes al inicio aunque el usuario ya esté logueado y los datos estén en memoria.

**Solución:** Verificar si el store ya tiene datos hidratados antes de hacer la llamada a Supabase. Si ya hay `professor` en el store, saltear el fetch de perfil y solo verificar que la sesión siga activa:

```typescript
// ✅ REEMPLAZAR initializeAuth completa con esta versión:

initializeAuth: async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      // No hay sesión activa → limpiar estado por si había datos stale
      set({
        professor: null,
        isAuthenticated: false,
        lastActivity: null,
        tokenExpiry: null,
      });
    } else {
      // Hay sesión activa
      const currentState = get();

      if (currentState.professor && currentState.isAuthenticated) {
        // Zustand ya tiene datos hidratados desde localStorage → no hacer fetch
        // Solo actualizar timestamps
        const now = Date.now();
        set({
          lastActivity: now,
          tokenExpiry: now + TOKEN_EXPIRY_TIME,
        });
      } else {
        // No hay datos en store → hacer fetch normal
        const professor = await userToProfessor(session.user);
        if (professor) {
          const now = Date.now();
          set({
            professor,
            isAuthenticated: true,
            lastActivity: now,
            tokenExpiry: now + TOKEN_EXPIRY_TIME,
          });
        }
      }

      get().updateActivity();
    }

    // Listener de cambios de auth (sin cambios)
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      if (event === "SIGNED_OUT" || !session) {
        set({
          professor: null,
          isAuthenticated: false,
          error: null,
          rememberMe: false,
          lastActivity: null,
          tokenExpiry: null,
        });
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          const currentState = get();
          // Solo re-fetch si el usuario cambió o no hay datos
          if (!currentState.professor || currentState.professor.id !== session.user.id) {
            const professor = await userToProfessor(session.user);
            if (professor) {
              const now = Date.now();
              set({
                professor,
                isAuthenticated: true,
                lastActivity: now,
                tokenExpiry: now + TOKEN_EXPIRY_TIME,
              });
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Error initializing auth:", error);
  }
},
```

---

## ARCHIVOS A MODIFICAR (solo estos 3)

1. `professors-platform/src/features/auth/store/authStore.ts`
   - Paralelizar `userToProfessor` con `Promise.all`
   - `logout`: limpiar estado local primero, Supabase en background
   - `register`: eliminar `setTimeout` de 1000ms
   - `initializeAuth`: skipear fetch si Zustand ya tiene datos

2. `professors-platform/src/hooks/useStudents.ts`
   - Paralelizar queries 2 y 3 con `Promise.all`

3. `professors-platform/src/components/layout/Sidebar.tsx` y `professors-platform/src/features/training/TrainingPlaceholders.tsx`
   - Verificar que `handleLogout` navegue siempre (incluso si logout falla)

## NO TOCAR

- Ningún componente de UI ni diseño
- `RequireAuth.tsx` — ya está correcto
- `router/index.tsx` — no modificar
- Hooks de supabase (`useTrainingPlans`, `useExerciseStages`) — no modificar
- Ninguna query de escritura (insert/update/delete)

## VERIFICACIÓN FINAL

Después de los cambios, probar manualmente:

- [ ] Login: debe ser notablemente más rápido
- [ ] Logout: debe ser instantáneo (sin freeze)
- [ ] Navegar a `/inicio`: lista de alumnos carga más rápido
- [ ] Refrescar la página estando logueado: no debe mostrar pantalla en blanco mientras carga
