# Solución al Error de Registro de Estudiantes

## Problema

Al registrar un usuario estudiante, se queda en "Completando..." infinitamente y no:

- Redirige a `/entrenamiento`
- Crea el registro en la tabla `student_profiles`

## Causa Principal

El problema más común es la falta de permisos RLS (Row Level Security) en la tabla `student_profiles` de Supabase, o problemas con el bucket de storage `profile-images`.

## Solución

### Paso 1: Ejecutar el Script SQL de Permisos

1. **Ejecuta el script PowerShell para obtener instrucciones:**

   ```powershell
   .\.vscode\fix-student-profile-permissions.ps1
   ```

2. **O manualmente:**
   - Ve a: https://supabase.com/dashboard/project/hcvytsitbsandaphsxyn
   - En el menú lateral: `SQL Editor` > `+ New Query`
   - Copia el contenido de `.vscode\fix-student-profile-permissions.sql`
   - Pega en el editor y haz clic en `Run`

### Paso 2: Verificar el Bucket de Storage

1. Ve a `Storage` en el dashboard de Supabase
2. Verifica que existe el bucket `profile-images`
3. **Si NO existe, créalo:**
   - Nombre: `profile-images`
   - Public: `Yes`

4. **Configura políticas del bucket:**
   - Ve a la pestaña `Policies` del bucket
   - Crea una política para INSERT:
     ```sql
     CREATE POLICY "Users can upload their profile images"
     ON storage.objects
     FOR INSERT
     TO authenticated
     WITH CHECK (
       bucket_id = 'profile-images' AND
       auth.uid()::text = (storage.foldername(name))[1]
     );
     ```
   - Crea una política para SELECT (lectura pública):
     ```sql
     CREATE POLICY "Public images are accessible"
     ON storage.objects
     FOR SELECT
     TO public
     USING (bucket_id = 'profile-images');
     ```

### Paso 3: Prueba el Registro

1. Reinicia el servidor de desarrollo si estaba corriendo
2. Intenta registrar un nuevo estudiante
3. **Verifica la consola del navegador** (F12) para ver mensajes de debug que agregué:
   - "Subiendo imagen de perfil..."
   - "Imagen subida: [URL]"
   - "Insertando datos en student_profiles..."
   - "Perfil de alumno completado exitosamente"

### Paso 4: Si Aún Hay Problemas

Si después de seguir estos pasos el problema persiste, verifica:

1. **Revisa la consola del navegador (F12)** para ver errores específicos
2. **Verifica la estructura de la tabla `student_profiles`:**
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'student_profiles'
   ORDER BY ordinal_position;
   ```
3. **Verifica que todos los campos requeridos están en el INSERT:**
   - id, phone, birth_date, gender, height_cm, weight_kg
   - activity_level, primary_goal, training_experience, sports

## Cambios Realizados en el Código

### 1. authStore.ts

- ✅ Agregado bloque `try-finally` para asegurar que `isLoading` siempre se resetee
- ✅ Agregados console.logs para debugging
- ✅ Mejorado manejo de errores

### 2. StudentProfileSetup.tsx

- ✅ Mejorado manejo de errores con mensajes más específicos
- ✅ Agregado logging detallado de errores
- ✅ Validación mejorada de datos antes de enviar

## Notas Importantes

- **ESTOS CAMBIOS NO AFECTAN FUNCIONALIDAD EXISTENTE** - Solo mejoran el manejo de errores y debugging
- Los scripts SQL son seguros y solo agregan/actualizan permisos necesarios
- Si no quieres subir imagen de perfil, déjala en blanco - el código maneja esto correctamente

## Soporte Adicional

Si sigues experimentando problemas después de estos pasos:

1. Copia el error completo de la consola del navegador (F12)
2. Verifica que las variables de entorno estén correctas en `.env`
3. Verifica la conexión a Supabase con Database Client
