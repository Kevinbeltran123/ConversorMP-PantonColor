# 🚀 Instrucciones para Ejecutar Migraciones

Sigue estos pasos para configurar la base de datos en Supabase.

## Paso 1: Acceder a Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: `qalkqrvmzbwxdsesdnvq`
3. En el menú lateral, haz clic en **SQL Editor**

## Paso 2: Ejecutar Migraciones (en orden)

### Migración 1: Esquema Inicial

1. Abre el archivo: [`supabase/migrations/20260126_initial_schema.sql`](supabase/migrations/20260126_initial_schema.sql)
2. **Copia TODO el contenido** del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (botón verde abajo a la derecha)
5. ✅ Verifica que no haya errores en el output

**Qué hace**: Crea todas las tablas, índices y relaciones de la base de datos.

---

### Migración 2: Políticas RLS

1. Abre el archivo: [`supabase/migrations/20260126_rls_policies.sql`](supabase/migrations/20260126_rls_policies.sql)
2. **Copia TODO el contenido** del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run**
5. ✅ Verifica que no haya errores

**Qué hace**: Configura Row Level Security (seguridad por roles).

---

### Migración 3: Triggers y Funciones

1. Abre el archivo: [`supabase/migrations/20260126_triggers_functions.sql`](supabase/migrations/20260126_triggers_functions.sql)
2. **Copia TODO el contenido** del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run**
5. ✅ Verifica que no haya errores

**Qué hace**: Crea triggers para auditoría, auto-incremento de versiones, y asignación de rol admin.

---

### Migración 4: Seeds (Datos Iniciales)

1. Abre el archivo: [`supabase/migrations/20260126_seeds.sql`](supabase/migrations/20260126_seeds.sql)
2. **Copia TODO el contenido** del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run**
5. ✅ Verifica que no haya errores

**Qué hace**: Inserta datos iniciales (producto Graniplast, ingredientes, color de prueba).

---

## Paso 3: Verificar Instalación

Ejecuta este query en el SQL Editor para verificar:

```sql
-- Ver tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver que RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Ver ingredientes
SELECT name FROM public.ingredients ORDER BY name;

-- Ver producto Graniplast
SELECT * FROM public.products;
```

**Resultado esperado**:
- 9 tablas en schema `public`
- RLS = `true` en todas las tablas
- 13 ingredientes
- 1 producto (Graniplast)

---

## Paso 4: Crear Usuario Admin

1. En Supabase Dashboard, ve a **Authentication** en el menú lateral
2. Haz clic en **Users**
3. Haz clic en **Add user** (botón verde)
4. Ingresa:
   - Email: tu email
   - Password: una contraseña segura
   - **NO marcar** "Auto Confirm User" (o marcarlo, según prefieras)
5. Haz clic en **Create user**

**El trigger automático le asignará rol `admin` a este primer usuario.**

### Verificar rol asignado

Ejecuta en SQL Editor:

```sql
SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id;
```

Deberías ver tu email con rol `admin`.

---

## Paso 5: Probar la Aplicación

1. Abre tu terminal
2. Ve a la carpeta del proyecto
3. Ejecuta:

```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000)
5. Inicia sesión con el usuario creado
6. ✅ Deberías ver el Dashboard con un badge "Administrador"

---

## Solución de Problemas

### Error: "permission denied for table X"

**Solución**:
- Verifica que ejecutaste la migración 2 (RLS policies)
- Verifica que el usuario tiene rol en la tabla `user_roles`

### Error: "function does not exist"

**Solución**:
- Ejecuta la migración 3 (triggers y funciones)

### Usuario no tiene rol admin

**Solución**: Asignar rol manualmente en SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES ('REEMPLAZA_CON_USER_ID', 'admin', 'REEMPLAZA_CON_USER_ID');
```

Para obtener el `user_id`:

```sql
SELECT id, email FROM auth.users;
```

### Resetear base de datos (CUIDADO: borra todo)

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Luego ejecutar las 4 migraciones de nuevo
```

---

## Próximo Paso

Una vez completada la migración, estás listo para el **Sprint 2**:
- CRUD de colores
- Formulario de fórmulas con ingredientes dinámicos
- Búsqueda y listado

---

**¿Dudas?** Revisa [supabase/README.md](supabase/README.md) para más detalles.
