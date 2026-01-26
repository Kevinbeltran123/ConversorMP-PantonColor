import { z } from 'zod'

// =====================================================
// INGREDIENT SCHEMAS
// =====================================================

export const createIngredientSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  active: z.boolean().default(true),
})

export const updateIngredientSchema = createIngredientSchema.partial()

export type CreateIngredientInput = z.infer<typeof createIngredientSchema>
export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>
