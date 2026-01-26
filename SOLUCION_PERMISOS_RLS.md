# Solución: "permission denied for table colors"

## Diagnóstico

El error "permission denied for table colors" indica que las políticas de Row Level Security (RLS) están bloqueando el acceso porque tu usuario no tiene un rol asignado en la tabla `user_roles`.

## Causa probable

El trigger `assign_admin_to_first_user` debería haber asignado automáticamente el rol 'admin' al primer usuario que se registró, pero esto no ocurrió. Posibles razones:

1. Te registraste **ANTES** de ejecutar las migraciones que crean el trigger
2. El trigger no se ejecutó correctamente
3. El trigger solo se activa en **nuevos** registros, no en usuarios existentes

## Solución Rápida

### Paso 1: Verificar el problema

Abre en tu navegador: http://localhost:3000/debug

Esta página te mostrará:
- ✅ Tu user_id
- ✅ Si tienes rol asignado
- ✅ Qué permisos tienes
- ✅ Por qué no puedes acceder a colors

### Paso 2: Asignar el rol admin

#### Opción A: Desde Supabase SQL Editor

1. Ve a tu proyecto en Supabase Dashboard
2. Abre el **SQL Editor**
3. Ejecuta el siguiente script:

```sql
-- Este script asigna rol admin al usuario actualmente autenticado
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES (auth.uid(), 'admin', auth.uid())
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Verificar que funcionó
SELECT
  ur.user_id,
  ur.role,
  u.email,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id;
```

**IMPORTANTE**: Asegúrate de estar autenticado en Supabase Dashboard con la misma cuenta que usas en la aplicación.

#### Opción B: Si conoces tu User ID

Si ya conoces tu `user_id` (desde la página /debug o desde Supabase Dashboard → Authentication → Users):

1. Abre el SQL Editor en Supabase
2. Reemplaza `TU_USER_ID_AQUI` con tu UUID y ejecuta:

```sql
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES ('TU_USER_ID_AQUI', 'admin', 'TU_USER_ID_AQUI')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### Paso 3: Verificar la solución

1. Refresca la aplicación (http://localhost:3000)
2. Navega a `/colors`
3. Deberías poder ver la lista de colores sin errores

## Verificación completa

Para asegurarte de que todo está funcionando correctamente:

### 1. Verificar que RLS está habilitado

```sql
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('colors', 'products', 'user_roles', 'ingredients', 'formulas');
```

Todas las tablas deben tener `rowsecurity = true`.

### 2. Verificar que las políticas existen

```sql
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'colors'
ORDER BY policyname;
```

Deberías ver 4 políticas:
- `Users with role can view colors` (SELECT)
- `Admins can insert colors` (INSERT)
- `Admins can update colors` (UPDATE)
- `Admins can delete colors` (DELETE)

### 3. Verificar que las funciones helper existen

```sql
SELECT
  proname,
  prosrc
FROM pg_proc
WHERE proname IN ('is_admin', 'is_operator', 'has_role', 'get_user_role')
ORDER BY proname;
```

Deberías ver las 4 funciones.

### 4. Probar las funciones

```sql
-- Esto debería devolver true si eres admin
SELECT public.is_admin();

-- Esto debería devolver 'admin'
SELECT public.get_user_role();

-- Esto debería devolver true
SELECT public.has_role();
```

## Si el problema persiste

Si después de asignar el rol admin aún tienes problemas:

### 1. Verificar variables de entorno

Asegúrate de que tu archivo `.env.local` tenga:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 2. Re-ejecutar migraciones RLS

Si las políticas no se aplicaron correctamente:

```bash
# En Supabase SQL Editor, ejecuta:
supabase/migrations/20260126_rls_policies.sql
```

### 3. Reiniciar el servidor de desarrollo

```bash
npm run dev
```

### 4. Limpiar cookies y volver a autenticarte

1. Cierra sesión en la aplicación
2. Limpia las cookies del navegador (o usa modo incógnito)
3. Vuelve a iniciar sesión

## Prevención futura

Para evitar este problema con nuevos usuarios:

1. El trigger `assign_admin_to_first_user` asigna automáticamente el rol 'admin' al **primer usuario** que se registra
2. Los usuarios subsecuentes **NO** reciben rol automáticamente (por seguridad)
3. Los admins deben asignar roles manualmente a nuevos usuarios usando:

```sql
-- Asignar rol admin a un usuario
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES ('USER_ID_DEL_NUEVO_USUARIO', 'admin', auth.uid());

-- Asignar rol operator a un usuario
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES ('USER_ID_DEL_NUEVO_USUARIO', 'operator', auth.uid());
```

O implementar una interfaz de administración de usuarios en el Sprint futuro.

## Referencias

- Archivo de políticas: `supabase/migrations/20260126_rls_policies.sql`
- Archivo de triggers: `supabase/migrations/20260126_triggers_functions.sql`
- Documentación de RLS: `supabase/DATABASE_DESIGN.md`
- Página de diagnóstico: `/debug`
