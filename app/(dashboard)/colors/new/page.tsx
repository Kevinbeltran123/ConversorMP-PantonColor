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
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Crear Color</h1>
        <div className="mt-6 rounded-md bg-yellow-50 p-4 sm:mt-8">
          <p className="text-sm text-yellow-800">
            No hay productos disponibles. Primero debes crear un producto.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Crear Color</h1>
      <div className="mt-6 rounded-lg bg-white p-4 shadow sm:mt-8 sm:p-6">
        <ColorForm products={products} />
      </div>
    </div>
  )
}
