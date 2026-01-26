import { BatchCalculator } from '@/components/batches/batch-calculator'
import { getFormulas } from '@/application/use-cases/formulas.actions'

export default async function NewBatchPage() {
  const formulasResult = await getFormulas()

  if (formulasResult.error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calcular Nuevo Lote</h1>
        <div className="mt-8 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{formulasResult.error}</p>
        </div>
      </div>
    )
  }

  if (!formulasResult.data || formulasResult.data.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calcular Nuevo Lote</h1>
        <div className="mt-8 rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            No hay fórmulas disponibles. Crea al menos una fórmula antes de calcular lotes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calcular Nuevo Lote</h1>
        <p className="mt-2 text-gray-600">
          Selecciona una fórmula e ingresa la cantidad objetivo para calcular el lote
        </p>
      </div>

      <BatchCalculator formulas={formulasResult.data} />
    </div>
  )
}
