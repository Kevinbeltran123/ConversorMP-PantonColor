# ConversorMP - Sistema Graniplast

Sistema de gestión de fórmulas de pinturas Graniplast con versionamiento, escalado y trazabilidad.

## Stack Tecnológico

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Formularios**: React Hook Form + Zod
- **Testing**: Vitest
- **Deploy**: Vercel + Supabase

## Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` y configura:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Configurar Base de Datos

Ejecuta las migraciones SQL en el SQL Editor de Supabase en este orden:

1. `supabase/migrations/20260126_initial_schema.sql` - Tablas e índices
2. `supabase/migrations/20260126_rls_policies.sql` - Row Level Security
3. `supabase/migrations/20260126_triggers_functions.sql` - Triggers y funciones
4. `supabase/migrations/20260126_seeds.sql` - Datos iniciales
5. `supabase/migrations/20260126_change_to_decimals.sql` - Precisión decimal
6. `supabase/migrations/20260127_add_image_to_colors.sql` - Soporte de imágenes

### 4. Crear usuario admin

1. En Supabase Dashboard, ve a **Authentication > Users**
2. Crea un usuario con email y contraseña
3. El trigger automático le asignará rol `admin` al primer usuario

### 5. Iniciar aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Comandos

```bash
npm run dev       # Desarrollo
npm run build     # Build de producción
npm run test      # Tests
npm run lint      # Linting
```

## Estructura del Proyecto (Clean Architecture)

```
/app                        # Next.js App Router (Presentation)
  /(auth)                   # Páginas de autenticación
  /(dashboard)              # Páginas protegidas
/domain                     # Entidades y tipos
/application                # Casos de uso (DTOs + actions)
/infrastructure             # Supabase client/server
/components                 # Componentes React
/lib                        # Utilidades y validaciones
/supabase                   # Migraciones SQL
```

## Reglas de Negocio

### Medidas
- Todas las cantidades se almacenan en **gramos** internamente
- Precisión: hasta 2 decimales (DECIMAL(10,2))
- UI acepta entrada en g o kg, convierte a g en backend
- Escalado: `factor = target_total_g / base_total_g`

### Fórmulas y Versiones
- Cada color puede tener múltiples versiones
- Múltiples versiones pueden estar "activas" simultáneamente
- Editar fórmula = crear nueva versión (historial preservado)
- Todos los ingredientes escalan proporcionalmente

### Roles y Permisos
- **Admin**: CRUD completo en colores, fórmulas, ingredientes. Gestión de roles
- **Operator**: Solo lectura de fórmulas. Puede crear/leer lotes

## Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `products` | Productos (Graniplast, etc.) |
| `colors` | Colores registrados |
| `ingredients` | Catálogo de ingredientes |
| `formulas` | Fórmulas versionadas |
| `formula_items` | Ingredientes de cada fórmula |
| `batches` | Lotes producidos |
| `batch_items` | Snapshot de ingredientes escalados |
| `user_roles` | Roles de usuarios |
| `audit_logs` | Auditoría de cambios |

### Relaciones

```
products → colors → formulas → formula_items ← ingredients
                        ↓
                    batches → batch_items
```

### Funciones SQL Helper

```sql
SELECT public.get_user_role();   -- Rol del usuario actual
SELECT public.is_admin();        -- Verificar si es admin
SELECT public.is_operator();     -- Verificar si es operator
```

## Despliegue a Producción

### Vercel (Frontend)

1. Conecta tu repositorio a Vercel
2. Configura variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático en cada push a `main`

### Supabase (Base de Datos)

1. Crea proyecto en [supabase.com](https://supabase.com)
2. Ejecuta las migraciones en SQL Editor
3. Configura CORS con tu dominio de Vercel

### Dominio Personalizado (Opcional)

1. Compra dominio en Namecheap/Google Domains
2. En Vercel: Settings → Domains → Add Domain
3. Configura registros DNS según indicaciones de Vercel

## Backup y Recuperación

### Backup con pg_dump

```bash
export DB_HOST="db.xxxxx.supabase.co"
export PGPASSWORD="tu_password"
pg_dump -Fc -h $DB_HOST -U postgres -d postgres > backup_$(date +%Y%m%d).dump
```

### Recuperar backup

```bash
pg_restore -v -h $DB_HOST -U postgres -d postgres -c backup.dump
```

### Export CSV desde UI

- **Fórmulas**: Dashboard → Fórmulas → Exportar CSV
- **Lotes**: Dashboard → Lotes → Exportar CSV

### Estrategia Recomendada (3-2-1)

- 3 copias de datos (producción + 2 backups)
- 2 tipos de medios (local + nube)
- 1 copia offsite (Google Drive / S3)

| Frecuencia | Método | Retención |
|------------|--------|-----------|
| Diario | pg_dump | 7 días |
| Semanal | CSV Export | 90 días |
| Mensual | pg_dump completo | 12 meses |

## Troubleshooting

### "permission denied for table X"
- Verificar que se ejecutó `20260126_rls_policies.sql`
- Verificar que el usuario tiene rol en `user_roles`

### "function does not exist"
- Ejecutar `20260126_triggers_functions.sql`

### Usuario sin rol admin
```sql
-- Obtener user_id
SELECT id, email FROM auth.users;

-- Asignar rol manualmente
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES ('user_id_aqui', 'admin', 'user_id_aqui');
```

### Resetear base de datos
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
-- Ejecutar migraciones de nuevo
```

## Convenciones de Código

### Commits
Prefijos: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

### Naming
- **Archivos**: kebab-case (`color-form.tsx`)
- **Componentes**: PascalCase (`ColorForm`)
- **Funciones**: camelCase (`calculateScale`)
- **Constantes**: UPPER_SNAKE_CASE (`DEFAULT_ROUNDING`)

## Seguridad

- RLS habilitado en todas las tablas
- Validación con Zod en frontend y backend
- HTTPS automático en Vercel
- Variables sensibles nunca en código público
- Audit logs para trazabilidad

## Licencia

Proyecto privado - Todos los derechos reservados
