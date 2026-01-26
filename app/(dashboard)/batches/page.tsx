import Link from 'next/link'
import { getBatches } from '@/application/use-cases/batches.actions'
import { Button } from '@/components/ui/button'

export default async function BatchesPage() {
  const { data: batches, error } = await getBatches()

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lotes</h1>
          <p className="mt-2 text-gray-600">Historial de lotes calculados y producidos</p>
        </div>
        <Link href="/batches/new">
          <Button>Calcular Nuevo Lote</Button>
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      <div className="mt-8">
        {batches && batches.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-500">No hay lotes registrados</p>
            <Link href="/batches/new">
              <Button className="mt-4">Calcular Primer Lote</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fórmula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Producto / Color
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Base
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Objetivo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Factor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {batches?.map((batch) => {
                  const formula = Array.isArray(batch.formula) ? batch.formula[0] : batch.formula
                  const color = formula?.color ? (Array.isArray(formula.color) ? formula.color[0] : formula.color) : null
                  const product = color?.product ? (Array.isArray(color.product) ? color.product[0] : color.product) : null

                  return (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          Versión {formula?.version}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{product?.name}</div>
                        <div className="text-sm text-gray-500">{color?.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                        {formula?.base_total_g.toLocaleString()}g
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                        {batch.target_total_g.toLocaleString()}g
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                        {batch.scale_factor.toFixed(4)}x
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(batch.created_at).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <Link
                          href={`/batches/${batch.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver Detalles
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
