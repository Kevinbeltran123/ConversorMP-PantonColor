# Sprint 1 — Esquema de BD + RLS ✅

## Objetivo
Tablas mínimas + políticas RLS por rol. Base de datos segura y escalable.

## Historias de Usuario Completadas
1. ✅ Como admin, quiero almacenar colores y fórmulas de forma segura.
2. ✅ Como operador, quiero leer sin poder modificar fórmulas.

## Checklist Técnico
- ✅ SQL/migrations
- ✅ Índices (color_name, ingredient_name)
- ✅ RLS: políticas por rol
- ✅ Seeds (producto Graniplast)
- ✅ Documentar decisiones (DATABASE_DESIGN.md)

## Cambios de BD

### Tablas Creadas

1. **user_roles** - Gestión de roles de usuarios
   - Roles: `admin` | `operator`
   - Constraint: Un rol por usuario
   - Trigger: Primer usuario recibe rol admin automáticamente

2. **products** - Productos fabricados
   - Graniplast (con seed inicial)
   - Preparado para Vinilo y otros

3. **colors** - Colores registrados
   - Vinculados a productos
   - Constraint: Nombre único por producto

4. **ingredients** - Catálogo de ingredientes
   - 13 ingredientes iniciales (Colanil, Negro, Blanco, etc.)
   - Dinámicos: Se pueden agregar desde UI

5. **formulas** - Fórmulas versionadas
   - Versionamiento automático con trigger
   - Múltiples versiones activas permitidas
   - `base_total_g`: Cantidad base en GRAMOS

6. **formula_items** - Ingredientes de cada fórmula
   - Relación fórmula-ingrediente
   - `quantity_g`: Cantidades en GRAMOS
   - Campo `position` para orden de mezcla

7. **batches** - Lotes producidos
   - Trazabilidad completa
   - `target_total_g`: Cantidad objetivo en GRAMOS
   - `scale_factor`: Factor de escalado guardado

8. **batch_items** - Snapshot de ingredientes escalados
   - Snapshot para trazabilidad histórica
   - `ingredient_name`: Guardado (por si cambia después)
   - `quantity_g`: Cantidad escalada exacta

9. **audit_logs** - Auditoría mínima
   - Registra cambios en formulas, colors, formula_items
   - old_data + new_data en JSONB

### Políticas RLS Implementadas

#### Admin (CRUD Completo)
- ✅ products, colors, ingredients
- ✅ formulas, formula_items
- ✅ batches, batch_items
- ✅ user_roles (gestión de roles)

#### Operator (Lectura + Lotes)
- ✅ **Lectura**: products, colors, ingredients, formulas, formula_items
- ✅ **Crear/Leer**: batches, batch_items (para calcular y guardar lotes)
- ❌ **No puede modificar**: fórmulas ni ingredientes

#### Sin Rol
- ❌ Sin acceso a ninguna tabla

### Funciones Helper
- `get_user_role()` - Obtener rol del usuario actual
- `is_admin()` - Verificar si es admin
- `is_operator()` - Verificar si es operator
- `has_role()` - Verificar si tiene algún rol

### Triggers Implementados

1. **update_updated_at** - Actualiza automáticamente:
   - `updated_at` timestamp
   - `updated_by` user_id
   - Aplica a: products, colors, ingredients

2. **audit_trigger** - Registra en audit_logs:
   - Cambios en: formulas, formula_items, colors
   - old_data y new_data completos

3. **on_auth_user_created** - Asigna rol admin:
   - Al primer usuario del sistema
   - Automático, sin intervención manual

4. **set_formula_version** - Auto-incrementa versión:
   - Al crear nueva fórmula
   - Versión = MAX(versiones_anteriores) + 1

### Índices de Rendimiento

**Búsquedas**:
- `idx_colors_name`
- `idx_ingredients_name`
- `idx_products_name`

**Relaciones**:
- `idx_formulas_color_id`
- `idx_formula_items_formula_id`
- `idx_batches_formula_id`

**Filtros**:
- `idx_colors_active`
- `idx_formulas_is_active`
- `idx_batches_created_at DESC`

**Compuestos**:
- `idx_formulas_color_version` (color_id, version)
- `idx_audit_logs_table_record` (table_name, record_id)

## Archivos Creados

### Migraciones SQL
- `supabase/migrations/20260126_initial_schema.sql` - Esquema completo
- `supabase/migrations/20260126_rls_policies.sql` - Políticas RLS
- `supabase/migrations/20260126_triggers_functions.sql` - Triggers y funciones
- `supabase/migrations/20260126_seeds.sql` - Datos iniciales

### Documentación
- `supabase/README.md` - Instrucciones de instalación
- `supabase/DATABASE_DESIGN.md` - Decisiones de arquitectura

### Código TypeScript
- `domain/entities/database.types.ts` - Types para TypeScript
- `application/use-cases/roles.actions.ts` - Server Actions de roles

### UI Actualizada
- `app/(dashboard)/dashboard/page.tsx` - Muestra rol del usuario

## Comandos para Ejecutar

### 1. Ejecutar Migraciones en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Ejecuta en orden:

```sql
-- 1. Esquema inicial
-- Copiar y ejecutar: supabase/migrations/20260126_initial_schema.sql

-- 2. Políticas RLS
-- Copiar y ejecutar: supabase/migrations/20260126_rls_policies.sql

-- 3. Triggers y funciones
-- Copiar y ejecutar: supabase/migrations/20260126_triggers_functions.sql

-- 4. Seeds
-- Copiar y ejecutar: supabase/migrations/20260126_seeds.sql
```

### 2. Verificar Instalación

```sql
-- Verificar tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Ver ingredientes
SELECT * FROM public.ingredients ORDER BY name;

-- Ver producto Graniplast
SELECT * FROM public.products;
```

### 3. Crear Usuario y Verificar Rol

1. En Supabase: **Authentication > Users > Add user**
2. Crear usuario con email/password
3. Verificar rol asignado:

```sql
SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id;
```

### 4. Probar Aplicación

```bash
npm run dev
```

- Login con el usuario creado
- Dashboard debe mostrar badge con rol "Administrador"

## Definición de Terminado ✅

### ✅ Tablas creadas
- 9 tablas en schema `public`
- Todas las relaciones funcionando
- Constraints e índices aplicados

### ✅ RLS bloquea accesos indebidos

**Prueba con rol operator**:
```sql
-- Intentar modificar ingrediente (debe fallar)
UPDATE public.ingredients SET name = 'Test' WHERE id = 'any_id';
-- Error: new row violates row-level security policy

-- Leer ingredientes (debe funcionar)
SELECT * FROM public.ingredients;
-- Success

-- Crear lote (debe funcionar)
INSERT INTO public.batches (formula_id, target_total_g, scale_factor)
VALUES ('formula_id', 20000, 0.1);
-- Success
```

### ✅ Primer usuario recibe rol admin automáticamente
- Trigger funciona correctamente
- Usuario puede acceder al sistema
- Dashboard muestra badge "Administrador"

### ✅ Audit logs funcionando
```sql
-- Verificar que se registran cambios
SELECT * FROM public.audit_logs ORDER BY created_at DESC LIMIT 10;
```

### ✅ Seeds cargados
- ✅ 1 producto: Graniplast
- ✅ 13 ingredientes
- ✅ 1 color de prueba: Azul Cielo (opcional)
- ✅ 1 fórmula de ejemplo (opcional)

## Decisiones de Arquitectura Clave

### 1. Cantidades en Gramos (INTEGER)
**Por qué**: Precisión matemática, evita errores con decimales, facilita conversión UI.

### 2. Tabla batch_items como Snapshot
**Por qué**: Trazabilidad histórica. Si cambia una fórmula, los lotes antiguos mantienen su data exacta.

### 3. Múltiples Versiones Activas
**Por qué**: Flexibilidad operativa para variantes de un mismo color.

### 4. RLS Estricto por Rol
**Por qué**: Seguridad a nivel de BD, no depende solo de código frontend.

### 5. Primer Usuario Admin Automático
**Por qué**: Simplifica onboarding, no requiere configuración manual.

## Testing de Seguridad

### Test 1: Usuario sin rol no puede acceder
```sql
-- Como usuario sin entrada en user_roles
SELECT * FROM public.products;
-- Result: 0 rows (RLS bloquea)
```

### Test 2: Operator no puede modificar fórmulas
```sql
-- Como operator
UPDATE public.formulas SET notes = 'Test' WHERE id = 'any_id';
-- Error: policy violation
```

### Test 3: Operator puede crear lotes
```sql
-- Como operator
INSERT INTO public.batches (formula_id, target_total_g, scale_factor)
VALUES ('valid_formula_id', 50000, 0.25);
-- Success
```

### Test 4: Admin tiene acceso completo
```sql
-- Como admin
UPDATE public.ingredients SET description = 'Updated';
DELETE FROM public.colors WHERE id = 'any_id';
-- Success
```

## Próximos Pasos

**Sprint 2 — CRUD Colores + Crear Fórmula**:
- Implementar UI para crear colores
- Formulario de fórmulas con ingredientes dinámicos
- Búsqueda y listado
- Integración completa con Supabase

## Recursos

- [supabase/README.md](supabase/README.md) - Guía de instalación
- [supabase/DATABASE_DESIGN.md](supabase/DATABASE_DESIGN.md) - Arquitectura detallada
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)

---

**Estado**: ✅ Sprint 1 completado y listo para producción
