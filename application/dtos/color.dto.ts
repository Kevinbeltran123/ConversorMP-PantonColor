import type { Color, Product, Formula } from '@/domain/entities/database.types'

// =====================================================
// COLOR DTOs
// =====================================================

export interface ColorWithProduct extends Color {
  product: Product
}

export interface ColorWithFormulas extends ColorWithProduct {
  formulas: Formula[]
}

export interface ColorListItem {
  id: string
  name: string
  product_name: string
  active: boolean
  formulas_count: number
  created_at: string
}
