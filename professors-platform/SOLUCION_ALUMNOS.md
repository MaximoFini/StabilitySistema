# 🔧 Solución: Visualización de Alumnos en /alumnos

## 📋 Problema
Los coaches no pueden ver la lista de alumnos en `/alumnos` debido a políticas RLS (Row Level Security) faltantes en Supabase.

## ✅ Solución

### Paso 1: Ejecutar el script SQL en Supabase

1. **Abre el proyecto en Supabase**:
   - Ve a [https://app.supabase.com](https://app.supabase.com)
   - Selecciona tu proyecto `professors-platform`

2. **Abre el SQL Editor**:
   - En el menú lateral izquierdo, haz clic en **SQL Editor**
   - Click en **New Query**

3. **Copia y pega el contenido** del archivo `PROFILES_RLS_POLICIES.sql`

4. **Ejecuta el script**:
   - Haz clic en el botón **Run** (o presiona Ctrl+Enter)
   - Deberías ver un mensaje de éxito

### Paso 2: Verificar

1. Recarga la aplicación en el navegador (Ctrl+R)
2. Ve a `/alumnos`
3. Abre la consola del navegador (F12) para ver los logs de debug:
   - `🟢 useStudents: Loading students for professor: [id]`
   - `📊 Profiles query result: { count: X, ... }`
   - `✅ Final transformed students: [...]`

4. Los alumnos registrados deberían aparecer ahora en la lista

## 🔍 Logs de Debug

El hook ahora incluye logs detallados en la consola:

- 🔴 = Error o problema
- 🟢 = Proceso iniciado correctamente
- 📊 = Resultado de query de profiles
- 📋 = Resultado de query de student_profiles
- ✅ = Datos finales transformados
- ❌ = Error durante el proceso

## 📝 ¿Qué hace el script SQL?

El script `PROFILES_RLS_POLICIES.sql` crea las siguientes políticas:

### Para tabla `profiles`:
- **"Users can view their own profile"**: Todos pueden ver su propio perfil
- **"Coaches can view all student profiles"**: Los coaches pueden ver perfiles de estudiantes
- **"Users can update their own profile"**: Cada usuario puede actualizar su propio perfil

### Para tabla `student_profiles`:
- **"Students can view their own profile"**: Estudiantes ven su propio perfil detallado
- **"Coaches can view all student profiles"**: Coaches pueden ver todos los perfiles detallados de estudiantes
- **"Students can update their own profile"**: Estudiantes pueden actualizar su perfil

## ⚠️ Si aún no se ven alumnos

1. **Verifica que existan alumnos en la BD**:
   ```sql
   SELECT id, first_name, last_name, role 
   FROM profiles 
   WHERE role = 'student';
   
   SELECT id, training_experience, primary_goal 
   FROM student_profiles;
   ```

2. **Verifica las políticas**:
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('profiles', 'student_profiles');
   ```

3. **Revisa los logs en la consola** del navegador para identificar el problema exacto

## 🎯 Resultado Esperado

Una vez ejecutado el script, en `/alumnos` deberías ver:
- Cards con foto de perfil (o placeholder)
- Nombre completo del alumno
- Etiqueta con nivel y objetivo (ej: "Intermedio • Salud")
- Botón "Ver Perfil"

---

**Archivo creado**: `PROFILES_RLS_POLICIES.sql`  
**Hook actualizado**: `src/hooks/useStudents.ts` (con logs de debug)  
**Componente actualizado**: `src/features/students/StudentsList.tsx` (muestra errores)
