import { describe, it, expect } from 'vitest'

describe('Example Test Suite', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const color = 'Azul Cielo'
    expect(color.toLowerCase()).toBe('azul cielo')
  })

  it('should convert kg to grams', () => {
    const kg = 200
    const grams = kg * 1000
    expect(grams).toBe(200000)
  })
})
