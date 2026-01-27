import { describe, it, expect } from 'vitest'
import {
  calculateScaleFactor,
  scaleQuantity,
  scaleFormulaItems,
  calculateScaledTotal,
  calculateRoundingDifference,
  isRoundingAcceptable,
  calculateBatch,
  formatRoundingDifference,
  getRoundingStatusColor,
} from '../scaling'
import type { FormulaItemWithIngredient } from '@/application/dtos/formula.dto'

describe('Scaling Calculations', () => {
  describe('calculateScaleFactor', () => {
    it('should calculate scale factor correctly for scaling up', () => {
      const result = calculateScaleFactor(200, 20000)
      expect(result).toBe(100)
    })

    it('should calculate scale factor correctly for scaling down', () => {
      const result = calculateScaleFactor(20000, 200)
      expect(result).toBe(0.01)
    })

    it('should handle same base and target', () => {
      const result = calculateScaleFactor(1000, 1000)
      expect(result).toBe(1)
    })

    it('should throw error for zero base amount', () => {
      expect(() => calculateScaleFactor(0, 1000)).toThrow('Base amount must be greater than 0')
    })

    it('should throw error for negative base amount', () => {
      expect(() => calculateScaleFactor(-100, 1000)).toThrow('Base amount must be greater than 0')
    })

    it('should throw error for zero target amount', () => {
      expect(() => calculateScaleFactor(1000, 0)).toThrow('Target amount must be greater than 0')
    })

    it('should throw error for negative target amount', () => {
      expect(() => calculateScaleFactor(1000, -100)).toThrow(
        'Target amount must be greater than 0'
      )
    })
  })

  describe('scaleQuantity', () => {
    it('should scale quantity and preserve decimals (2 places)', () => {
      expect(scaleQuantity(100, 2.5)).toBe(250)
      expect(scaleQuantity(100, 0.125)).toBe(12.5)
      expect(scaleQuantity(1.5, 10)).toBe(15)
    })

    it('should round to 2 decimal places', () => {
      expect(scaleQuantity(100, 1.004)).toBe(100.4)
      expect(scaleQuantity(100, 1.006)).toBe(100.6)
      expect(scaleQuantity(100, 0.01234)).toBe(1.23) // 1.234 rounds to 1.23
    })

    it('should handle very small quantities', () => {
      expect(scaleQuantity(0.5, 0.1)).toBe(0.05)
      expect(scaleQuantity(1, 0.01)).toBe(0.01)
      expect(scaleQuantity(2.5, 0.1)).toBe(0.25)
    })

    it('should handle scaling down', () => {
      expect(scaleQuantity(1000, 0.1)).toBe(100)
      expect(scaleQuantity(1000, 0.05)).toBe(50)
    })

    it('should handle scale factor of 1', () => {
      expect(scaleQuantity(500, 1)).toBe(500)
      expect(scaleQuantity(1.25, 1)).toBe(1.25)
    })
  })

  describe('scaleFormulaItems', () => {
    const mockFormulaItems: FormulaItemWithIngredient[] = [
      {
        id: '1',
        formula_id: 'f1',
        ingredient_id: 'i1',
        quantity_g: 100,
        position: 0,
        ingredient: {
          id: 'i1',
          name: 'Ingredient A',
          description: null,
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          created_by: null,
          updated_by: null,
        },
      },
      {
        id: '2',
        formula_id: 'f1',
        ingredient_id: 'i2',
        quantity_g: 50,
        position: 1,
        ingredient: {
          id: 'i2',
          name: 'Ingredient B',
          description: null,
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          created_by: null,
          updated_by: null,
        },
      },
    ]

    it('should scale all formula items correctly', () => {
      const result = scaleFormulaItems(mockFormulaItems, 2)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        ingredient_id: 'i1',
        ingredient_name: 'Ingredient A',
        original_quantity_g: 100,
        scaled_quantity_g: 200,
        position: 0,
      })
      expect(result[1]).toEqual({
        ingredient_id: 'i2',
        ingredient_name: 'Ingredient B',
        original_quantity_g: 50,
        scaled_quantity_g: 100,
        position: 1,
      })
    })

    it('should handle scaling down', () => {
      const result = scaleFormulaItems(mockFormulaItems, 0.5)

      expect(result[0].scaled_quantity_g).toBe(50)
      expect(result[1].scaled_quantity_g).toBe(25)
    })

    it('should preserve position', () => {
      const result = scaleFormulaItems(mockFormulaItems, 1.5)

      expect(result[0].position).toBe(0)
      expect(result[1].position).toBe(1)
    })
  })

  describe('calculateScaledTotal', () => {
    it('should sum all scaled quantities', () => {
      const scaledItems = [
        {
          ingredient_id: 'i1',
          ingredient_name: 'A',
          original_quantity_g: 100,
          scaled_quantity_g: 200,
          position: 0,
        },
        {
          ingredient_id: 'i2',
          ingredient_name: 'B',
          original_quantity_g: 50,
          scaled_quantity_g: 100,
          position: 1,
        },
      ]

      expect(calculateScaledTotal(scaledItems)).toBe(300)
    })

    it('should return 0 for empty array', () => {
      expect(calculateScaledTotal([])).toBe(0)
    })
  })

  describe('calculateRoundingDifference', () => {
    it('should calculate positive difference when target is greater', () => {
      expect(calculateRoundingDifference(1000, 998)).toBe(2)
    })

    it('should calculate negative difference when target is less', () => {
      expect(calculateRoundingDifference(1000, 1002)).toBe(-2)
    })

    it('should return 0 when target equals actual', () => {
      expect(calculateRoundingDifference(1000, 1000)).toBe(0)
    })
  })

  describe('isRoundingAcceptable', () => {
    it('should accept difference of 0', () => {
      expect(isRoundingAcceptable(0, 1000)).toBe(true)
    })

    it('should accept difference within 1% by default', () => {
      expect(isRoundingAcceptable(10, 1000)).toBe(true) // 1%
      expect(isRoundingAcceptable(-10, 1000)).toBe(true) // -1%
    })

    it('should reject difference greater than 1% by default', () => {
      expect(isRoundingAcceptable(11, 1000)).toBe(false) // 1.1%
      expect(isRoundingAcceptable(-11, 1000)).toBe(false) // -1.1%
    })

    it('should respect custom percentage threshold', () => {
      expect(isRoundingAcceptable(20, 1000, 2)).toBe(true) // 2% with 2% threshold
      expect(isRoundingAcceptable(21, 1000, 2)).toBe(false) // 2.1% with 2% threshold
    })

    it('should handle small target amounts', () => {
      expect(isRoundingAcceptable(1, 100, 1)).toBe(true) // 1% of 100
      expect(isRoundingAcceptable(2, 100, 1)).toBe(false) // 2% of 100
    })
  })

  describe('calculateBatch', () => {
    const mockFormulaItems: FormulaItemWithIngredient[] = [
      {
        id: '1',
        formula_id: 'f1',
        ingredient_id: 'i1',
        quantity_g: 100,
        position: 0,
        ingredient: {
          id: 'i1',
          name: 'Base',
          description: null,
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          created_by: null,
          updated_by: null,
        },
      },
      {
        id: '2',
        formula_id: 'f1',
        ingredient_id: 'i2',
        quantity_g: 50,
        position: 1,
        ingredient: {
          id: 'i2',
          name: 'Colorant',
          description: null,
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          created_by: null,
          updated_by: null,
        },
      },
    ]

    it('should calculate complete batch correctly', () => {
      const result = calculateBatch('f1', 150, 1500, mockFormulaItems)

      expect(result.formula_id).toBe('f1')
      expect(result.base_total_g).toBe(150)
      expect(result.target_total_g).toBe(1500)
      expect(result.scale_factor).toBe(10)
      expect(result.items).toHaveLength(2)
      expect(result.items[0].scaled_quantity_g).toBe(1000) // 100 * 10
      expect(result.items[1].scaled_quantity_g).toBe(500) // 50 * 10
      expect(result.total_scaled_g).toBe(1500)
      expect(result.rounding_difference_g).toBe(0)
    })

    it('should handle rounding differences', () => {
      // Create a scenario where rounding creates a difference
      const items: FormulaItemWithIngredient[] = [
        {
          id: '1',
          formula_id: 'f1',
          ingredient_id: 'i1',
          quantity_g: 33,
          position: 0,
          ingredient: {
            id: 'i1',
            name: 'A',
            description: null,
            active: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            created_by: null,
            updated_by: null,
          },
        },
        {
          id: '2',
          formula_id: 'f1',
          ingredient_id: 'i2',
          quantity_g: 33,
          position: 1,
          ingredient: {
            id: 'i2',
            name: 'B',
            description: null,
            active: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            created_by: null,
            updated_by: null,
          },
        },
        {
          id: '3',
          formula_id: 'f1',
          ingredient_id: 'i3',
          quantity_g: 34,
          position: 2,
          ingredient: {
            id: 'i3',
            name: 'C',
            description: null,
            active: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            created_by: null,
            updated_by: null,
          },
        },
      ]

      const result = calculateBatch('f1', 100, 1000, items)

      // Scale factor should be 10
      expect(result.scale_factor).toBe(10)
      // 33*10=330, 33*10=330, 34*10=340 => total 1000 (perfect)
      expect(result.total_scaled_g).toBe(1000)
      expect(result.rounding_difference_g).toBe(0)
    })
  })

  describe('formatRoundingDifference', () => {
    it('should format positive difference with + sign', () => {
      expect(formatRoundingDifference(5)).toBe('+5g')
    })

    it('should format negative difference with - sign', () => {
      expect(formatRoundingDifference(-5)).toBe('-5g')
    })

    it('should format zero with + sign', () => {
      expect(formatRoundingDifference(0)).toBe('+0g')
    })
  })

  describe('getRoundingStatusColor', () => {
    it('should return green for zero difference', () => {
      expect(getRoundingStatusColor(0, 1000)).toBe('text-green-600')
    })

    it('should return green for difference within 0.5%', () => {
      expect(getRoundingStatusColor(5, 1000)).toBe('text-green-600') // 0.5%
      expect(getRoundingStatusColor(-5, 1000)).toBe('text-green-600') // -0.5%
    })

    it('should return yellow for difference between 0.5% and 1%', () => {
      expect(getRoundingStatusColor(7, 1000)).toBe('text-yellow-600') // 0.7%
      expect(getRoundingStatusColor(-10, 1000)).toBe('text-yellow-600') // -1%
    })

    it('should return red for difference greater than 1%', () => {
      expect(getRoundingStatusColor(11, 1000)).toBe('text-red-600') // 1.1%
      expect(getRoundingStatusColor(-15, 1000)).toBe('text-red-600') // -1.5%
    })
  })
})

describe('Scaling Integration Tests', () => {
  it('should handle real-world scenario: scaling 200kg formula to 20kg batch', () => {
    const formulaItems: FormulaItemWithIngredient[] = [
      {
        id: '1',
        formula_id: 'f1',
        ingredient_id: 'i1',
        quantity_g: 150000, // 150kg base
        position: 0,
        ingredient: {
          id: 'i1',
          name: 'Resina',
          description: null,
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          created_by: null,
          updated_by: null,
        },
      },
      {
        id: '2',
        formula_id: 'f1',
        ingredient_id: 'i2',
        quantity_g: 40000, // 40kg pigment
        position: 1,
        ingredient: {
          id: 'i2',
          name: 'Pigmento Azul',
          description: null,
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          created_by: null,
          updated_by: null,
        },
      },
      {
        id: '3',
        formula_id: 'f1',
        ingredient_id: 'i3',
        quantity_g: 10000, // 10kg additives
        position: 2,
        ingredient: {
          id: 'i3',
          name: 'Aditivos',
          description: null,
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          created_by: null,
          updated_by: null,
        },
      },
    ]

    const baseTotal = 200000 // 200kg
    const targetTotal = 20000 // 20kg

    const result = calculateBatch('f1', baseTotal, targetTotal, formulaItems)

    expect(result.scale_factor).toBe(0.1) // 20kg / 200kg
    expect(result.items[0].scaled_quantity_g).toBe(15000) // 150kg * 0.1 = 15kg
    expect(result.items[1].scaled_quantity_g).toBe(4000) // 40kg * 0.1 = 4kg
    expect(result.items[2].scaled_quantity_g).toBe(1000) // 10kg * 0.1 = 1kg
    expect(result.total_scaled_g).toBe(20000) // 20kg total
    expect(result.rounding_difference_g).toBe(0) // Perfect scaling
    expect(isRoundingAcceptable(result.rounding_difference_g, targetTotal)).toBe(true)
  })

  it('should handle edge case with small quantities and rounding', () => {
    const formulaItems: FormulaItemWithIngredient[] = [
      {
        id: '1',
        formula_id: 'f1',
        ingredient_id: 'i1',
        quantity_g: 333,
        position: 0,
        ingredient: {
          id: 'i1',
          name: 'A',
          description: null,
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          created_by: null,
          updated_by: null,
        },
      },
      {
        id: '2',
        formula_id: 'f1',
        ingredient_id: 'i2',
        quantity_g: 333,
        position: 1,
        ingredient: {
          id: 'i2',
          name: 'B',
          description: null,
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          created_by: null,
          updated_by: null,
        },
      },
      {
        id: '3',
        formula_id: 'f1',
        ingredient_id: 'i3',
        quantity_g: 334,
        position: 2,
        ingredient: {
          id: 'i3',
          name: 'C',
          description: null,
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          created_by: null,
          updated_by: null,
        },
      },
    ]

    const baseTotal = 1000
    const targetTotal = 3333

    const result = calculateBatch('f1', baseTotal, targetTotal, formulaItems)

    expect(result.scale_factor).toBeCloseTo(3.333, 3)
    // 333 * 3.333 = 1109.889 rounds to 1110
    // 333 * 3.333 = 1109.889 rounds to 1110
    // 334 * 3.333 = 1113.222 rounds to 1113
    // Total = 3333 (exact!)
    expect(result.total_scaled_g).toBe(3333)
    expect(result.rounding_difference_g).toBe(0)
  })
})
