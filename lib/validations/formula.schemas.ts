import { z } from 'zod'

// =====================================================
// FORMULA SCHEMAS
// =====================================================

export const formulaItemSchema = z.object({
  ingredient_id: z.string().uuid('ID de ingrediente inválido'),
  quantity_g: z
    .number()
    .positive('La cantidad debe ser mayor a 0')
    .refine(
      (val) => Number(val.toFixed(2)) === val || val.toFixed(2).split('.')[1]?.length <= 2,
      { message: 'La cantidad no puede tener más de 2 decimales' }
    ),
  position: z.number().int().default(0),
})

export const createFormulaSchema = z.object({
  color_id: z.string().uuid('ID de color inválido'),
  base_total_g: z
    .number()
    .positive('La cantidad base debe ser mayor a 0')
    .refine(
      (val) => Number(val.toFixed(2)) === val || val.toFixed(2).split('.')[1]?.length <= 2,
      { message: 'La cantidad base no puede tener más de 2 decimales' }
    ),
  is_active: z.boolean().default(true),
  notes: z.string().max(1000, 'Las notas no pueden exceder 1000 caracteres').optional(),
  items: z
    .array(formulaItemSchema)
    .min(1, 'Debe agregar al menos un ingrediente')
    .refine(
      (items) => {
        const ingredientIds = items.map((item) => item.ingredient_id)
        return new Set(ingredientIds).size === ingredientIds.length
      },
      { message: 'No puede haber ingredientes duplicados' }
    )
    .refine(
      (items) => {
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity_g, 0)
        return totalQuantity > 0
      },
      { message: 'La suma de ingredientes debe ser mayor a 0' }
    ),
})

export const updateFormulaSchema = z.object({
  is_active: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
})

export type FormulaItemInput = z.infer<typeof formulaItemSchema>
export type CreateFormulaInput = z.infer<typeof createFormulaSchema>
export type UpdateFormulaInput = z.infer<typeof updateFormulaSchema>
