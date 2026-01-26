-- =====================================================
-- Sprint 1: Esquema de Base de Datos + RLS
-- Sistema ConversorMP - Graniplast
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER ROLES TABLE
-- =====================================================
-- Almacena los roles de los usuarios del sistema
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(user_id)
);

COMMENT ON TABLE public.user_roles IS 'Roles de usuarios del sistema';
COMMENT ON COLUMN public.user_roles.role IS 'Roles: admin (gestiona fórmulas) o operator (solo calcula/imprime)';

-- =====================================================
-- 2. PRODUCTS TABLE
-- =====================================================
-- Productos que se fabrican (Graniplast, Vinilo, etc.)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.products IS 'Productos fabricados (Graniplast, Vinilo, etc.)';

-- =====================================================
-- 3. COLORS TABLE
-- =====================================================
-- Colores registrados en el sistema
CREATE TABLE IF NOT EXISTS public.colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  UNIQUE(product_id, name)
);

COMMENT ON TABLE public.colors IS 'Colores registrados por producto';
COMMENT ON COLUMN public.colors.name IS 'Nombre del color (ej: Azul Cielo)';

-- =====================================================
-- 4. INGREDIENTS TABLE
-- =====================================================
-- Catálogo de ingredientes disponibles
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.ingredients IS 'Catálogo de ingredientes (colanil, negro, etc.)';

-- =====================================================
-- 5. FORMULAS TABLE
-- =====================================================
-- Fórmulas versionadas de colores
CREATE TABLE IF NOT EXISTS public.formulas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  color_id UUID NOT NULL REFERENCES public.colors(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  base_total_g INTEGER NOT NULL CHECK (base_total_g > 0),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(color_id, version)
);

COMMENT ON TABLE public.formulas IS 'Fórmulas versionadas de colores';
COMMENT ON COLUMN public.formulas.version IS 'Número de versión (1, 2, 3, ...)';
COMMENT ON COLUMN public.formulas.base_total_g IS 'Cantidad base total en GRAMOS';
COMMENT ON COLUMN public.formulas.is_active IS 'Pueden coexistir múltiples versiones activas';

-- =====================================================
-- 6. FORMULA_ITEMS TABLE
-- =====================================================
-- Ingredientes de cada fórmula con sus cantidades
CREATE TABLE IF NOT EXISTS public.formula_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formula_id UUID NOT NULL REFERENCES public.formulas(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  quantity_g INTEGER NOT NULL CHECK (quantity_g > 0),
  position INTEGER NOT NULL DEFAULT 0,

  UNIQUE(formula_id, ingredient_id)
);

COMMENT ON TABLE public.formula_items IS 'Ingredientes de cada fórmula';
COMMENT ON COLUMN public.formula_items.quantity_g IS 'Cantidad del ingrediente en GRAMOS';
COMMENT ON COLUMN public.formula_items.position IS 'Orden de agregado del ingrediente (opcional)';

-- =====================================================
-- 7. BATCHES TABLE
-- =====================================================
-- Lotes calculados y producidos
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formula_id UUID NOT NULL REFERENCES public.formulas(id) ON DELETE RESTRICT,
  target_total_g INTEGER NOT NULL CHECK (target_total_g > 0),
  scale_factor DECIMAL(10, 6) NOT NULL,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.batches IS 'Lotes calculados para trazabilidad';
COMMENT ON COLUMN public.batches.target_total_g IS 'Cantidad objetivo en GRAMOS';
COMMENT ON COLUMN public.batches.scale_factor IS 'Factor de escalado (target_total_g / base_total_g)';

-- =====================================================
-- 8. BATCH_ITEMS TABLE
-- =====================================================
-- Snapshot de ingredientes escalados del lote
CREATE TABLE IF NOT EXISTS public.batch_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  ingredient_name VARCHAR(100) NOT NULL,
  quantity_g INTEGER NOT NULL CHECK (quantity_g > 0),
  position INTEGER NOT NULL DEFAULT 0,

  UNIQUE(batch_id, ingredient_id)
);

COMMENT ON TABLE public.batch_items IS 'Snapshot de ingredientes escalados (para trazabilidad)';
COMMENT ON COLUMN public.batch_items.ingredient_name IS 'Snapshot del nombre (por si cambia después)';
COMMENT ON COLUMN public.batch_items.quantity_g IS 'Cantidad escalada en GRAMOS';

-- =====================================================
-- 9. AUDIT_LOGS TABLE
-- =====================================================
-- Registro de auditoría mínima
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.audit_logs IS 'Auditoría mínima de cambios críticos';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);

-- Colors
CREATE INDEX IF NOT EXISTS idx_colors_product_id ON public.colors(product_id);
CREATE INDEX IF NOT EXISTS idx_colors_name ON public.colors(name);
CREATE INDEX IF NOT EXISTS idx_colors_active ON public.colors(active);

-- Ingredients
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON public.ingredients(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_active ON public.ingredients(active);

-- Formulas
CREATE INDEX IF NOT EXISTS idx_formulas_color_id ON public.formulas(color_id);
CREATE INDEX IF NOT EXISTS idx_formulas_is_active ON public.formulas(is_active);
CREATE INDEX IF NOT EXISTS idx_formulas_color_version ON public.formulas(color_id, version);

-- Formula items
CREATE INDEX IF NOT EXISTS idx_formula_items_formula_id ON public.formula_items(formula_id);
CREATE INDEX IF NOT EXISTS idx_formula_items_ingredient_id ON public.formula_items(ingredient_id);

-- Batches
CREATE INDEX IF NOT EXISTS idx_batches_formula_id ON public.batches(formula_id);
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON public.batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batches_created_by ON public.batches(created_by);

-- Batch items
CREATE INDEX IF NOT EXISTS idx_batch_items_batch_id ON public.batch_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_items_ingredient_id ON public.batch_items(ingredient_id);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
