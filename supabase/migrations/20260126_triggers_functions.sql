-- =====================================================
-- TRIGGERS & FUNCTIONS
-- Sistema ConversorMP - Graniplast
-- =====================================================

-- =====================================================
-- AUTO UPDATE: updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_colors_updated_at
  BEFORE UPDATE ON public.colors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- AUDIT LOG TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de auditoría para tablas críticas
CREATE TRIGGER audit_formulas
  AFTER INSERT OR UPDATE OR DELETE ON public.formulas
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_formula_items
  AFTER INSERT OR UPDATE OR DELETE ON public.formula_items
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_colors
  AFTER INSERT OR UPDATE OR DELETE ON public.colors
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger();

-- =====================================================
-- AUTO ASSIGN ADMIN ROLE TO FIRST USER
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Contar usuarios existentes
  SELECT COUNT(*) INTO user_count FROM auth.users;

  -- Si es el primer usuario, asignar rol admin
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role, created_by)
    VALUES (NEW.id, 'admin', NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para asignar rol al crear usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FORMULA VERSION AUTO INCREMENT
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_formula_version()
RETURNS TRIGGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  -- Si no se especifica versión, auto-incrementar
  IF NEW.version IS NULL THEN
    SELECT COALESCE(MAX(version), 0) + 1 INTO max_version
    FROM public.formulas
    WHERE color_id = NEW.color_id;

    NEW.version = max_version;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_formula_version_trigger
  BEFORE INSERT ON public.formulas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_formula_version();

-- =====================================================
-- HELPER: Calculate next formula version
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_next_formula_version(p_color_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(MAX(version), 0) + 1
  FROM public.formulas
  WHERE color_id = p_color_id;
$$ LANGUAGE SQL;
