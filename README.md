# ConversorMP - Sistema Graniplast

Sistema de gestión de fórmulas de pinturas Graniplast con versionamiento, escalado y trazabilidad.

## Stack Tecnológico

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Formularios**: React Hook Form + Zod
- **Testing**: Vitest + Playwright
- **Deploy**: Vercel + Supabase

## Estructura del Proyecto (Clean Architecture)

```
/app                        # Next.js App Router (Presentation)
  /(auth)                   # Páginas de autenticación
  /(dashboard)              # Páginas protegidas con layout
/domain                     # Entidades puras y lógica de negocio
/application                # Casos de uso (DTOs + orchestration)
/infrastructure             # Implementaciones de DB, Auth
/components                 # Componentes UI reutilizables
/lib                        # Utilidades compartidas
```

## Convenciones

### Commits
- Usar prefijos: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Ejemplo: `feat: add color creation form`

### Naming
- **Archivos**: kebab-case (`color-form.tsx`)
- **Componentes**: PascalCase (`ColorForm`)
- **Funciones**: camelCase (`calculateScale`)
- **Constantes**: UPPER_SNAKE_CASE (`DEFAULT_ROUNDING`)

### Variables de Entorno
Copiar `.env.example` a `.env.local` y configurar:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm run test

# Lint
npm run lint
```

## Reglas de Dominio

### Medidas
- Todas las cantidades se almacenan en **gramos (g)** internamente
- UI acepta entrada en g o kg, convierte a g en backend
- Escalado: `factor = target_total_g / base_total_g`
- Redondeo por defecto: **1 gramo**

### Fórmulas
- Cada color puede tener múltiples versiones
- Múltiples versiones pueden estar "activas" simultáneamente
- Todos los ingredientes escalan proporcionalmente

## Progreso de Sprints

- **Sprint 0**: Setup + Auth + Layout ✅ **COMPLETADO**
  - [Ver resumen](SPRINT_0_SUMMARY.md)
- **Sprint 1**: Esquema BD + RLS ✅ **COMPLETADO**
  - [Ver resumen](SPRINT_1_SUMMARY.md) | [Ver migraciones](supabase/README.md)
- **Sprint 2**: CRUD Colores + Crear Fórmula ✅ **COMPLETADO**
  - [Ver resumen](SPRINT_2_SUMMARY.md)
- **Sprint 3**: Escalado + Guardar Lote + Tests (Próximo)
- **Sprint 4**: Impresión (Orden de mezcla)
- **Sprint 5**: Comparación versiones + Export CSV

## Inicio Rápido

### 1. Configurar Base de Datos

1. Ejecuta las migraciones SQL en Supabase (ver [supabase/README.md](supabase/README.md))
2. Crea tu primer usuario en Supabase Authentication
3. El sistema le asignará rol de admin automáticamente

### 2. Configurar Variables de Entorno

Edita `.env.local` con tus credenciales de Supabase (ya configurado).

### 3. Iniciar Aplicación

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) e inicia sesión.
