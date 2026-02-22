# Script para corregir permisos de student_profiles en Supabase
# Este script te ayudará a solucionar problemas de permisos RLS

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   CORREGIR PERMISOS DE STUDENT_PROFILES         " -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "El problema más común cuando el registro se queda en 'Completando...'" -ForegroundColor Yellow
Write-Host "es que faltan permisos RLS (Row Level Security) en la tabla student_profiles." -ForegroundColor Yellow
Write-Host ""

Write-Host "SOLUCIÓN:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Ve al dashboard de Supabase:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/hcvytsitbsandaphsxyn" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. En el menú lateral, ve a:" -ForegroundColor White
Write-Host "   SQL Editor > + New Query" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Copia y pega el contenido del archivo:" -ForegroundColor White
Write-Host "   .vscode\fix-student-profile-permissions.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Haz clic en 'Run' para ejecutar el script" -ForegroundColor White
Write-Host ""
Write-Host "5. Verifica que no haya errores en la salida" -ForegroundColor White
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   VERIFICACIÓN ADICIONAL                        " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "También verifica que el bucket 'profile-images' existe:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a Storage en el dashboard de Supabase" -ForegroundColor White
Write-Host "2. Si 'profile-images' no existe, créalo:" -ForegroundColor White
Write-Host "   - Haz clic en 'New bucket'" -ForegroundColor Cyan
Write-Host "   - Nombre: profile-images" -ForegroundColor Cyan
Write-Host "   - Public: Yes" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Configura las políticas del bucket:" -ForegroundColor White
Write-Host "   - Policies > New Policy" -ForegroundColor Cyan
Write-Host "   - Permite INSERT/UPDATE para usuarios autenticados" -ForegroundColor Cyan
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "¿Deseas abrir el SQL Editor en el navegador? (S/N)"

if ($response -eq "S" -or $response -eq "s") {
    Start-Process "https://supabase.com/dashboard/project/hcvytsitbsandaphsxyn/editor/sql"
    Write-Host ""
    Write-Host "✅ Abriendo SQL Editor en el navegador..." -ForegroundColor Green
    Write-Host ""
    Write-Host "No olvides copiar el contenido de fix-student-profile-permissions.sql" -ForegroundColor Yellow
    
    # Abrir el archivo SQL en VS Code
    $sqlFile = Join-Path $PSScriptRoot "fix-student-profile-permissions.sql"
    if (Test-Path $sqlFile) {
        code $sqlFile
        Write-Host "✅ Archivo SQL abierto en VS Code para copiar" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Después de ejecutar el script SQL, prueba registrarte nuevamente." -ForegroundColor Green
Write-Host ""
