import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getColorById } from '@/application/use-cases/colors.actions'
import { getUserRole } from '@/application/use-cases/roles.actions'
import { Button } from '@/components/ui/button'
import { formatGrams } from '@/lib/utils/units'

export default async function ColorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: color, error } = await getColorById(id)
  const role = await getUserRole()
  const isAdmin = role === 'admin'

  if (error || !color) {
    notFound()
  }

  const product = Array.isArray(color.product) ? color.product[0] : color.product
  const formulas = color.formulas || []

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{color.name}</h1>
          <p className="mt-2 text-gray-600">{product?.name}</p>
        </div>
        <div className="flex gap-3">
          {formulas.length >= 2 && (
            <Link href={`/colors/${id}/compare`}>
              <Button variant="secondary">Comparar Versiones</Button>
            </Link>
          )}
          {isAdmin && (
            <Link href={`/colors/${id}/formulas/new`}>
              <Button>Crear Fórmula</Button>
            </Link>
          )}
        </div>
      </div>

      {color.notes && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-700">{color.notes}</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Fórmulas</h2>

        {formulas.length === 0 ? (
          <div className="mt-4 rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-500">No hay fórmulas registradas para este color</p>
            {isAdmin && (
              <Link href={`/colors/${id}/formulas/new`}>
                <Button className="mt-4">Crear Primera Fórmula</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {formulas.map((formula) => (
              <Link
                key={formula.id}
                href={`/colors/${id}/formulas/${formula.id}`}
                className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Versión {formula.version}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Base: {formatGrams(formula.base_total_g)}
                    </p>
                    {formula.notes && <p className="mt-2 text-sm text-gray-600">{formula.notes}</p>}
                  </div>
                  {formula.is_active && (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Activa
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Creada el {new Date(formula.created_at).toLocaleDateString('es')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
