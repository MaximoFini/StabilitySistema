# ✅ Conexión a Supabase Configurada

## Estado: COMPLETADO

La conexión a tu base de datos de Supabase "Stability" ha sido configurada exitosamente en Database Client.

## 📋 Resumen de la Configuración

### Información de Conexión
- **Nombre:** Stability - Supabase
- **Host:** db.hcvytsitbsandaphsxyn.supabase.co
- **Puerto:** 5432
- **Usuario:** postgres
- **Base de datos:** postgres
- **SSL:** Habilitado (requerido por Supabase)

### 📊 Tablas Disponibles
Tu base de datos contiene las siguientes tablas en el esquema `public`:

1. **profiles** - 4 registros
   - Tabla principal de perfiles de usuarios
   - Campos: id, email, first_name, last_name, role, profile_image, created_at, updated_at
   - RLS habilitado

2. **student_profiles** - 2 registros
   - Perfiles extendidos para estudiantes
   - Campos: id, phone, instagram, birth_date, gender, height_cm, weight_kg, bmi, activity_level, primary_goal, training_experience, sports, previous_injuries, medical_conditions
   - RLS habilitado

3. **exercise_categories** - 5 registros
   - Categorías de ejercicios
   - Campos: id, name, description, color, icon, created_at, updated_at
   - RLS habilitado

## 🚀 Cómo Usar Database Client

### Paso 1: Abrir Database Client
1. En VS Code, busca el ícono de **Database Client** en la barra lateral izquierda (parece un cilindro de base de datos)
2. Haz clic en él para abrir el panel

### Paso 2: Conectar a la Base de Datos
1. En el panel de Database Client, deberías ver la conexión **"Stability - Supabase"**
2. Haz clic en ella para expandir y conectarte
3. Verás los esquemas disponibles: `public`, `auth`, etc.

### Paso 3: Explorar las Tablas
1. Expande el esquema `public`
2. Verás las 3 tablas listadas arriba
3. Haz clic derecho en cualquier tabla para:
   - Ver datos (View Data)
   - Ver estructura (View Table)
   - Ejecutar queries personalizados
   - Exportar datos

### Paso 4: Ejecutar Queries SQL
1. Haz clic derecho en la conexión "Stability - Supabase"
2. Selecciona "New Query"
3. Escribe tu query SQL
4. Presiona `Ctrl+Enter` o haz clic en el botón de ejecutar

## 📝 Ejemplos de Queries Útiles

```sql
-- Ver todos los perfiles
SELECT * FROM profiles;

-- Ver perfiles de estudiantes con su información básica
SELECT 
  p.first_name, 
  p.last_name, 
  p.email,
  sp.phone,
  sp.instagram,
  sp.gender,
  sp.bmi
FROM profiles p
JOIN student_profiles sp ON p.id = sp.id
WHERE p.role = 'student';

-- Ver todas las categorías de ejercicios
SELECT * FROM exercise_categories;

-- Contar usuarios por rol
SELECT role, COUNT(*) as total
FROM profiles
GROUP BY role;
```

## 🔧 Solución de Problemas

### Si no ves la conexión:
1. Recarga VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Verifica que Database Client esté instalado: `Ctrl+Shift+X` → busca "Database Client"

### Si la conexión falla:
1. Verifica que SSL esté habilitado en la configuración
2. Asegúrate de que tu proyecto de Supabase esté activo (no pausado)
3. Verifica que la contraseña sea correcta

### Para reconectar:
1. Haz clic derecho en la conexión
2. Selecciona "Refresh" o "Reconnect"

## 🔐 Seguridad

⚠️ **IMPORTANTE:** 
- La contraseña está guardada en la configuración de VS Code
- Considera cambiar la contraseña de la base de datos si este archivo se comparte
- No subas archivos con contraseñas a repositorios públicos

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Database Client Extension](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-database-client2)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Configurado el:** 2026-02-16
**Proyecto:** Stability Sistema
**Base de datos:** Supabase PostgreSQL
