# Script de verificación rápida antes de probar el registro

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VERIFICACIÓN RÁPIDA DE SUPABASE     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script te ayudará a verificar que todo esté configurado" -ForegroundColor Yellow
Write-Host "ANTES de intentar registrarte nuevamente." -ForegroundColor Yellow
Write-Host ""

Write-Host "CHECKLIST:" -ForegroundColor Green
Write-Host ""

Write-Host "[ ] 1. Bucket 'profile-images' existe y es público" -ForegroundColor White
Write-Host "[ ] 2. Tabla 'student_profiles' existe" -ForegroundColor White
Write-Host "[ ] 3. RLS está habilitado en 'student_profiles'" -ForegroundColor White
Write-Host "[ ] 4. Políticas de RLS están configuradas" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "OPCIÓN 1: Verificar automáticamente con SQL" -ForegroundColor Yellow
Write-Host "(Recomendado)" -ForegroundColor Green
Write-Host ""
Write-Host "Ejecuta el script check-supabase-setup.sql en el SQL Editor" -ForegroundColor White
Write-Host ""

$openSQL = Read-Host "¿Abrir SQL Editor ahora? (S/N)"

if ($openSQL -eq "S" -or $openSQL -eq "s") {
    Start-Process "https://supabase.com/dashboard/project/hcvytsitbsandaphsxyn/editor/sql"
    
    $sqlFile = Join-Path $PSScriptRoot "check-supabase-setup.sql"
    if (Test-Path $sqlFile) {
        code $sqlFile
        Write-Host ""
        Write-Host "✅ SQL Editor abierto en navegador" -ForegroundColor Green
        Write-Host "✅ Archivo check-supabase-setup.sql abierto en VS Code" -ForegroundColor Green
        Write-Host ""
        Write-Host "Copia el contenido y ejecútalo en el SQL Editor" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "OPCIÓN 2: Verificación manual" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Ve a Storage en Supabase:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/hcvytsitbsandaphsxyn/storage/buckets" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ✅ Si ves 'profile-images' con Public = Yes -> CORRECTO" -ForegroundColor Green
Write-Host "   ❌ Si NO existe -> Créalo:" -ForegroundColor Red
Write-Host "      - Click 'New bucket'" -ForegroundColor White
Write-Host "      - Name: profile-images" -ForegroundColor White
Write-Host "      - Public: YES (importante!)" -ForegroundColor White
Write-Host ""

$openStorage = Read-Host "¿Abrir Storage ahora? (S/N)"

if ($openStorage -eq "S" -or $openStorage -eq "s") {
    Start-Process "https://supabase.com/dashboard/project/hcvytsitbsandaphsxyn/storage/buckets"
    Write-Host ""
    Write-Host "✅ Storage abierto en navegador" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Verifica las políticas de Storage:" -ForegroundColor White
Write-Host ""
Write-Host "   En el bucket profile-images -> Policies" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Debe haber al menos 2 políticas:" -ForegroundColor White
Write-Host "   - Una para INSERT (usuarios autenticados pueden subir)" -ForegroundColor White
Write-Host "   - Una para SELECT (lectura pública)" -ForegroundColor White
Write-Host ""
Write-Host "   Si NO hay políticas, créalas:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   POLÍTICA 1 - INSERT:" -ForegroundColor Cyan
Write-Host "   CREATE POLICY 'Users can upload their profile images'" -ForegroundColor White
Write-Host "   ON storage.objects FOR INSERT TO authenticated" -ForegroundColor White
Write-Host "   WITH CHECK (" -ForegroundColor White
Write-Host "     bucket_id = 'profile-images' AND" -ForegroundColor White
Write-Host "     auth.uid()::text = (storage.foldername(name))[1]" -ForegroundColor White
Write-Host "   );" -ForegroundColor White
Write-Host ""
Write-Host "   POLÍTICA 2 - SELECT:" -ForegroundColor Cyan
Write-Host "   CREATE POLICY 'Public images are accessible'" -ForegroundColor White
Write-Host "   ON storage.objects FOR SELECT TO public" -ForegroundColor White
Write-Host "   USING (bucket_id = 'profile-images');" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Después de verificar todo:" -ForegroundColor White
Write-Host ""
Write-Host "   - Recarga la aplicación (o reinicia el servidor)" -ForegroundColor Yellow
Write-Host "   - Abre la consola del navegador (F12)" -ForegroundColor Yellow
Write-Host "   - Intenta registrarte de nuevo" -ForegroundColor Yellow
Write-Host "   - Revisa los mensajes de consola detallados" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Ahora verás mensajes como:" -ForegroundColor Green
Write-Host "   [completeStudentProfile] 🚀 INICIANDO registro de perfil" -ForegroundColor White
Write-Host "   [uploadProfileImage] Iniciando subida de imagen..." -ForegroundColor White
Write-Host "   [completeStudentProfile] 💾 Insertando en student_profiles..." -ForegroundColor White
Write-Host "   [completeStudentProfile] 🎉 PERFIL COMPLETADO EXITOSAMENTE" -ForegroundColor White
Write-Host ""
Write-Host "   Si hay algún error, ahora lo verás claramente en la consola" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
