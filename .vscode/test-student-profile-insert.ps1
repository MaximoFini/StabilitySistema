# Script para probar la inserción en student_profiles
# Este script simula lo que hace el código cuando se registra un estudiante

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   PRUEBA DE INSERCIÓN EN STUDENT_PROFILES       " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script te ayudará a probar si la inserción funciona" -ForegroundColor Yellow
Write-Host "mediante una consulta SQL de prueba." -ForegroundColor Yellow
Write-Host ""

Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "Asegúrate de haber ejecutado primero:" -ForegroundColor Red
Write-Host "  fix-student-profile-permissions.sql" -ForegroundColor Red
Write-Host ""

$continue = Read-Host "¿Continuar con la prueba? (S/N)"

if ($continue -ne "S" -and $continue -ne "s") {
    Write-Host "Prueba cancelada." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Generando SQL de prueba..." -ForegroundColor Green
Write-Host ""

# Generar un UUID de prueba
$testUserId = [System.Guid]::NewGuid().ToString()

$testSQL = @"
-- SQL DE PRUEBA PARA INSERCIÓN EN student_profiles
-- Este SQL simula la inserción que hace el código del registro

-- Nota: Este usuario NO existe en auth.users, por lo que la política RLS
-- probablemente bloqueará la inserción. Esto es ESPERADO.
-- Lo importante es ver QUÉ ERROR aparece.

-- Intenta insertar datos de prueba
INSERT INTO student_profiles (
    id,
    phone,
    instagram,
    profile_image_url,
    birth_date,
    gender,
    height_cm,
    weight_kg,
    activity_level,
    primary_goal,
    training_experience,
    sports,
    previous_injuries,
    medical_conditions
) VALUES (
    '$testUserId', -- ID de prueba (no existe en auth)
    '+1234567890',
    'test_user',
    NULL,
    '2000-01-01',
    'male',
    175,
    70,
    'moderate',
    'health',
    'beginner',
    'Natación, Gimnasio',
    NULL,
    NULL
);

-- RESULTADO ESPERADO:
-- ❌ Error de política RLS: "new row violates row-level security policy"
--    Esto es CORRECTO - significa que RLS está funcionando
--    El error ocurre porque el ID de prueba no pertenece a un usuario autenticado
--
-- ✅ Si NO hay error de RLS pero hay otro error (ej: columna faltante, tipo incorrecto),
--    ese es el problema que hay que corregir
--
-- ✅ Si la inserción tiene ÉXITO, significa que RLS NO está funcionando correctamente
--    y CUALQUIERA puede insertar datos (problema de seguridad)
"@

# Guardar el SQL en un archivo temporal
$testSQLFile = Join-Path $PSScriptRoot "test-student-profile-insert.sql"
$testSQL | Out-File -FilePath $testSQLFile -Encoding UTF8

Write-Host "SQL de prueba generado en:" -ForegroundColor Green
Write-Host "  $testSQLFile" -ForegroundColor Cyan
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   CÓMO INTERPRETAR LOS RESULTADOS               " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ RESULTADO ESPERADO (CORRECTO):" -ForegroundColor Green
Write-Host "   Error: 'new row violates row-level security policy'" -ForegroundColor White
Write-Host "   Esto significa que RLS está funcionando correctamente" -ForegroundColor White
Write-Host ""

Write-Host "❌ RESULTADO PROBLEMÁTICO:" -ForegroundColor Red
Write-Host "   - Error de columna faltante o tipo incorrecto" -ForegroundColor White
Write-Host "   - Error de constraint violation" -ForegroundColor White
Write-Host "   - La inserción tiene ÉXITO (significa que RLS no funciona)" -ForegroundColor White
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$openSQL = Read-Host "¿Abrir el SQL Editor para ejecutar la prueba? (S/N)"

if ($openSQL -eq "S" -or $openSQL -eq "s") {
    Start-Process "https://supabase.com/dashboard/project/hcvytsitbsandaphsxyn/editor/sql"
    code $testSQLFile
    Write-Host ""
    Write-Host "✅ SQL Editor abierto en el navegador" -ForegroundColor Green
    Write-Host "✅ Archivo de prueba abierto en VS Code" -ForegroundColor Green
    Write-Host ""
    Write-Host "Copia el contenido del archivo y pégalo en el SQL Editor" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Después de ejecutar la prueba, revisa el resultado y:" -ForegroundColor Cyan
Write-Host "- Si el error es de RLS, ¡todo está bien configurado! ✅" -ForegroundColor Green
Write-Host "- Si hay otro error, copia el mensaje completo para revisarlo" -ForegroundColor Yellow
Write-Host ""
