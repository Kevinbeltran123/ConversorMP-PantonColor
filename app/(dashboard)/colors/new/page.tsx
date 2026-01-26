import { redirect } from 'next/navigation'
import { isAdmin } from '@/application/use-cases/roles.actions'
import { getProducts } from '@/application/use-cases/colors.actions'
import { ColorForm } from '@/components/shared/color-form'

export default async function NewColorPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect('/colors')
  }

  const { data: products } = await getProducts()

  if (!products || products.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Crear Color</h1>
        <div className="mt-8 rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            No hay productos disponibles. Primero debes crear un producto.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Crear Color</h1>
      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <ColorForm products={products} />
      </div>
    </div>
  )
}
