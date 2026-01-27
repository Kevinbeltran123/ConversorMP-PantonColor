'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImageFile(null)
      setImagePreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    // Agregar el archivo de imagen si existe
    if (imageFile) {
      formData.set('image', imageFile)
    }

    const result = await createColor(formData)

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
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Imagen del Color (opcional)
        </label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-gray-500">
          Formatos: JPG, PNG, WebP. Tamaño máximo: 5MB
        </p>
      </div>

      {imagePreview && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Vista previa</label>
          <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={imagePreview}
              alt="Vista previa"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      )}

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
