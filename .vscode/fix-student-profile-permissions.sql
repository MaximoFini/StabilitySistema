-- Script para corregir permisos de la tabla student_profiles
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Verificar la estructura de la tabla student_profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'student_profiles'
ORDER BY ordinal_position;

-- 2. Habilitar RLS si no está habilitado
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "Users can insert their own student profile" ON student_profiles;
DROP POLICY IF EXISTS "Users can view their own student profile" ON student_profiles;
DROP POLICY IF EXISTS "Users can update their own student profile" ON student_profiles;

-- 4. Crear política para permitir INSERT (usuarios pueden crear su propio perfil)
CREATE POLICY "Users can insert their own student profile"
ON student_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 5. Crear política para permitir SELECT (usuarios pueden ver su propio perfil)
CREATE POLICY "Users can view their own student profile"
ON student_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 6. Crear política para permitir UPDATE (usuarios pueden actualizar su propio perfil)
CREATE POLICY "Users can update their own student profile"
ON student_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 7. Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'student_profiles';
