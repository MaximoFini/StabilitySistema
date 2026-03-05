# 🐛 Fix: Pantalla en Blanco en PWA (Segunda Carga)

## 🔴 Problema Identificado

La PWA se queda con pantalla en blanco al entrar por segunda vez, tanto en Android como iOS.

**Causa raíz**: Service Worker con configuración agresiva de cache (`clientsClaim: true`) que cachea todos los archivos sin estrategia de red adecuada. Esto causa que en la segunda carga se sirvan archivos desactualizados o corruptos del cache.

## 📍 Archivos Afectados

1. `vite.config.ts` - Configuración incorrecta de Workbox
2. `src/pwa.ts` - Falta manejo de actualizaciones
3. `src/main.tsx` - Necesita limpieza temporal de caches

---

## 🛠️ Solución

### 1. Modificar `vite.config.ts`

**Ubicación**: `professors-platform/vite.config.ts`

**Cambios en la sección `workbox`**:

#### ❌ Configuración Actual (PROBLEMÁTICA):
```typescript
workbox: {
  globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
  cleanupOutdatedCaches: true,
  clientsClaim: true,
}
```

#### ✅ Nueva Configuración (CORREGIDA):

**A. Deshabilitar `clientsClaim`**:
- Cambiar `clientsClaim: true` a `clientsClaim: false`
- **Razón**: Evita que el SW tome control inmediato y sirva cache corrupto

**B. Reducir `globPatterns`**:
- Cambiar de `["**/*.{js,css,html,ico,png,svg,woff2}"]`
- A: `["**/*.{png,svg,ico,woff2}"]` (solo assets estáticos)
- **Razón**: JS/CSS/HTML deben ir por red, no por precache

**C. Agregar `runtimeCaching`** (array de estrategias):

1. **HTML files**:
   - `urlPattern`: `/^https:\/\/.html$/`
   - `handler`: `'NetworkFirst'`
   - `cacheName`: `'html-cache'`
   - `expiration`: 10 entradas, 24 horas
   - `networkTimeoutSeconds`: 10

2. **JS/CSS files**:
   - `urlPattern`: `/\.(?:js|css)$/`
   - `handler`: `'StaleWhileRevalidate'`
   - `cacheName`: `'static-resources'`
   - `expiration`: 60 entradas, 7 días

3. **API calls (Supabase)**:
   - `urlPattern`: Función que detecta `url.origin === 'https://TU_SUPABASE_URL.supabase.co'`
   - `handler`: `'NetworkOnly'`
   - `cacheName`: `'api-cache'`
   - **IMPORTANTE**: Reemplazar `TU_SUPABASE_URL` con tu URL real de Supabase

4. **Imágenes**:
   - `urlPattern`: `/\.(?:png|jpg|jpeg|svg|gif|webp)$/`
   - `handler`: `'CacheFirst'`
   - `cacheName`: `'images-cache'`
   - `expiration`: 100 entradas, 30 días

5. **Google Fonts Stylesheets**:
   - `urlPattern`: `/^https:\/\/fonts\.googleapis\.com/`
   - `handler`: `'StaleWhileRevalidate'`
   - `cacheName`: `'google-fonts-stylesheets'`

6. **Google Fonts Assets**:
   - `urlPattern`: `/^https:\/\/fonts\.gstatic\.com/`
   - `handler`: `'CacheFirst'`
   - `cacheName`: `'google-fonts-webfonts'`
   - `expiration`: 30 entradas, 1 año

---

### 2. Modificar `src/pwa.ts`

**Ubicación**: `professors-platform/src/pwa.ts`

**Cambios necesarios**:

#### A. Modificar `onNeedRefresh`:
- **Agregar**: `window.location.reload()` dentro del callback
- **Razón**: Recargar automáticamente cuando hay nueva versión

#### B. Agregar callback `onRegisteredSW`:
- **Parámetros**: `(swUrl, registration)`
- **Contenido**:
  ```javascript
  if (registration) {
    setInterval(() => {
      registration.update();
    }, 30 * 1000); // Chequear cada 30 segundos
  }
  ```
- **Razón**: Verificar actualizaciones periódicamente

#### C. Agregar callback `onRegisterError` (opcional pero recomendado):
- **Parámetros**: `(error)`
- **Contenido**: `console.error("[PWA] Error registrando SW:", error)`
- **Razón**: Debugging de errores de registro

---

### 3. Agregar Limpieza Temporal en `src/main.tsx`

**Ubicación**: `professors-platform/src/main.tsx`

**Agregar ANTES de `createRoot`**:

```javascript
// Limpiar Service Workers y caches viejos (TEMPORAL)
if ('serviceWorker' in navigator) {
  // Desregistrar todos los SW
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then(() => {
        console.log('[PWA] Service Worker desregistrado');
      });
    }
  });
  
  // Limpiar todos los caches
  caches.keys().then((names) => {
    for (const name of names) {
      caches.delete(name);
    }
  });
}
```

**⚠️ IMPORTANTE**: 
- Agregar este código ahora
- **Removerlo después del primer deploy exitoso**
- Es solo para limpiar instalaciones corruptas actuales

---

## 🔄 Proceso de Deploy y Testing

### 1. Implementar cambios:
- [ ] Modificar `vite.config.ts` (workbox config)
- [ ] Modificar `src/pwa.ts` (callbacks)
- [ ] Agregar limpieza en `src/main.tsx`
- [ ] Commit y push

### 2. Deploy a producción:
- [ ] Build: `npm run build`
- [ ] Deploy a Vercel/hosting

### 3. Limpiar instalaciones corruptas:

#### En Android:
1. Abrir Chrome (no la PWA)
2. Ir a `chrome://serviceworker-internals/`
3. Buscar tu dominio
4. Click "Unregister" en todos los SW
5. Ir a `chrome://settings/content/siteDetails?site=https://TU_DOMINIO`
6. Click "Clear & reset"
7. Reinstalar PWA

#### En iOS:
1. Ajustes > Safari > Avanzado > Datos de sitios web
2. Buscar dominio y eliminar
3. Ajustes > General > Almacenamiento de iPhone
4. Buscar PWA y eliminarla
5. Reinstalar desde Safari

### 4. Verificar que funciona:
- [ ] Primera carga: ✅
- [ ] Segunda carga: ✅ (no debería haber pantalla en blanco)
- [ ] Tercera carga: ✅
- [ ] Modo offline: ✅

### 5. Remover código temporal:
- [ ] Eliminar el bloque de limpieza de `src/main.tsx`
- [ ] Commit y push
- [ ] Deploy final

---

## 📊 Verificación en DevTools

Después de reinstalar la PWA:

1. **Chrome DevTools** > **Application** > **Service Workers**
   - Debería mostrar 1 SW activo
   - Estado: "activated and is running"

2. **Application** > **Cache Storage**
   - Deberías ver estos caches:
     - `html-cache`
     - `static-resources`
     - `images-cache`
     - `google-fonts-stylesheets`
     - `google-fonts-webfonts`
   - **NO deberías ver**: caches con nombres como `workbox-precache-*`

3. **Console**:
   - Primera carga: "[PWA] App lista para funcionar offline."
   - No deberían haber errores de SW

---

## 🎯 Resultado Esperado

| Escenario | Antes | Después |
|-----------|-------|---------|
| Primera carga | ✅ Funciona | ✅ Funciona |
| Segunda carga | ❌ Pantalla en blanco | ✅ Funciona |
| Tercera carga | ❌ Pantalla en blanco | ✅ Funciona |
| Modo offline | ❌ No funciona | ✅ Funciona parcialmente |
| Actualización | ❌ No se actualiza | ✅ Auto-actualiza |

---

## 📝 Notas Técnicas

### Estrategias de Cache Utilizadas:

1. **NetworkFirst** (HTML):
   - Intenta red primero
   - Si falla o tarda >10s, usa cache
   - Actualiza cache con respuesta de red

2. **StaleWhileRevalidate** (JS/CSS):
   - Sirve desde cache inmediatamente
   - Actualiza cache en background
   - Balance entre velocidad y frescura

3. **NetworkOnly** (API Supabase):
   - Nunca cachea
   - Siempre va a red
   - Evita datos desactualizados

4. **CacheFirst** (Imágenes/Fonts):
   - Sirve desde cache si existe
   - Solo descarga si no está en cache
   - Ideal para assets inmutables

### ¿Por qué `clientsClaim: false`?

- `clientsClaim: true` hace que el SW tome control **inmediatamente** al registrarse
- Esto causa que en la segunda carga se sirvan archivos del cache sin verificar la red
- `clientsClaim: false` permite que el navegador termine de cargar antes de que el SW tome control
- El SW toma control en la **próxima** navegación, cuando ya está probado

---

## 🚨 Troubleshooting

### Si después del fix sigue fallando:

1. **Verificar que se aplicaron todos los cambios**:
   - `vite.config.ts`: `clientsClaim: false`
   - `vite.config.ts`: `runtimeCaching` array completo
   - `src/pwa.ts`: `window.location.reload()` en `onNeedRefresh`

2. **Forzar limpieza manual**:
   ```javascript
   // En la consola del navegador
   navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))
   caches.keys().then(k => k.forEach(c => caches.delete(c)))
   location.reload()
   ```

3. **Verificar versión del SW**:
   - Abrir `chrome://serviceworker-internals/`
   - Buscar tu dominio
   - Verificar que la fecha de registro sea reciente

4. **Verificar que no hay SW duplicados**:
   - Solo debería haber 1 SW activo
   - Si hay múltiples, desregistrar todos y reinstalar

---

## ✅ Checklist de Implementación

- [ ] 1. Leer todo este documento
- [ ] 2. Hacer backup de `vite.config.ts` y `src/pwa.ts`
- [ ] 3. Modificar `vite.config.ts` según sección 1
- [ ] 4. Modificar `src/pwa.ts` según sección 2
- [ ] 5. Agregar limpieza temporal en `src/main.tsx` según sección 3
- [ ] 6. Hacer build local: `npm run build`
- [ ] 7. Testear localmente con `npm run preview`
- [ ] 8. Si funciona, commit y push
- [ ] 9. Deploy a producción
- [ ] 10. Comunicar a usuarios que limpien cache (ver sección de deploy)
- [ ] 11. Verificar que funciona en dispositivos reales
- [ ] 12. Esperar 24-48 horas para confirmar que no hay reportes
- [ ] 13. Remover código temporal de `src/main.tsx`
- [ ] 14. Deploy final
- [ ] 15. ✅ Cerrar este issue

---

**Autor**: GitHub Copilot  
**Fecha**: 2026-03-04 19:43:57  
**Issue**: PWA pantalla en blanco en segunda carga  
**Plataformas afectadas**: Android + iOS  
**Severity**: 🔴 Crítico (bloquea uso de la app)