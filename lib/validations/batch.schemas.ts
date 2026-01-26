import { z } from 'zod'

// =====================================================
// BATCH SCHEMAS
// =====================================================

export const createBatchSchema = z.object({
  formula_id: z.string().uuid('ID de fórmula inválido'),
  target_total_g: z
    .number()
    .int('La cantidad objetivo debe ser un número entero')
    .positive('La cantidad objetivo debe ser mayor a 0')
    .max(1000000, 'La cantidad objetivo no puede exceder 1,000,000 gramos'),
  observations: z
    .string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional(),
})

export const calculateBatchSchema = z.object({
  formula_id: z.string().uuid('ID de fórmula inválido'),
  target_total_g: z
    .number()
    .int('La cantidad objetivo debe ser un número entero')
    .positive('La cantidad objetivo debe ser mayor a 0')
    .max(1000000, 'La cantidad objetivo no puede exceder 1,000,000 gramos'),
})

export type CreateBatchInput = z.infer<typeof createBatchSchema>
export type CalculateBatchInput = z.infer<typeof calculateBatchSchema>
