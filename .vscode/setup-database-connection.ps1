# Script para configurar Database Client con Supabase
# Este script agrega la configuración de conexión a tu settings.json de VS Code

$settingsPath = "$env:APPDATA\Code\User\settings.json"

# Leer el archivo de configuración actual
if (Test-Path $settingsPath) {
    $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
} else {
    $settings = @{}
}

# Configuración de la conexión a Supabase
$connection = @{
    host = "db.hcvytsitbsandaphsxyn.supabase.co"
    port = 5432
    user = "postgres"
    password = "Peladoysalta"
    database = "postgres"
    dbType = "PostgreSQL"
    name = "Stability - Supabase"
    global = $false
    timezone = "+00:00"
    encrypt = $true
    ssh = $null
    esModule = $false
    usingSSH = $false
    connectionUrl = "postgresql://postgres:Peladoysalta@db.hcvytsitbsandaphsxyn.supabase.co:5432/postgres?sslmode=require"
}

# Agregar o actualizar la configuración de database.connections
if (-not $settings.'database.connections') {
    $settings | Add-Member -MemberType NoteProperty -Name 'database.connections' -Value @()
}

# Verificar si la conexión ya existe
$existingConnection = $settings.'database.connections' | Where-Object { $_.name -eq "Stability - Supabase" }

if ($existingConnection) {
    Write-Host "La conexión 'Stability - Supabase' ya existe. Actualizando..." -ForegroundColor Yellow
    $index = $settings.'database.connections'.IndexOf($existingConnection)
    $settings.'database.connections'[$index] = $connection
} else {
    Write-Host "Agregando nueva conexión 'Stability - Supabase'..." -ForegroundColor Green
    $settings.'database.connections' += $connection
}

# Guardar la configuración actualizada
$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath

Write-Host "`n✅ Conexión configurada exitosamente!" -ForegroundColor Green
Write-Host "`nPasos siguientes:" -ForegroundColor Cyan
Write-Host "1. Abre VS Code (o recarga la ventana con Ctrl+Shift+P > 'Reload Window')" -ForegroundColor White
Write-Host "2. Haz clic en el ícono de Database Client en la barra lateral" -ForegroundColor White
Write-Host "3. Deberías ver la conexión 'Stability - Supabase'" -ForegroundColor White
Write-Host "4. Haz clic en ella para conectarte y ver tus tablas" -ForegroundColor White
Write-Host "`nTablas disponibles:" -ForegroundColor Cyan
Write-Host "  - profiles (4 registros)" -ForegroundColor White
Write-Host "  - student_profiles (2 registros)" -ForegroundColor White
Write-Host "  - exercise_categories (5 registros)" -ForegroundColor White
