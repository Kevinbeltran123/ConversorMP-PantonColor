# Sprint 2 — CRUD Colores + Crear Fórmula ✅

## Objetivo
Crear colores y fórmulas con ingredientes flexibles.

## Historias de Usuario Completadas
1. ✅ Admin crea "Azul cielo".
2. ✅ Admin crea fórmula base 200 kg con ingredientes variables.
3. ✅ Sistema guarda cantidades en gramos.

## Funcionalidades Implementadas

### Colores
- ✅ Listado de colores con grid visual
- ✅ Formulario de creación (admin only)
- ✅ Página de detalle con listado de fórmulas
- ✅ Validación de nombres duplicados por producto
- ✅ Indicadores de estado (activo/inactivo)

### Fórmulas
- ✅ Formulario con ingredientes dinámicos (agregar/eliminar)
- ✅ Conversión automática kg ↔ g
- ✅ Versionamiento automático (trigger)
- ✅ Validación de cantidades
- ✅ Crear ingredientes on-the-fly
- ✅ Total de ingredientes en tiempo real
- ✅ Ordenamiento de ingredientes (position)

### Ingredientes
- ✅ Listado de ingredientes activos
- ✅ Crear nuevos ingredientes desde formulario de fórmula
- ✅ Validación de nombres únicos
- ✅ Catálogo precargado (13 ingredientes)

## Archivos Creados

### Validaciones (Zod)
- `lib/validations/color.schemas.ts` - Validaciones de colores
- `lib/validations/formula.schemas.ts` - Validaciones de fórmulas
- `lib/validations/ingredient.schemas.ts` - Validaciones de ingredientes

### Utilities
- `lib/utils/units.ts` - Conversión kg/g, formateo, parsing

### DTOs
- `application/dtos/color.dto.ts` - Tipos extendidos de colores
- `application/dtos/formula.dto.ts` - Tipos extendidos de fórmulas

### Server Actions
- `application/use-cases/colors.actions.ts` - CRUD colores + productos
- `application/use-cases/formulas.actions.ts` - CRUD fórmulas con items
- `application/use-cases/ingredients.actions.ts` - CRUD ingredientes

### Componentes UI
- `components/ui/button.tsx` - Botón reutilizable (4 variantes)
- `components/ui/input.tsx` - Input con label y error
- `components/ui/search-input.tsx` - Input de búsqueda con debounce

### Formularios
- `components/shared/color-form.tsx` - Formulario de crear color
- `components/shared/formula-form.tsx` - Formulario de fórmula (ingredientes dinámicos)

### Páginas
- `app/(dashboard)/colors/page.tsx` - Listado de colores
- `app/(dashboard)/colors/new/page.tsx` - Crear color
- `app/(dashboard)/colors/[id]/page.tsx` - Detalle de color
- `app/(dashboard)/colors/[id]/formulas/new/page.tsx` - Crear fórmula

## Flujo Completo Implementado

1. **Admin crea color**:
   - `/colors` → Clic "Crear Color"
   - Formulario: Producto + Nombre + Notas
   - Validación: No duplicados por producto
   - Redirección a detalle de color

2. **Admin crea fórmula**:
   - `/colors/{id}` → Clic "Crear Fórmula"
   - Ingresar cantidad base (acepta "200kg" o "200000g")
   - Agregar ingredientes dinámicamente
   - Seleccionar de catálogo o crear nuevo
   - Ingresar cantidad en gramos
   - Validación: Total no excede base
   - Submit: Crea fórmula v1 (auto-incrementa)

3. **Visualizar**:
   - Listado de colores con producto
   - Detalle muestra todas las versiones
   - Indicador de versión activa
   - Formato legible (200000g → "200.00 kg")

## Validaciones Implementadas

### Colores
- Nombre requerido (1-100 chars)
- Producto requerido (UUID válido)
- No duplicados: color + producto único
- Notas opcionales (max 1000 chars)

### Fórmulas
- Cantidad base > 0 (integer)
- Mínimo 1 ingrediente
- No ingredientes duplicados
- Total ingredientes ≤ cantidad base
- Notas opcionales (max 1000 chars)

### Ingredientes
- Nombre requerido (1-100 chars)
- Nombre único globalmente
- Descripción opcional (max 500 chars)

## Seguridad

- ✅ RLS aplicado (solo admin crea/modifica)
- ✅ Operator puede ver pero no modificar
- ✅ Validación server-side con Zod
- ✅ Redirección si no tiene permisos

## Características Técnicas

### Conversión de Unidades
```typescript
// Usuario ingresa: "200kg"
parseQuantityInput("200kg") // → 200000 (gramos)

// Display: 200000g
formatGrams(200000) // → "200.00 kg"
formatGrams(500) // → "500 g"
```

### Ingredientes Dinámicos
- Agregar/eliminar filas en tiempo real
- Select con catálogo completo
- Crear ingrediente sin salir del formulario
- Position auto-asignado (orden de mezcla)

### Versionamiento Automático
- Trigger `set_formula_version` incrementa versión
- No requiere especificar versión manualmente
- Color "Azul Cielo" → v1, v2, v3...

## Build + Tests

```
Route (app)                                 Size  First Load JS
┌ ƒ /colors                                164 B         106 kB
├ ƒ /colors/[id]                           164 B         106 kB
├ ƒ /colors/[id]/formulas/new            2.41 kB         104 kB
├ ƒ /colors/new                          1.58 kB         104 kB
```

✅ Build exitoso
✅ 10 rutas generadas
✅ TypeScript sin errores
✅ ESLint pasando

## Definición de Terminado ✅

### ✅ Se puede crear color y fórmula version 1
1. Crear color "Azul Cielo" para Graniplast
2. Crear fórmula con base 200kg (200000g)
3. Agregar 3 ingredientes: Base (180kg), Colanil (15kg), Negro (5kg)
4. Total: 200kg ✅
5. Ver en detalle: Versión 1, activa

### ✅ UI lista de colores + búsqueda
- Grid responsive de colores
- Indicador activo/inactivo
- Click lleva a detalle

### ✅ Pantalla detalle color
- Lista versiones de fórmulas
- Indicador de activa
- Botón crear nueva fórmula

### ✅ Formulario crear fórmula
- base_total (kg/g)
- ingredientes dinámicos (add/remove)
- autocompletar ingrediente + "crear nuevo"
- Persistencia correcta

## Problema Resuelto: Permisos RLS

Al completar el Sprint 2, apareció un error crítico:
```
permission denied for table colors
```

### Causa
Las migraciones de RLS no incluían permisos **GRANT** para los roles de Supabase (`authenticated` y `anon`).

### Solución
1. ✅ Desactivar RLS en `user_roles` para evitar recursión infinita
2. ✅ Otorgar permisos GRANT a todas las tablas
3. ✅ Actualizar funciones helper con `SECURITY DEFINER`

**Documentación**: Ver [SOLUCION_RLS_FINAL.md](SOLUCION_RLS_FINAL.md)

## Próximos Pasos

**Sprint 3 — Escalado + Guardar Lote + Tests**:
- Calculadora de escalado (200kg → 20kg)
- Guardar lotes para trazabilidad
- Tests unitarios del motor de escalado
- Validaciones de redondeo

---

**Estado**: ✅ Sprint 2 completado y funcional (incluyendo fix de RLS)
