# Sprint 3 — Escalado + Guardar Lote + Tests

## Objetivo
Implementar la funcionalidad de escalado de fórmulas, permitiendo a los usuarios calcular y guardar lotes con cantidades personalizadas, incluyendo validaciones de redondeo y tests unitarios.

## Características Implementadas

### 1. Calculadora de Escalado
**Ubicación:** `/batches/new`

- **Selección de Fórmula:** Lista desplegable con todas las fórmulas activas mostrando Producto, Color, Versión y cantidad base
- **Cantidad Objetivo:** Input numérico para ingresar la cantidad deseada del lote en gramos
- **Cálculo en Tiempo Real:** Al hacer clic en "Calcular", se muestra:
  - Factor de escalado (target / base)
  - Tabla de ingredientes con cantidades originales y escaladas
  - Total de ingredientes escalados
  - Diferencia por redondeo con indicador de color
- **Validaciones:**
  - Cantidad objetivo debe ser un entero positivo
  - Máximo 1,000,000 gramos
  - Validación de fórmula activa

### 2. Guardar Lotes
**Ubicación:** `/batches/new` (después de calcular)

- **Observaciones:** Campo opcional de texto para agregar notas al lote
- **Persistencia:** Guarda en tablas `batches` y `batch_items`
- **Snapshot de Ingredientes:** Guarda nombre del ingrediente para trazabilidad (en caso de que el ingrediente cambie después)
- **Redirección:** Después de guardar, redirige al listado de lotes

### 3. Historial de Lotes
**Ubicación:** `/batches`

- **Tabla de Lotes:** Muestra todos los lotes guardados con:
  - Versión de fórmula
  - Producto y Color
  - Cantidad base y objetivo
  - Factor de escalado
  - Fecha de creación
  - Link a detalles
- **Botón de Acción:** "Calcular Nuevo Lote" para crear uno nuevo
- **Estado Vacío:** Mensaje amigable cuando no hay lotes

### 4. Detalle de Lote
**Ubicación:** `/batches/[id]`

- **Información de Fórmula:** Producto, Color, Versión, Estado (activa/inactiva), Notas
- **Resumen de Escalado:** Cantidad base, objetivo y factor de escalado en tarjetas visuales
- **Tabla de Ingredientes:** Lista completa de ingredientes con cantidades escaladas
- **Diferencia por Redondeo:** Indicador visual con colores:
  - Verde: Diferencia = 0 o ≤ 0.5%
  - Amarillo: Diferencia entre 0.5% y 1%
  - Rojo: Diferencia > 1% (con advertencia)
- **Observaciones:** Muestra las notas del lote si existen
- **Acciones:** Botones para volver al listado o calcular nuevo lote

### 5. Validaciones de Redondeo

**Funciones Implementadas:**

- `calculateRoundingDifference(target, actual)`: Calcula la diferencia entre objetivo y total real
- `isRoundingAcceptable(difference, target, maxPercentage)`: Valida si la diferencia está dentro del umbral aceptable (default 1%)
- `formatRoundingDifference(difference)`: Formatea la diferencia con signo (+/-) para mostrar
- `getRoundingStatusColor(difference, target)`: Retorna clase de color de Tailwind según el nivel de diferencia

**Criterios de Aceptación:**
- ≤ 0.5%: Excelente (verde)
- 0.5% - 1%: Aceptable (amarillo)
- > 1%: Requiere atención (rojo con advertencia)

### 6. Tests Unitarios
**Ubicación:** `lib/utils/__tests__/scaling.test.ts`

**Coverage:**
- 36 tests en total
- 100% de cobertura de funciones del motor de escalado
- Tests de casos edge (cantidades pequeñas, redondeo, etc.)
- Tests de integración con escenarios reales (200kg → 20kg)

**Funciones Testeadas:**
- `calculateScaleFactor`: Cálculo del factor de escalado
- `scaleQuantity`: Escalado de cantidades individuales con redondeo
- `scaleFormulaItems`: Escalado de arrays de ingredientes
- `calculateScaledTotal`: Suma de cantidades escaladas
- `calculateRoundingDifference`: Diferencia de redondeo
- `isRoundingAcceptable`: Validación de umbral
- `calculateBatch`: Cálculo completo de lote
- `formatRoundingDifference`: Formateo para UI
- `getRoundingStatusColor`: Determinación de color de estado

**Resultado:**
```
 Test Files  2 passed (2)
      Tests  39 passed (39)
```

## Archivos Creados

### DTOs y Tipos
- `application/dtos/batch.dto.ts` - Tipos TypeScript para lotes y cálculos

### Validaciones
- `lib/validations/batch.schemas.ts` - Schemas Zod para validación de input

### Utilidades
- `lib/utils/scaling.ts` - Motor de cálculo de escalado y redondeo

### Server Actions
- `application/use-cases/batches.actions.ts` - Actions para CRUD de lotes
- `application/use-cases/formulas.actions.ts` - Agregada función `getFormulas()`

### Páginas
- `app/(dashboard)/batches/page.tsx` - Listado de lotes (actualizado)
- `app/(dashboard)/batches/new/page.tsx` - Calculadora de lotes
- `app/(dashboard)/batches/[id]/page.tsx` - Detalle de lote

### Componentes
- `components/batches/batch-calculator.tsx` - Componente de calculadora

### Tests
- `lib/utils/__tests__/scaling.test.ts` - Suite completa de tests

## Tecnologías Utilizadas
- **Next.js 15**: App Router, Server Components, Server Actions
- **TypeScript**: Tipado estricto
- **Zod**: Validación de schemas
- **Supabase**: Base de datos y RLS
- **Vitest**: Framework de testing
- **Tailwind CSS**: Estilos

## Arquitectura

### Clean Architecture
```
domain/
  entities/database.types.ts (Batch, BatchItem types)

application/
  dtos/batch.dto.ts (DTOs con relaciones)
  use-cases/batches.actions.ts (Lógica de negocio)

lib/
  utils/scaling.ts (Motor de cálculo)
  validations/batch.schemas.ts (Validaciones)

infrastructure/
  supabase/ (Acceso a datos)

app/
  (dashboard)/batches/ (UI)

components/
  batches/ (Componentes reutilizables)
```

### Flujo de Datos
1. Usuario selecciona fórmula → `getFormulas()` carga opciones
2. Usuario ingresa cantidad → Validación con Zod
3. Clic en "Calcular" → `calculateBatch()` action
4. Server calcula con `scaling.ts` → Retorna resultado
5. Usuario revisa y guarda → `createBatch()` action
6. Datos persisten en DB → Redirección a listado

## Validaciones de Seguridad
- RLS policies en `batches` y `batch_items` heredadas del Sprint 1
- GRANT permissions ya configuradas
- Admin check en `deleteBatch()` (solo admins pueden eliminar)
- Verificación de fórmula activa antes de calcular/guardar
- Validación de inputs en server-side con Zod

## Métricas
- **Archivos Creados:** 9
- **Archivos Modificados:** 3
- **Líneas de Código:** ~1,500
- **Tests:** 39 (100% passing)
- **Build Time:** ~2s
- **Rutas Nuevas:** 3 (`/batches`, `/batches/new`, `/batches/[id]`)

## Estado del Proyecto
✅ **Sprint 1:** Esquema + RLS + Auth (Completado)
✅ **Sprint 2:** CRUD Colores + Crear Fórmula (Completado)
✅ **Sprint 3:** Escalado + Guardar Lote + Tests (Completado)

## Próximos Pasos Sugeridos
- Sprint 4: Impresión de etiquetas/recetas
- Sprint 5: Reportes y analytics
- Sprint 6: Gestión de inventario de ingredientes
- Sprint 7: API REST para integraciones
