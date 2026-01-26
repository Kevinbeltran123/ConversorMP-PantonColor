import { z } from 'zod'

// =====================================================
// COLOR SCHEMAS
// =====================================================

export const createColorSchema = z.object({
  product_id: z.string().uuid('ID de producto inválido'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  notes: z.string().max(1000, 'Las notas no pueden exceder 1000 caracteres').optional(),
  active: z.boolean().default(true),
})

export const updateColorSchema = createColorSchema.partial()

export type CreateColorInput = z.infer<typeof createColorSchema>
export type UpdateColorInput = z.infer<typeof updateColorSchema>
