import type {
  Batch,
  BatchItem,
  Formula,
  FormulaItem,
  Ingredient,
  Color,
  Product,
} from '@/domain/entities/database.types'

// =====================================================
// BATCH DTOs
// =====================================================

export interface BatchItemWithIngredient extends BatchItem {
  ingredient: Ingredient
}

export interface BatchWithItems extends Batch {
  items: BatchItemWithIngredient[]
}

export interface BatchWithFormula extends BatchWithItems {
  formula: Formula & {
    color: Color & { product: Product }
  }
}

export interface BatchListItem {
  id: string
  formula_id: string
  color_name: string
  product_name: string
  formula_version: number
  target_total_g: number
  scale_factor: number
  items_count: number
  created_at: string
  created_by: string | null
}

// Scaled ingredient item for display before saving
export interface ScaledIngredientItem {
  ingredient_id: string
  ingredient_name: string
  original_quantity_g: number
  scaled_quantity_g: number
  position: number
}

// Batch calculation result
export interface BatchCalculationResult {
  formula_id: string
  base_total_g: number
  target_total_g: number
  scale_factor: number
  items: ScaledIngredientItem[]
  total_scaled_g: number
  rounding_difference_g: number
}
