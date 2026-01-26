# Sprint 0 — Base sólida ✅

## Objetivo
Proyecto corriendo, login funcional, rutas protegidas, estilos base.

## Historias de Usuario Completadas
1. ✅ Como usuario, quiero iniciar sesión para acceder al sistema.
2. ✅ Como admin, quiero ver un dashboard inicial.

## Checklist Técnico
- ✅ Crear proyecto Next.js TS
- ✅ Configurar Supabase (Auth + proyecto)
- ✅ Middleware de rutas protegidas
- ✅ Layout base (sidebar simple)
- ✅ Estructura Clean Architecture (carpetas)
- ✅ ESLint + Prettier + EditorConfig
- ✅ Convenciones: commits, naming, env

## Cambios de BD
Ninguno en este sprint. Se usará Supabase Auth out-of-the-box.

## Archivos Creados

### Configuración
- `package.json` - Dependencias del proyecto
- `tsconfig.json` - Configuración TypeScript
- `next.config.ts` - Configuración Next.js
- `tailwind.config.ts` - Configuración TailwindCSS
- `postcss.config.js` - Configuración PostCSS
- `vitest.config.ts` - Configuración Vitest
- `.editorconfig` - Configuración del editor
- `.prettierrc` - Configuración Prettier
- `eslint.config.mjs` - Configuración ESLint
- `.gitignore` - Archivos ignorados por Git
- `.env.example` - Ejemplo de variables de entorno
- `.env.local` - Variables de entorno (requiere configuración)

### Infraestructura (Supabase)
- `infrastructure/supabase/client.ts` - Cliente Supabase para navegador
- `infrastructure/supabase/server.ts` - Cliente Supabase para server
- `infrastructure/supabase/middleware.ts` - Middleware de sesión
- `middleware.ts` - Middleware de Next.js

### Application Layer
- `application/use-cases/auth.actions.ts` - Server Actions de autenticación

### Presentación
- `app/layout.tsx` - Root layout
- `app/globals.css` - Estilos globales
- `app/page.tsx` - Página de inicio (redirige según auth)
- `app/(auth)/layout.tsx` - Layout para páginas de autenticación
- `app/(auth)/login/page.tsx` - Página de login
- `app/(dashboard)/layout.tsx` - Layout con sidebar
- `app/(dashboard)/dashboard/page.tsx` - Dashboard principal
- `app/(dashboard)/colors/page.tsx` - Página de colores (placeholder)
- `app/(dashboard)/formulas/page.tsx` - Página de fórmulas (placeholder)
- `app/(dashboard)/batches/page.tsx` - Página de lotes (placeholder)

### Componentes
- `components/shared/login-form.tsx` - Formulario de login
- `components/shared/sidebar.tsx` - Sidebar de navegación

### Tests
- `domain/__tests__/example.test.ts` - Tests de ejemplo

### Documentación
- `README.md` - Documentación del proyecto
- `SPRINT_0_SUMMARY.md` - Este resumen

## Estructura Clean Architecture

```
/app                        # Next.js App Router (Presentation)
  /(auth)                   # Páginas de autenticación
    /login
  /(dashboard)              # Páginas protegidas con layout
    /dashboard
    /colors
    /formulas
    /batches
/domain                     # Entidades puras y lógica de negocio
  /entities
  /value-objects
  /interfaces
  /__tests__
/application                # Casos de uso (DTOs + orchestration)
  /use-cases
  /dtos
/infrastructure             # Implementaciones de DB, Auth
  /supabase
  /repositories
/components                 # Componentes UI reutilizables
  /ui
  /shared
/lib                        # Utilidades compartidas
  /utils
  /validations
```

## Comandos para Correr

### Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000)

### Build
```bash
npm run build
```

### Tests
```bash
npm run test
```

### Lint
```bash
npm run lint
```

## Definición de Terminado ✅

### ✅ Login funcionando
- Formulario de login creado con validación
- Server Actions implementadas para login/logout
- Manejo de errores en UI

### ✅ Dashboard accesible solo autenticado
- Middleware protege rutas `/dashboard/*`
- Redirección automática a `/login` si no autenticado
- Redirección a `/dashboard` si ya autenticado en `/login`
- Sidebar con navegación funcional
- Dashboard muestra email del usuario

### ✅ Build exitoso
```
Route (app)                                 Size  First Load JS
┌ ƒ /                                      137 B         102 kB
├ ○ /_not-found                            993 B         103 kB
├ ○ /batches                               137 B         102 kB
├ ○ /colors                                137 B         102 kB
├ ƒ /dashboard                             137 B         102 kB
├ ○ /formulas                              137 B         102 kB
└ ○ /login                               1.09 kB         103 kB
```

### ✅ Tests pasando
```
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

## Configuración Requerida

Antes de correr el proyecto, debes configurar Supabase:

1. Copia `.env.example` a `.env.local` (ya existe)
2. Edita `.env.local` y agrega tus credenciales de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```
3. En tu proyecto de Supabase, crea un usuario de prueba en Authentication

## Notas Técnicas

### Seguridad
- Rutas protegidas con middleware de Supabase SSR
- Server Components y Server Actions para lógica sensible
- Variables de entorno para credenciales
- TypeScript strict mode habilitado

### Clean Code
- Estructura de carpetas por capas (Domain, Application, Infrastructure, Presentation)
- Separación de concerns (UI, lógica de negocio, persistencia)
- Server Actions para mutaciones
- Componentes reutilizables

### Performance
- Server Components por defecto
- Client Components solo donde se necesita interactividad
- Middleware eficiente para auth
- Build optimizado con Next.js 15

## Próximos Pasos

**Sprint 1**: Esquema de BD + RLS
- Crear tablas (products, colors, formulas, ingredients, etc.)
- Implementar RLS policies
- Seeds iniciales (producto Graniplast)
