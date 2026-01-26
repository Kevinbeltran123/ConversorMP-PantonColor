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
        <h1 className="text-3xl font-bold text-gray-900">Crear Fórmula</h1>
        <div className="mt-8 rounded-md bg-yellow-50 p-4">
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
      <h1 className="text-3xl font-bold text-gray-900">Crear Fórmula</h1>
      <p className="mt-2 text-gray-600">
        {colorResult.data.name} - {product?.name}
      </p>
      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <FormulaForm colorId={id} initialIngredients={ingredientsResult.data} />
      </div>
    </div>
  )
}
