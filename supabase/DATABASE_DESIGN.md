# Diseño de Base de Datos - ConversorMP Graniplast

## Decisiones de Arquitectura

### 1. Almacenamiento de Cantidades en Gramos

**Decisión**: Todas las cantidades se almacenan internamente en **gramos (INTEGER)**.

**Justificación**:
- Evita problemas de precisión con decimales
- Facilita cálculos matemáticos exactos
- Permite conversión flexible en UI (mostrar en g o kg según magnitud)
- Estándar en sistemas de medidas industriales

**Implementación**:
- Columnas: `base_total_g`, `quantity_g`, `target_total_g`
- Tipo: `INTEGER` con constraint `CHECK > 0`
- UI convierte kg → g al enviar, g → kg al mostrar

### 2. Tabla `batch_items` como Snapshot

**Decisión**: Crear tabla `batch_items` que almacena snapshot de los ingredientes escalados.

**Justificación**:
- **Trazabilidad**: Si se modifica una fórmula (nueva versión), los lotes antiguos mantienen registro exacto de lo que se produjo
- **Auditoría**: Permite verificar qué se usó en cada lote histórico
- **Reimpresión**: Puedo reimprimir órdenes de mezcla con datos exactos originales
- **Compliance**: Importante en industria química para regulaciones

**Alternativa descartada**: Calcular dinámicamente desde `formula_items`
- Problema: Si cambia la fórmula, los cálculos históricos serían incorrectos
- No hay registro de lo que realmente se produjo

**Campos clave**:
- `ingredient_name`: Snapshot del nombre (por si el ingrediente se renombra/elimina)
- `quantity_g`: Cantidad escalada exacta que se usó

### 3. Versionamiento de Fórmulas

**Decisión**: Múltiples versiones pueden coexistir como "activas" simultáneamente.

**Justificación**:
- Permite tener variantes de un mismo color
- Útil para diferentes calidades o presentaciones
- Flexibilidad operativa para el cliente
- No se requiere enforcing de "solo una activa"

**Implementación**:
- `formulas.is_active`: BOOLEAN (no UNIQUE)
- `formulas.version`: INTEGER auto-incrementado por trigger
- Constraint UNIQUE(color_id, version)

### 4. Row Level Security (RLS)

**Decisión**: Implementar RLS con políticas estrictas por rol.

**Justificación**:
- Seguridad a nivel de BD (no depende solo de código)
- Admin: CRUD completo en fórmulas, colores, productos
- Operator: Solo lectura en fórmulas, puede crear/leer lotes
- Usuario sin rol: Sin acceso

**Implementación**:
- Funciones helper: `is_admin()`, `is_operator()`, `has_role()`
- Políticas específicas por tabla y operación (SELECT, INSERT, UPDATE, DELETE)
- SECURITY DEFINER en funciones sensibles

### 5. Auditoría Mínima

**Decisión**: Audit logs solo en tablas críticas (formulas, formula_items, colors).

**Justificación**:
- Balance entre trazabilidad y complejidad
- Enfoque MVP: auditar solo cambios de impacto
- No auditar batches (ya son históricos por naturaleza)
- Formato JSONB para flexibilidad

**Implementación**:
- Trigger `audit_trigger()` con SECURITY DEFINER
- Almacena `old_data` y `new_data` en JSONB
- Índices en `table_name`, `record_id`, `created_at`

### 6. Primer Usuario Admin Automático

**Decisión**: Trigger que asigna rol 'admin' al primer usuario registrado.

**Justificación**:
- Simplifica onboarding inicial
- No requiere configuración manual en Supabase
- Usuario puede empezar a usar el sistema inmediatamente
- Usuarios subsecuentes requieren asignación manual de rol

**Implementación**:
- Trigger `on_auth_user_created` en `auth.users`
- Función `handle_new_user()` verifica count de usuarios
- Si count = 1, inserta en `user_roles` con role='admin'

### 7. Índices de Rendimiento

**Decisión**: Índices en columnas de búsqueda y foreign keys.

**Justificación**:
- Búsquedas rápidas por nombre (colors, ingredients)
- JOINs eficientes en relaciones
- Filtrado por estado activo
- Orden cronológico en batches

**Índices clave**:
- `colors.name`, `ingredients.name` (búsquedas)
- `formulas.color_id`, `batches.formula_id` (JOINs)
- `batches.created_at DESC` (historial)
- Índices compuestos: `(table_name, record_id)` en audit_logs

## Esquema de Relaciones

```
auth.users (Supabase Auth)
    ↓
user_roles (role: admin | operator)

products (Graniplast, Vinilo, etc.)
    ↓
colors (Azul Cielo, Rojo Ferrari, etc.)
    ↓
formulas (versiones: v1, v2, v3...)
    ↓
formula_items ← ingredients (Colanil, Negro, etc.)
    ↓
batches (lotes producidos)
    ↓
batch_items (snapshot de ingredientes escalados)

audit_logs (cambios en formulas, colors, formula_items)
```

## Reglas de Negocio en BD

### Constraints

1. **Cantidades positivas**: `CHECK (quantity_g > 0)`
2. **Roles válidos**: `CHECK (role IN ('admin', 'operator'))`
3. **Acciones de audit**: `CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))`
4. **Un rol por usuario**: `UNIQUE(user_id)` en user_roles
5. **Versión única por color**: `UNIQUE(color_id, version)` en formulas
6. **Color único por producto**: `UNIQUE(product_id, name)` en colors

### Cascadas

- `user_roles.user_id → auth.users`: ON DELETE CASCADE
- `colors.product_id → products`: ON DELETE RESTRICT (no borrar producto con colores)
- `formulas.color_id → colors`: ON DELETE CASCADE
- `formula_items.formula_id → formulas`: ON DELETE CASCADE
- `batches.formula_id → formulas`: ON DELETE RESTRICT (mantener historial)
- `batch_items.batch_id → batches`: ON DELETE CASCADE

### Triggers

1. **update_updated_at**: Actualiza automáticamente `updated_at` y `updated_by`
2. **audit_trigger**: Registra cambios en audit_logs
3. **on_auth_user_created**: Asigna rol admin al primer usuario
4. **set_formula_version**: Auto-incrementa versión de fórmula

## Tipos de Datos

- **IDs**: UUID (generados con `uuid_generate_v4()`)
- **Cantidades**: INTEGER (gramos)
- **Factor de escala**: DECIMAL(10, 6)
- **Nombres**: VARCHAR(100)
- **Timestamps**: TIMESTAMP WITH TIME ZONE
- **Audit data**: JSONB

## Consideraciones de Seguridad

1. **RLS habilitado** en todas las tablas públicas
2. **Funciones SECURITY DEFINER** solo donde necesario
3. **No exponer service_role_key** en frontend
4. **Validación en múltiples capas**: BD + Backend + Frontend
5. **Audit logs** para compliance

## Escalabilidad Futura

### Preparado para:
- Múltiples productos (Vinilo, etc.)
- Crecimiento de ingredientes (dinámicos)
- Historial ilimitado de batches
- Nuevos roles (supervisor, quality_control, etc.)

### No implementado aún (post-MVP):
- Soft deletes (deleted_at)
- Costos de ingredientes
- Stock/inventario
- Proveedores
- Multi-tenancy (empresas)
