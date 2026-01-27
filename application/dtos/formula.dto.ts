import type {
  Formula,
  FormulaItem,
  Ingredient,
  Color,
  Product,
} from '@/domain/entities/database.types'

// =====================================================
// FORMULA DTOs
// =====================================================

export interface FormulaItemWithIngredient extends FormulaItem {
  ingredient: Ingredient
}

export interface FormulaWithItems extends Formula {
  items: FormulaItemWithIngredient[]
}

export interface FormulaWithColor extends FormulaWithItems {
  color: Color & { product: Product }
}

export interface FormulaWithDetails extends Formula {
  color: Color
  product: Product
  items: FormulaItemWithIngredient[]
}

export interface FormulaListItem {
  id: string
  color_name: string
  product_name: string
  version: number
  base_total_g: number
  is_active: boolean
  items_count: number
  created_at: string
}
