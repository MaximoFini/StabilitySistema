# 🔍 Cómo Encontrar la Conexión en Database Client

## Paso 1: Ubicar el Ícono de Database Client

La extensión Database Client tiene un ícono específico en la barra lateral de VS Code. Aquí te muestro dónde buscarlo:

### Opción A: Barra de Actividades (Izquierda)
Busca en la barra lateral izquierda uno de estos íconos:
- 🗄️ Un ícono de base de datos (cilindro)
- 📊 Un ícono de tabla/grid
- El ícono puede decir "DATABASE" o tener forma de servidor

**IMPORTANTE:** Si no ves el ícono, puede estar oculto. Sigue al Paso 2.

### Opción B: Abrir desde el Command Palette
1. Presiona `Ctrl+Shift+P` (o `F1`)
2. Escribe: `Database Client`
3. Selecciona: `Database Client: Focus on Database View`

### Opción C: Desde el Explorador
1. Ve al explorador de archivos (ícono de carpeta en la barra lateral)
2. En la parte inferior del panel, busca una sección llamada "DATABASE"

## Paso 2: Si No Ves el Ícono - Verificar que la Extensión Esté Activa

### Verificar Instalación:
1. Presiona `Ctrl+Shift+X` (abre extensiones)
2. Busca: `Database Client`
3. Deberías ver: **Database Client** by Weijan Chen (cweijan)
4. Asegúrate que diga "Installed" y no tenga un botón de "Reload Required"

### Si dice "Reload Required":
1. Haz clic en el botón "Reload Required"
2. O presiona `Ctrl+Shift+P` → "Developer: Reload Window"

## Paso 3: Abrir la Vista de Database Client

Una vez que encuentres el ícono o uses el Command Palette:

1. **Verás un panel con el título "DATABASE"**
2. Dentro del panel, busca:
   - Un botón "+" para agregar conexiones
   - Una lista de conexiones (si ya tienes alguna)
   - La conexión **"Stability - Supabase"** debería aparecer aquí

## Paso 4: Si Aún No Ves la Conexión

Si el panel de DATABASE está vacío o no ves "Stability - Supabase":

### Solución 1: Recargar la Ventana
```
Ctrl+Shift+P → "Developer: Reload Window"
```

### Solución 2: Agregar Manualmente
1. En el panel DATABASE, haz clic en el botón "+" (Add Connection)
2. Selecciona "PostgreSQL"
3. Usa estos datos:
   - **Host:** db.hcvytsitbsandaphsxyn.supabase.co
   - **Port:** 5432
   - **Username:** postgres
   - **Password:** Peladoysalta
   - **Database:** postgres
   - **Name:** Stability - Supabase
   - **SSL:** ✅ Enabled (MUY IMPORTANTE)

### Solución 3: Usar Connection String
1. En el panel DATABASE, haz clic en "+"
2. Selecciona "Connect with URL"
3. Pega esto:
   ```
   postgresql://postgres:Peladoysalta@db.hcvytsitbsandaphsxyn.supabase.co:5432/postgres?sslmode=require
   ```
4. Dale el nombre: "Stability - Supabase"

## 🎯 Qué Deberías Ver Cuando Encuentres la Conexión

```
DATABASE
├── 📁 Stability - Supabase (PostgreSQL)
    ├── 📁 public
    │   ├── 📋 profiles (4)
    │   ├── 📋 student_profiles (2)
    │   └── 📋 exercise_categories (5)
    ├── 📁 auth
    └── 📁 otros esquemas...
```

## 🆘 Troubleshooting Rápido

### El panel DATABASE no aparece:
- Presiona `Ctrl+Shift+P` → "Database Client: Focus on Database View"

### La extensión no está instalada:
- Presiona `Ctrl+Shift+X` → busca "Database Client" → Install

### La conexión no aparece después de recargar:
- Usa la "Solución 2" o "Solución 3" de arriba para agregar manualmente

### Error de conexión:
- Verifica que SSL esté habilitado
- Verifica que la contraseña sea correcta: `Peladoysalta`

## 📸 Referencia Visual

El ícono de Database Client en la barra lateral se ve similar a:
- SQLite Explorer (pero es diferente)
- Un cilindro de base de datos
- Puede tener el texto "DB" o "DATABASE"

**Ubicación típica:** Entre el ícono de Git y el de Extensiones en la barra lateral izquierda.

---

**¿Necesitas ayuda adicional?** Dime exactamente qué ves en tu VS Code y te guío desde ahí.
