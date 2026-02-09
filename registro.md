# MÓDULO 1: AUTENTICACIÓN Y REGISTRO DE PROFESORES

Implementa el sistema completo de autenticación para profesores con las siguientes especificaciones.

## OBJETIVO
Sistema de login y registro funcional con validación robusta y UX fluida. Google OAuth se implementará en última fase.

## TECNOLOGÍAS ESPECÍFICAS
- React Hook Form + Zod para validación
- Zustand para estado de autenticación
- shadcn/ui para componentes
- JSON Server para API simulada (por ahora)

## FUNCIONALIDADES A IMPLEMENTAR

### 1. PÁGINA DE LOGIN

**Ubicación:** `src/pages/LoginPage.tsx`

**Features:**
- Campo email (validación de formato)
- Campo password (toggle show/hide)
- Checkbox "Recordarme"
- Botón "Iniciar Sesión"
- Link "¿Olvidaste tu contraseña?"
- Link "¿No tienes cuenta? Regístrate"
- **Placeholder para botón Google** (deshabilitado con tooltip "Próximamente")

**Validaciones:**
```typescript
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  rememberMe: z.boolean().optional(),
})
```

**Comportamiento:**
- Mostrar errores bajo cada campo
- Deshabilitar botón mientras se envía
- Mostrar spinner en botón durante request
- Toast de éxito/error
- Redireccionar a `/dashboard` si login exitoso
- Guardar token en localStorage si "recordarme" = true

**Diseño:**
Segui el diseño exactamente como esta en iuinicio.html, con el logo de stabilty cargado en public como logo 

### 2. PÁGINA DE REGISTRO (MULTI-STEP)

**Ubicación:** `src/pages/RegisterPage.tsx`

**Step 1: Datos Personales**
- Nombre (requerido, min 2 caracteres)
- Apellido (requerido, min 2 caracteres)
- Email (validación formato + disponibilidad)
- Contraseña (min 8 caracteres, debe incluir mayúscula, minúscula y número)
- Confirmar contraseña (debe coincidir)

**Indicador de fortaleza de contraseña:**
- Weak (rojo): < 8 caracteres
- Medium (amarillo): 8+ caracteres
- Strong (verde): 8+ caracteres + mayúscula + número + símbolo

**Step 3: Términos y Confirmación**
- Checkbox "Acepto términos y condiciones"
- Checkbox "Acepto política de privacidad"
- Botón "Crear Cuenta"

**Navegación entre steps:**
- Botones "Anterior" y "Siguiente"
- Indicador visual de progreso (1/3, 2/3, 3/3)
- Validar step actual antes de avanzar
- Permitir volver atrás sin perder datos

**Validación completa:**

**Comportamiento post-registro:**
- Mostrar modal de confirmación "¡Cuenta creada exitosamente!"
- Simular envío de email de confirmación
- Auto-login después de 2 segundos
- Redireccionar a onboarding o dashboard

### 3. ZUSTAND AUTH STORE

**Ubicación:** `src/features/auth/store/authStore.ts`


**Implementar:**
- Persist en localStorage (solo si rememberMe = true)
- Manejo de tokens JWT (simulados por ahora)
- Auto-logout después de X tiempo de inactividad
- Refresh token antes de expiración

### 4. RUTAS PROTEGIDAS

**Ubicación:** `src/features/auth/components/ProtectedRoute.tsx`

### 5. MOCK API ENDPOINTS


**Endpoints a simular:**
- `POST /auth/login` → Retorna token + datos de profesor
- `POST /auth/register` → Crea nuevo profesor
- `GET /auth/me` → Retorna datos del profesor autenticado
- `POST /auth/logout` → Invalida token

### 6. COMPONENTES UI NECESARIOS (quiero que saques lo que necesites de las galerias utilizadas en iuregistro.html)(shadcn/ui)
Estilos de registro: quiero que los saques de iuregistro.html
Crear/instalar estos componentes en `src/shared/components/ui/`:
- `input.tsx` - Campo de texto
- `button.tsx` - Botón con variantes
- `card.tsx` - Contenedor de formularios
- `label.tsx` - Labels de formularios
- `checkbox.tsx` - Checkboxes
- `select.tsx` - Dropdown
- `textarea.tsx` - Área de texto
- `progress.tsx` - Barra de progreso para steps
- `toast.tsx` - Notificaciones (usando Sonner)

### 7. EXTRAS DE UX

**Loading states:**
- Skeleton en campos mientras valida email duplicado
- Spinner en botón durante submit
- Pantalla de carga al verificar autenticación

**Error handling:**
- Errores inline bajo cada campo
- Toast para errores de servidor
- Mensajes claros y accionables

**Accesibilidad:**
- Labels asociados a inputs
- ARIA labels donde corresponda
- Navegación con teclado (Tab, Enter)
- Focus visible

**Responsive:**
- Mobile: formulario full width
- Tablet: formulario centrado, max-width 500px
- Desktop: formulario centrado, max-width 600px

## ROUTING

**Actualizar `src/app/Router.tsx`:**

## TESTING (Desarrollo)

**Usuarios de prueba:**
- Email: `demo@trainer.com`
- Password: `Demo1234`

**Flujos a testear:**
1. Login exitoso → redirección a dashboard
2. Login fallido → mensaje de error
3. Registro completo → auto-login
4. Validaciones en todos los campos
5. "Recordarme" → persistencia en localStorage
6. Logout → limpieza de estado

## NOTA: GOOGLE OAUTH

**Por ahora:**
- Crear placeholder del botón "Continuar con Google" (deshabilitado)
- Agregar comentario `// TODO: Implementar en Fase Final`
- Preparar estructura en authStore: `loginWithGoogle: () => Promise<void>`

**Para última fase:**
- Configurar Firebase en `lib/firebase.ts`
- Implementar `GoogleAuthButton.tsx`
- Actualizar authStore con lógica de Firebase

## ENTREGABLES

✅ LoginPage funcional
✅ RegisterPage con 3 steps
✅ AuthStore con Zustand
✅ ProtectedRoute
✅ Validaciones robustas
✅ Mock API configurada
✅ Componentes UI base
✅ Routing completo

Una vez completado, confirma para continuar con **PROMPT 2: DASHBOARD**.