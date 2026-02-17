# Script para abrir Database Client en VS Code
Write-Host "🔍 Intentando abrir Database Client..." -ForegroundColor Cyan

# Método 1: Verificar que la extensión esté instalada
Write-Host "`n📦 Verificando instalación de Database Client..." -ForegroundColor Yellow
$extensions = code --list-extensions
if ($extensions -match "cweijan.vscode-database-client2") {
    Write-Host "✅ Database Client está instalado" -ForegroundColor Green
}
else {
    Write-Host "❌ Database Client NO está instalado" -ForegroundColor Red
    Write-Host "Instalando..." -ForegroundColor Yellow
    code --install-extension cweijan.vscode-database-client2
}

Write-Host "`n📋 INSTRUCCIONES PARA ENCONTRAR DATABASE CLIENT:" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n1️⃣  OPCIÓN MÁS FÁCIL - Usar Command Palette:" -ForegroundColor Yellow
Write-Host "   • Presiona: Ctrl+Shift+P" -ForegroundColor White
Write-Host "   • Escribe: 'Database Client'" -ForegroundColor White
Write-Host "   • Selecciona: 'Database Client: Focus on Database View'" -ForegroundColor White

Write-Host "`n2️⃣  OPCIÓN ALTERNATIVA - Buscar el ícono:" -ForegroundColor Yellow
Write-Host "   • Mira en la barra lateral IZQUIERDA de VS Code" -ForegroundColor White
Write-Host "   • Busca un ícono que parezca una base de datos 🗄️" -ForegroundColor White
Write-Host "   • Puede estar entre Git y Extensiones" -ForegroundColor White

Write-Host "`n3️⃣  SI NO VES EL ÍCONO:" -ForegroundColor Yellow
Write-Host "   • Haz clic derecho en la barra lateral" -ForegroundColor White
Write-Host "   • Busca 'Database Client' en el menú" -ForegroundColor White
Write-Host "   • Márcalo para que aparezca" -ForegroundColor White

Write-Host "`n4️⃣  AGREGAR CONEXIÓN MANUALMENTE:" -ForegroundColor Yellow
Write-Host "   Una vez en el panel DATABASE:" -ForegroundColor White
Write-Host "   • Haz clic en el botón '+' (Add Connection)" -ForegroundColor White
Write-Host "   • Selecciona 'PostgreSQL'" -ForegroundColor White
Write-Host "   • Usa estos datos:" -ForegroundColor White
Write-Host "     - Host: db.hcvytsitbsandaphsxyn.supabase.co" -ForegroundColor Cyan
Write-Host "     - Port: 5432" -ForegroundColor Cyan
Write-Host "     - Username: postgres" -ForegroundColor Cyan
Write-Host "     - Password: Peladoysalta" -ForegroundColor Cyan
Write-Host "     - Database: postgres" -ForegroundColor Cyan
Write-Host "     - SSL: ✅ ENABLED (IMPORTANTE)" -ForegroundColor Red

Write-Host "`n5️⃣  O USA LA CONNECTION STRING:" -ForegroundColor Yellow
Write-Host "   postgresql://postgres:Peladoysalta@db.hcvytsitbsandaphsxyn.supabase.co:5432/postgres?sslmode=require" -ForegroundColor Cyan

Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "💡 TIP: Si nada funciona, recarga VS Code:" -ForegroundColor Yellow
Write-Host "   Ctrl+Shift+P → 'Developer: Reload Window'" -ForegroundColor White
Write-Host "`n"

# Intentar abrir VS Code en el proyecto
Write-Host "🚀 Abriendo VS Code en el proyecto..." -ForegroundColor Green
code .
