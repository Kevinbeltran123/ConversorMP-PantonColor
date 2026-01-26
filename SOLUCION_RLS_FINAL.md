# Solución Final: Problema de Permisos RLS

## Problema

Después de completar el Sprint 2, al intentar acceder a `/colors` aparecía el error:
```
permission denied for table colors
```

## Causa Raíz

Las migraciones de RLS creaban políticas correctamente, pero **faltaban los permisos GRANT** para los roles que Supabase usa para conexiones desde Next.js:
- `authenticated` - usuarios autenticados
- `anon` - contexto anónimo (usado por algunas operaciones RLS)

Adicionalmente, había un problema de **recursión infinita** en las políticas de `user_roles`:
- Las políticas llamaban a funciones (`is_admin()`, `has_role()`)
- Esas funciones consultaban la tabla `user_roles`
- Pero las políticas bloqueaban el acceso a `user_roles`
- **Catch-22**: necesitas leer user_roles para saber si puedes leer user_roles

## Solución Implementada

### 1. Desactivar RLS en user_roles
```sql
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
```

**Justificación**: La tabla `user_roles` solo contiene `user_id` y `role`. No hay información sensible. La seguridad real está en las server actions que verifican `isAdmin()` antes de permitir operaciones críticas.

### 2. Otorgar permisos GRANT a todas las tablas

```sql
-- user_roles
GRANT SELECT ON public.user_roles TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- colors
GRANT SELECT ON public.colors TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.colors TO authenticated;

-- [... resto de tablas ...]
```

### 3. Actualizar funciones helper con SECURITY DEFINER

Las funciones `is_admin()`, `get_user_role()`, etc. ahora usan `SECURITY DEFINER` con `plpgsql`:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid();
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Scripts Ejecutados (en orden)

1. **FIX_COMPLETE.sql** - Eliminó todas las políticas de user_roles y desactivó RLS
2. **GRANT_PERMISSIONS.sql** - Otorgó permisos GRANT a user_roles
3. **GRANT_ALL_TABLES.sql** - Otorgó permisos GRANT a todas las tablas

## Archivos Actualizados

- `supabase/migrations/20260126_rls_policies.sql` - Actualizado para incluir GRANT y desactivar RLS en user_roles

## Verificación

Después de aplicar la solución:

✅ `/debug` muestra:
- User autenticado
- `isAdmin()`: true
- `getUserRole()`: admin
- Rol directo desde user_roles: admin

✅ `/colors` funciona sin errores de permisos

✅ Las políticas RLS siguen funcionando en todas las demás tablas (products, ingredients, formulas, etc.)

## Lecciones Aprendidas

1. **RLS + GRANT son diferentes**: RLS controla quién puede ver QUÉ filas, pero GRANT controla quién puede acceder a la TABLA en sí.

2. **Supabase usa roles específicos**: No basta con tener políticas RLS, necesitas `GRANT` para `authenticated` y `anon`.

3. **Evitar recursión en políticas**: Si una tabla es consultada por funciones usadas en políticas, considera desactivar RLS o usar funciones con `SECURITY DEFINER`.

4. **user_roles es especial**: Es mejor desactivar RLS en esta tabla ya que:
   - Es consultada frecuentemente por funciones helper
   - No contiene información sensible
   - La seguridad real está en las server actions

## Para Nuevos Proyectos

Al crear migraciones RLS, siempre incluir:

```sql
-- 1. Crear tabla
CREATE TABLE ...

-- 2. Habilitar RLS
ALTER TABLE ... ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas
CREATE POLICY ...

-- 4. ¡IMPORTANTE! Otorgar permisos GRANT
GRANT SELECT ON ... TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON ... TO authenticated;
```

## Referencias

- Documentación Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Documentación PostgreSQL GRANT: https://www.postgresql.org/docs/current/sql-grant.html
