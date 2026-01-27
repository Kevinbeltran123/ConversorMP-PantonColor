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
    <div className="space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <p className="text-lg font-semibold tracking-wide text-red-600">Color</p>
            <h1 className="mt-1 text-3xl font-semibold text-gray-950">{color.name}</h1>
            <p className="mt-1 text-sm text-gray-600">{product?.name}</p>

            {color.notes && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-sm leading-6 text-gray-700">{color.notes}</p>
              </div>
            )}
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {formulas.length >= 2 && (
              <Link href={`/colors/${id}/compare`} className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Comparar Versiones
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link href={`/colors/${id}/formulas/new`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">Crear Fórmula</Button>
              </Link>
            )}
          </div>
        </div>

        {color.image_url && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
            <div className="relative h-72 w-full bg-gray-100">
              <img
                src={color.image_url}
                alt={color.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-950">Fórmulas</h2>
            <p className="mt-1 text-sm text-gray-600">
              Elige una versión para ver ingredientes y generar un lote.
            </p>
          </div>
          {formulas.length > 0 && (
            <p className="text-sm font-medium text-gray-600">
              {formulas.length} {formulas.length === 1 ? 'versión' : 'versiones'}
            </p>
          )}
        </div>

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
          <div className="space-y-4">
            {formulas.map((formula) => (
              <Link
                key={formula.id}
                href={`/colors/${id}/formulas/${formula.id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_18px_38px_rgba(185,28,28,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-gray-900">Versión {formula.version}</p>
                    <p className="text-base font-medium text-gray-800">
                      Base: {formatGrams(formula.base_total_g)}
                    </p>
                    {formula.notes ? (
                      <p className="text-sm leading-6 text-gray-600">{formula.notes}</p>
                    ) : (
                      <p className="text-sm text-gray-400">Sin notas</p>
                    )}
                  </div>
                  {formula.is_active && (
                    <span className="inline-flex h-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                      Activa
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <p>Creada el {new Date(formula.created_at).toLocaleDateString('es-MX')}</p>
                  <p className="font-semibold text-red-600">Ver detalle →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
