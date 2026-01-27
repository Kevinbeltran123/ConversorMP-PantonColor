import { redirect } from 'next/navigation'
import { isAdmin } from '@/application/use-cases/roles.actions'
import { getColorById } from '@/application/use-cases/colors.actions'
import { getIngredients } from '@/application/use-cases/ingredients.actions'
import { FormulaForm } from '@/components/shared/formula-form'

export default async function NewFormulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await isAdmin()
  if (!admin) {
    redirect(`/colors/${id}`)
  }

  const [colorResult, ingredientsResult] = await Promise.all([
    getColorById(id),
    getIngredients(),
  ])

  if (colorResult.error || !colorResult.data) {
    redirect('/colors')
  }

  if (!ingredientsResult.data || ingredientsResult.data.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Crear Fórmula</h1>
        <div className="mt-6 rounded-md bg-yellow-50 p-4 sm:mt-8">
          <p className="text-sm text-yellow-800">
            No hay ingredientes disponibles. Los seeds deberían haber creado ingredientes iniciales.
            Verifica que ejecutaste las migraciones correctamente.
          </p>
        </div>
      </div>
    )
  }

  const product = Array.isArray(colorResult.data.product)
    ? colorResult.data.product[0]
    : colorResult.data.product

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Crear Fórmula</h1>
      <p className="mt-2 text-sm text-gray-600 sm:text-base">
        {colorResult.data.name} - {product?.name}
      </p>
      <div className="mt-6 rounded-lg bg-white p-4 shadow sm:mt-8 sm:p-6">
        <FormulaForm colorId={id} initialIngredients={ingredientsResult.data} />
      </div>
    </div>
  )
}
