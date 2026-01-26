'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFormula } from '@/application/use-cases/formulas.actions'
import { createIngredient } from '@/application/use-cases/ingredients.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseQuantityInput } from '@/lib/utils/units'
import type { Ingredient } from '@/domain/entities/database.types'

interface FormulaFormProps {
  colorId: string
  initialIngredients: Ingredient[]
}

interface FormulaIngredient {
  ingredient_id: string
  quantity_g: number
  temp_id: string
}

export function FormulaForm({ colorId, initialIngredients }: FormulaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [baseTotal, setBaseTotal] = useState('')
  const [items, setItems] = useState<FormulaIngredient[]>([])
  const [ingredients, setIngredients] = useState(initialIngredients)
  const [newIngredientName, setNewIngredientName] = useState('')

  const addItem = () => {
    setItems([
      ...items,
      {
        ingredient_id: ingredients[0]?.id || '',
        quantity_g: 0,
        temp_id: `temp-${Date.now()}`,
      },
    ])
  }

  const removeItem = (tempId: string) => {
    setItems(items.filter((item) => item.temp_id !== tempId))
  }

  const updateItem = (tempId: string, field: 'ingredient_id' | 'quantity_g', value: string | number) => {
    setItems(
      items.map((item) =>
        item.temp_id === tempId ? { ...item, [field]: value } : item
      )
    )
  }

  const handleCreateIngredient = async () => {
    if (!newIngredientName.trim()) return

    const result = await createIngredient({ name: newIngredientName.trim() })
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setIngredients([...ingredients, result.data])
      setNewIngredientName('')
      setError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const baseTotalG = parseQuantityInput(baseTotal)

      const formulaItems = items.map((item, index) => ({
        ingredient_id: item.ingredient_id,
        quantity_g: item.quantity_g,
        position: index,
      }))

      const result = await createFormula({
        color_id: colorId,
        base_total_g: baseTotalG,
        items: formulaItems,
        is_active: true,
      })

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        router.push(`/colors/${colorId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear fórmula')
      setLoading(false)
    }
  }

  const totalIngredients = items.reduce((sum, item) => sum + item.quantity_g, 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Cantidad Base Total"
        value={baseTotal}
        onChange={(e) => setBaseTotal(e.target.value)}
        placeholder="Ej: 200kg o 200000g"
        required
        helperText="Puede usar kg o g. Ej: 200kg = 200000g"
      />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Ingredientes</h3>
          <Button type="button" onClick={addItem} size="sm">
            + Agregar Ingrediente
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No hay ingredientes. Haz clic en &ldquo;Agregar Ingrediente&rdquo;</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.temp_id} className="flex gap-4">
                <select
                  value={item.ingredient_id}
                  onChange={(e) => updateItem(item.temp_id, 'ingredient_id', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.quantity_g || ''}
                  onChange={(e) => updateItem(item.temp_id, 'quantity_g', parseInt(e.target.value) || 0)}
                  placeholder="Cantidad (g)"
                  className="w-32 rounded-md border border-gray-300 px-3 py-2"
                  required
                  min="1"
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeItem(item.temp_id)}
                >
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-md bg-blue-50 p-3">
          <p className="text-sm text-blue-900">Total ingredientes: {totalIngredients} g</p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="text-sm font-medium text-gray-900">Crear Nuevo Ingrediente</h4>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newIngredientName}
            onChange={(e) => setNewIngredientName(e.target.value)}
            placeholder="Nombre del ingrediente"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <Button type="button" onClick={handleCreateIngredient} size="sm">
            Crear
          </Button>
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || items.length === 0}>
          {loading ? 'Creando...' : 'Crear Fórmula'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
