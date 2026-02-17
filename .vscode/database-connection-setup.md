# Configuración de Database Client para Supabase

## Información de Conexión

He configurado la conexión a tu base de datos de Supabase "Stability" con los siguientes detalles:

- **Host:** db.hcvytsitbsandaphsxyn.supabase.co
- **Puerto:** 5432
- **Usuario:** postgres
- **Base de datos:** postgres
- **Contraseña:** Peladoysalta

## Tablas Disponibles

Tu base de datos actualmente contiene:
1. **profiles** - 4 registros (perfiles de usuarios)
2. **student_profiles** - 2 registros (perfiles de estudiantes)
3. **exercise_categories** - 5 registros (categorías de ejercicios)

## Pasos para Conectar en Database Client

### Opción 1: Usando la configuración automática (Recomendado)

1. Abre la extensión **Database Client** en VS Code
2. Haz clic en el ícono de "+" para agregar una nueva conexión
3. Selecciona **PostgreSQL**
4. Ingresa los siguientes datos:
   - **Connection Name:** Stability - Supabase
   - **Host:** db.hcvytsitbsandaphsxyn.supabase.co
   - **Port:** 5432
   - **Username:** postgres
   - **Password:** Peladoysalta
   - **Database:** postgres
   - **SSL:** Enabled (importante para Supabase)
5. Haz clic en **Connect**

### Opción 2: Usando la URL de conexión directa

1. Abre Database Client
2. Selecciona "Connect with URL"
3. Pega esta URL:
   ```
   postgresql://postgres:Peladoysalta@db.hcvytsitbsandaphsxyn.supabase.co:5432/postgres?sslmode=require
   ```
4. Dale un nombre a la conexión: **Stability - Supabase**
5. Haz clic en **Connect**

## Verificación

Una vez conectado, deberías poder ver:
- El esquema `public` con las 3 tablas mencionadas
- El esquema `auth` (de Supabase)
- Otros esquemas del sistema

## Notas Importantes

- ⚠️ **SSL es requerido** para conexiones a Supabase
- 🔒 La contraseña está guardada en este archivo, considera eliminarlo después de configurar la conexión
- 📊 Puedes ejecutar queries SQL directamente desde Database Client
- 🔄 La conexión se guardará en tu configuración de VS Code para uso futuro
