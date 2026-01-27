import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getFormulasByColorId } from '@/application/use-cases/formulas.actions'
import { getColorById } from '@/application/use-cases/colors.actions'
import { FormulaComparison } from '@/components/formulas/formula-comparison'
import { Button } from '@/components/ui/button'

interface ComparePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ v1?: string; v2?: string }>
}

export default async function ComparePage({ params, searchParams }: ComparePageProps) {
  const { id } = await params
  const { v1, v2 } = await searchParams

  // Get color and formulas
  const { data: color, error: colorError } = await getColorById(id)
  const { data: formulas, error: formulasError } = await getFormulasByColorId(id)

  if (colorError || formulasError || !color || !formulas) {
    notFound()
  }

  // If no versions specified, show selection form
  if (!v1 || !v2) {
    return (
      <div>
        <Link
          href={`/colors/${id}`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to {color.name}
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900">Compare Versions</h1>
          <p className="mt-2 text-gray-600">
            Select two versions of {color.name} to compare
          </p>
        </div>

        {formulas.length < 2 ? (
          <div className="mt-8 rounded-lg bg-yellow-50 p-6 text-center">
            <p className="text-gray-700">
              This color needs at least 2 versions to compare.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Currently has {formulas.length} version(s).
            </p>
          </div>
        ) : (
          <form className="mt-8 rounded-lg bg-white p-6 shadow">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Version 1
                </label>
                <select
                  name="v1"
                  className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select version...</option>
                  {formulas.map((formula) => (
                    <option key={formula.id} value={formula.id}>
                      v{formula.version} - {new Date(formula.created_at).toLocaleDateString('es-MX')}{' '}
                      {formula.is_active && '(Active)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Version 2
                </label>
                <select
                  name="v2"
                  className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select version...</option>
                  {formulas.map((formula) => (
                    <option key={formula.id} value={formula.id}>
                      v{formula.version} - {new Date(formula.created_at).toLocaleDateString('es-MX')}{' '}
                      {formula.is_active && '(Active)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Link href={`/colors/${id}`}>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Compare</Button>
            </div>
          </form>
        )}
      </div>
    )
  }

  // Find the two formulas to compare
  const formula1 = formulas.find((f) => f.id === v1)
  const formula2 = formulas.find((f) => f.id === v2)

  if (!formula1 || !formula2) {
    redirect(`/colors/${id}/compare`)
  }

  if (formula1.id === formula2.id) {
    return (
      <div>
        <Link
          href={`/colors/${id}/compare`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to selection
        </Link>
        <div className="mt-8 rounded-lg bg-red-50 p-6 text-center">
          <p className="text-gray-700">Cannot compare a version with itself.</p>
          <p className="mt-2 text-sm text-gray-600">
            Please select two different versions.
          </p>
        </div>
      </div>
    )
  }

  const product = Array.isArray(color.product) ? color.product[0] : color.product

  return (
    <div>
      <Link
        href={`/colors/${id}`}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        ← Back to {color.name}
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {product?.name} - {color.name}
        </h1>
        <p className="mt-2 text-gray-600">Formula Version Comparison</p>
      </div>

      <div className="mt-8">
        <FormulaComparison formula1={formula1} formula2={formula2} />
      </div>

      <div className="mt-6 flex justify-between">
        <Link href={`/colors/${id}/compare`}>
          <Button variant="secondary">Compare Different Versions</Button>
        </Link>
        <Link href={`/colors/${id}`}>
          <Button variant="secondary">Back to Color</Button>
        </Link>
      </div>
    </div>
  )
}
