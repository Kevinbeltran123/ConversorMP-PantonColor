# Guía de Despliegue a Producción

## Resumen

Esta guía describe cómo desplegar el sistema ConversorMP a producción usando Vercel (frontend) y Supabase (backend).

## Pre-requisitos

Antes de desplegar, asegúrate de tener:

- [ ] Cuenta en [Vercel](https://vercel.com)
- [ ] Cuenta en [Supabase](https://supabase.com)
- [ ] Código en repositorio Git (GitHub, GitLab, Bitbucket)
- [ ] Node.js 18+ instalado localmente
- [ ] Git configurado

## Parte 1: Configurar Supabase (Base de Datos)

### 1.1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en "Start your project"
3. Click en "New Project"
4. Completa:
   - **Name:** conversormp-prod (o el nombre que prefieras)
   - **Database Password:** Genera una contraseña segura (¡GUÁRDALA!)
   - **Region:** Selecciona la más cercana a tus usuarios
   - **Pricing Plan:** Free tier es suficiente para MVP
5. Click en "Create new project"
6. Espera ~2 minutos mientras se aprovisiona

### 1.2. Ejecutar Migraciones

Una vez que el proyecto esté listo:

**Opción A: Usando Supabase CLI (Recomendado)**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login en Supabase
supabase login

# Vincular proyecto local con proyecto remoto
supabase link --project-ref <TU_PROJECT_REF>
# El PROJECT_REF está en: Settings → General → Reference ID

# Ejecutar migraciones
supabase db push

# Verificar que se aplicaron correctamente
supabase db diff
```

**Opción B: Usando SQL Editor en Dashboard**

1. Ve a tu proyecto en Supabase Dashboard
2. Click en "SQL Editor" en el sidebar
3. Ejecuta las migraciones en orden:
   - `supabase/migrations/20250101_initial_schema.sql` (si existe)
   - `supabase/migrations/20260126_change_to_decimals.sql`
   - Cualquier otra migración en orden cronológico
4. Verifica que no hay errores

### 1.3. Configurar Row Level Security (RLS)

Las políticas RLS ya están en las migraciones, pero verifica que estén activas:

```sql
-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 1.4. Insertar Datos Iniciales (Seeds)

```sql
-- Insertar producto inicial
INSERT INTO public.products (name, description, active, created_by)
VALUES ('Graniplast', 'Producto principal de pintura texturizada', true, NULL)
ON CONFLICT DO NOTHING;

-- Insertar ingredientes comunes (ejemplo)
INSERT INTO public.ingredients (name, description, active) VALUES
  ('Base Blanca', 'Base acrílica blanca', true),
  ('Colanil', 'Pigmento concentrado', true),
  ('Negro', 'Pigmento negro de óxido', true),
  ('Azul', 'Pigmento azul ftalocianina', true),
  ('Amarillo', 'Pigmento amarillo óxido', true),
  ('Rojo', 'Pigmento rojo óxido', true)
ON CONFLICT DO NOTHING;
```

### 1.5. Obtener Credenciales de API

1. Ve a "Settings" → "API" en tu proyecto Supabase
2. Copia y guarda:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public** key (key pública para frontend)
   - **service_role** key (¡SECRETA! Solo para servidor)

## Parte 2: Desplegar en Vercel (Frontend)

### 2.1. Preparar Repositorio Git

```bash
# Asegúrate de estar en la rama principal
git checkout main

# Hacer commit de cambios pendientes
git add .
git commit -m "Preparar para deploy a producción"

# Push a remoto
git push origin main
```

### 2.2. Crear Proyecto en Vercel

**Opción A: Desde Dashboard**

1. Ve a [https://vercel.com](https://vercel.com)
2. Click en "Add New..." → "Project"
3. Importa tu repositorio Git (autoriza GitHub/GitLab si es necesario)
4. Selecciona el repositorio "ConversorMP"
5. Configura el proyecto:
   - **Framework Preset:** Next.js (detectado automáticamente)
   - **Root Directory:** `./` (raíz del proyecto)
   - **Build Command:** `npm run build` (por defecto)
   - **Output Directory:** `.next` (por defecto)
   - **Install Command:** `npm install` (por defecto)

**Opción B: Desde CLI**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 2.3. Configurar Variables de Entorno

En el dashboard de Vercel, durante la configuración del proyecto o después en "Settings" → "Environment Variables":

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**IMPORTANTE:**
- Las variables con `NEXT_PUBLIC_` son públicas (visibles en el navegador)
- `SUPABASE_SERVICE_ROLE_KEY` es PRIVADA (nunca exponerla en frontend)
- Agrega variables para los 3 ambientes: Production, Preview, Development

### 2.4. Deploy

1. Click en "Deploy" en Vercel
2. Espera ~2-5 minutos
3. Una vez completado, Vercel te dará una URL de producción:
   - `https://conversormp.vercel.app` o
   - `https://conversormp-xxxxx.vercel.app`

### 2.5. Verificar Despliegue

1. Abre la URL de producción
2. Verifica que la aplicación carga
3. Prueba el flujo completo:
   - [ ] Login funciona
   - [ ] Dashboard carga
   - [ ] Puedes ver fórmulas
   - [ ] Puedes calcular un lote
   - [ ] Impresión funciona
   - [ ] Export CSV funciona

## Parte 3: Configurar Dominio Personalizado (Opcional)

### 3.1. Comprar Dominio

Opciones populares:
- [Namecheap](https://www.namecheap.com)
- [Google Domains](https://domains.google)
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)

Ejemplo: `conversormp.com`

### 3.2. Configurar DNS en Vercel

1. En tu proyecto de Vercel, ve a "Settings" → "Domains"
2. Click en "Add Domain"
3. Ingresa tu dominio: `conversormp.com`
4. Vercel te dará registros DNS para configurar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. Ve al panel de tu proveedor de dominio (Namecheap, etc.)
6. Agrega los registros DNS que Vercel te indicó
7. Espera 24-48 horas para propagación (usualmente toma ~1 hora)
8. Vercel detectará automáticamente y configurará HTTPS

## Parte 4: Configurar Usuarios y Roles

### 4.1. Crear Primer Usuario Admin

**En desarrollo, usa:**
```bash
npm run dev
```

**En producción, usa Supabase Dashboard:**

1. Ve a "Authentication" → "Users"
2. Click en "Invite User"
3. Ingresa email del administrador
4. El usuario recibirá un email de confirmación
5. Después de confirmar, asigna rol de admin:

```sql
-- Obtener ID del usuario recién creado
SELECT id, email FROM auth.users WHERE email = 'admin@tuempresa.com';

-- Asignar rol de admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('uuid-del-usuario-aqui', 'admin');
```

### 4.2. Crear Usuarios Operadores

Desde el dashboard como admin:
1. Navega a (cuando implementes) `/admin/users`
2. O usa Supabase Dashboard "Authentication" → "Users"
3. Invita usuarios con email
4. Asigna rol 'operator' en tabla `user_roles`

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('uuid-del-operador', 'operator');
```

## Parte 5: Monitoreo y Mantenimiento

### 5.1. Configurar Alertas en Vercel

1. Ve a "Settings" → "Notifications"
2. Habilita alertas para:
   - Deploy failures
   - Domain errors
   - Function errors

### 5.2. Monitorear Logs

**Vercel Logs:**
1. Ve a tu proyecto → "Logs"
2. Filtra por errores: `level:error`

**Supabase Logs:**
1. Ve a "Logs" → "Postgres Logs"
2. Revisa queries lentos y errores

### 5.3. Métricas Importantes

**Vercel:**
- Build time (debe ser < 3 min)
- Function execution (debe ser < 10s)
- Bandwidth usage

**Supabase:**
- Database size
- API requests (max 500K/mes en free tier)
- Bandwidth (max 5GB/mes en free tier)

### 5.4. Actualizaciones

**Para desplegar nuevos cambios:**

```bash
# 1. Hacer cambios en desarrollo
git checkout develop
# ... hacer cambios ...
npm run build  # Verificar que build funciona
npm run test   # Ejecutar tests

# 2. Merge a main
git checkout main
git merge develop

# 3. Push a remoto
git push origin main

# 4. Vercel desplegará automáticamente
```

**Para rollback:**

1. Ve a "Deployments" en Vercel
2. Encuentra el deploy anterior estable
3. Click en "..." → "Promote to Production"

## Parte 6: Seguridad en Producción

### 6.1. Checklist de Seguridad

- [ ] **RLS habilitado** en todas las tablas
- [ ] **Variables de entorno** configuradas correctamente
- [ ] **SUPABASE_SERVICE_ROLE_KEY** nunca en código o logs públicos
- [ ] **HTTPS** habilitado (automático en Vercel)
- [ ] **Auth** requiere confirmación de email
- [ ] **Rate limiting** (considerar Vercel Edge Config)
- [ ] **Audit logs** funcionando correctamente

### 6.2. Configurar Headers de Seguridad

Agregar en `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### 6.3. Configurar CORS en Supabase

1. Ve a "Settings" → "API" en Supabase
2. En "CORS Configuration", agrega tu dominio:
   - `https://conversormp.vercel.app`
   - `https://conversormp.com` (si tienes dominio custom)

## Parte 7: Troubleshooting

### Problema: Build falla en Vercel

**Solución:**
```bash
# Probar build localmente primero
npm run build

# Limpiar cache
rm -rf .next node_modules
npm install
npm run build

# Si funciona local pero no en Vercel, verificar:
# - Node version en package.json
# - Variables de entorno en Vercel
```

### Problema: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que estén en el ambiente correcto (Production)
3. Redeploy después de agregar variables

### Problema: Usuarios no pueden autenticarse

**Solución:**
1. Verifica que Supabase URL sea correcta
2. Verifica RLS policies:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```
3. Verifica que el usuario existe en `auth.users`

### Problema: Queries son lentos

**Solución:**
1. Verifica índices en tablas:
```sql
SELECT * FROM pg_indexes WHERE schemaname = 'public';
```
2. Analiza queries lentos en Supabase Logs
3. Considera agregar índices:
```sql
CREATE INDEX IF NOT EXISTS idx_formulas_color_id ON formulas(color_id);
CREATE INDEX IF NOT EXISTS idx_batches_formula_id ON batches(formula_id);
```

### Problema: Alcancé límites de free tier

**Solución Temporal:**
- Supabase Free: 500K API requests/mes
- Si excedes, considera:
  - Optimizar queries (menos round-trips)
  - Cachear datos en frontend
  - Upgrade a plan Pro ($25/mes)

## Parte 8: Costos Estimados

### Free Tier (MVP)
- **Vercel:** Gratis (100GB bandwidth, 100 builds/mes)
- **Supabase:** Gratis (500MB database, 500K API requests)
- **Total:** $0/mes

### Producción Pequeña (< 100 usuarios)
- **Vercel Pro:** $20/mes (1TB bandwidth, ilimitados builds)
- **Supabase Pro:** $25/mes (8GB database, sin límite de requests)
- **Dominio:** ~$12/año
- **Total:** ~$46/mes

### Producción Media (< 1000 usuarios)
- **Vercel Team:** $20/mes/miembro
- **Supabase Pro:** $25/mes (escala con uso)
- **CDN/Storage adicional:** ~$10/mes
- **Total:** ~$55-100/mes

## Checklist Final de Despliegue

Antes de ir a producción, verifica:

### Base de Datos
- [ ] Migraciones ejecutadas correctamente
- [ ] RLS policies activas
- [ ] Seeds de datos iniciales insertados
- [ ] Backup automático configurado

### Frontend
- [ ] Build exitoso en Vercel
- [ ] Variables de entorno configuradas
- [ ] HTTPS habilitado
- [ ] Dominio custom configurado (opcional)

### Funcionalidad
- [ ] Login/Logout funciona
- [ ] Admin puede crear fórmulas
- [ ] Operador puede calcular lotes
- [ ] Impresión genera PDF correcto
- [ ] Export CSV funciona

### Seguridad
- [ ] Audit logs registrando cambios
- [ ] Solo admin puede modificar fórmulas
- [ ] Operador no puede ver admin panel

### Monitoreo
- [ ] Alertas de Vercel configuradas
- [ ] Logs de Supabase revisables
- [ ] Plan de backup configurado

---

**Última actualización:** 2026-01-26
**Versión:** 1.0
**Sprint:** 5

## Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
