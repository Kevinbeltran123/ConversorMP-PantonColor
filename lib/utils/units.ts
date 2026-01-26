// =====================================================
// UNIT CONVERSION UTILITIES
// =====================================================

const GRAMS_PER_KG = 1000

/**
 * Convierte kilogramos a gramos
 */
export function kgToGrams(kg: number): number {
  return Math.round(kg * GRAMS_PER_KG)
}

/**
 * Convierte gramos a kilogramos
 */
export function gramsToKg(grams: number): number {
  return grams / GRAMS_PER_KG
}

/**
 * Formatea gramos para mostrar en UI
 * Si >= 1000g, muestra en kg con 2 decimales
 * Si < 1000g, muestra en gramos
 */
export function formatGrams(grams: number): string {
  if (grams >= GRAMS_PER_KG) {
    const kg = gramsToKg(grams)
    return `${kg.toFixed(2)} kg`
  }
  return `${grams} g`
}

/**
 * Parsea input de usuario (puede ser "200" o "200kg" o "1.5kg" o "500g")
 * Retorna cantidad en gramos
 */
export function parseQuantityInput(input: string): number {
  const trimmed = input.trim().toLowerCase()

  // Extraer número y unidad
  const match = trimmed.match(/^([\d.]+)\s*(kg|g)?$/)
  if (!match) {
    throw new Error('Formato inválido. Use: 200, 200g, 1.5kg')
  }

  const value = parseFloat(match[1])
  const unit = match[2] || 'g' // Por defecto gramos

  if (isNaN(value) || value <= 0) {
    throw new Error('La cantidad debe ser mayor a 0')
  }

  return unit === 'kg' ? kgToGrams(value) : Math.round(value)
}
