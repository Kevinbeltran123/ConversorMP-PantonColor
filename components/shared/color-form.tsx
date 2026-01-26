'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createColor } from '@/application/use-cases/colors.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Product } from '@/domain/entities/database.types'

interface ColorFormProps {
  products: Product[]
}

export function ColorForm({ products }: ColorFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createColor({
      product_id: formData.get('product_id') as string,
      name: formData.get('name') as string,
      notes: formData.get('notes') as string,
      active: true,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/colors/${result.data.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Producto</label>
        <select
          name="product_id"
          required
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <Input name="name" label="Nombre del Color" required placeholder="Ej: Azul Cielo" />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Notas (opcional)</label>
        <textarea
          name="notes"
          rows={3}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Notas adicionales sobre este color"
        />
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Color'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
