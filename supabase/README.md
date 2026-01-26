# Migraciones de Base de Datos - Supabase

## Orden de Ejecución

Ejecuta las migraciones en este **orden exacto** en el SQL Editor de Supabase:

### 1. Esquema Inicial
```sql
-- Ejecutar: migrations/20260126_initial_schema.sql
```
Crea todas las tablas, relaciones e índices.

### 2. Políticas RLS
```sql
-- Ejecutar: migrations/20260126_rls_policies.sql
```
Configura Row Level Security y políticas de acceso por rol.

### 3. Triggers y Funciones
```sql
-- Ejecutar: migrations/20260126_triggers_functions.sql
```
Crea triggers para auditoría, updated_at y rol admin automático.

### 4. Seeds (Datos Iniciales)
```sql
-- Ejecutar: migrations/20260126_seeds.sql
```
Inserta producto Graniplast, ingredientes y color de prueba.

## Instrucciones Paso a Paso

### 1. Acceder a Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Navega a **SQL Editor** en el menú lateral

### 2. Ejecutar Migraciones

Para cada archivo de migración:

1. Abre el archivo en tu editor
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (Ejecutar)
5. Verifica que no haya errores en la salida

**Importante**: Ejecutar en el orden listado arriba.

### 3. Verificar Instalación

Ejecuta este query para verificar que todo se creó correctamente:

```sql
-- Verificar tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verificar ingredientes
SELECT name FROM public.ingredients ORDER BY name;

-- Verificar producto Graniplast
SELECT * FROM public.products;
```

Deberías ver:
- 9 tablas en `public` schema
- RLS habilitado (`rowsecurity = true`) en todas
- 13 ingredientes
- 1 producto (Graniplast)
- 1 color de prueba (Azul Cielo) - opcional

### 4. Crear Primer Usuario

1. En Supabase, ve a **Authentication > Users**
2. Haz clic en **Add user**
3. Crea un usuario con email y contraseña
4. El trigger automático le asignará rol `admin`

Verifica:
```sql
SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id;
```

## Estructura de Tablas

### Tablas Principales

- `user_roles` - Roles de usuarios (admin, operator)
- `products` - Productos (Graniplast, Vinilo, etc.)
- `colors` - Colores registrados
- `ingredients` - Catálogo de ingredientes
- `formulas` - Fórmulas versionadas
- `formula_items` - Ingredientes de cada fórmula
- `batches` - Lotes producidos
- `batch_items` - Snapshot de ingredientes escalados
- `audit_logs` - Auditoría de cambios

### Relaciones Clave

```
products → colors → formulas → formula_items ← ingredients
                         ↓
                     batches → batch_items
```

## Roles y Permisos

### Admin
- **CRUD completo** en: products, colors, ingredients, formulas, formula_items
- **CRUD completo** en: batches, batch_items
- **Gestión de roles**: puede asignar/modificar roles de usuarios
- **Lectura de audit logs**

### Operator
- **Solo lectura** en: products, colors, ingredients, formulas, formula_items
- **Crear y leer** en: batches, batch_items (para guardar lotes calculados)
- **Lectura de audit logs**

## Funciones Útiles

### Helpers de Roles
```sql
-- Obtener rol del usuario actual
SELECT public.get_user_role();

-- Verificar si es admin
SELECT public.is_admin();

-- Verificar si es operator
SELECT public.is_operator();

-- Verificar si tiene algún rol
SELECT public.has_role();
```

### Fórmulas
```sql
-- Obtener siguiente versión para un color
SELECT public.get_next_formula_version('color_id_aqui');
```

## Troubleshooting

### Error: "permission denied for table X"
- Verifica que ejecutaste `20260126_rls_policies.sql`
- Verifica que el usuario tiene rol asignado en `user_roles`

### Error: "function does not exist"
- Ejecuta `20260126_triggers_functions.sql`
- Verifica que usas el schema correcto: `public.function_name()`

### Usuario sin rol admin
```sql
-- Asignar rol admin manualmente
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES ('user_id_aqui', 'admin', 'user_id_aqui');
```

### Resetear base de datos
```sql
-- CUIDADO: Esto borra TODOS los datos
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Luego ejecutar las migraciones de nuevo
```

## Backups

### Backup Manual
1. En Supabase Dashboard, ve a **Database > Backups**
2. Haz clic en **Create backup**

### Export CSV (para datos)
```sql
-- Export ingredientes
COPY (SELECT * FROM public.ingredients) TO STDOUT WITH CSV HEADER;

-- Export fórmulas
COPY (SELECT * FROM public.formulas) TO STDOUT WITH CSV HEADER;
```

## Próximos Pasos

Con la BD configurada, puedes proceder al **Sprint 2**:
- Implementar CRUD de colores en UI
- Crear formulario de fórmulas con ingredientes dinámicos
- Integrar con Supabase client desde Next.js

## Documentación Adicional

- [DATABASE_DESIGN.md](DATABASE_DESIGN.md) - Decisiones de arquitectura detalladas
- [Supabase Docs - Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/trigger-definition.html)
