import type { FormulaWithItems } from '@/application/dtos/formula.dto'
import { formatQuantity } from '@/lib/utils/scaling'

interface FormulaComparisonProps {
  formula1: FormulaWithItems
  formula2: FormulaWithItems
}

interface IngredientChange {
  ingredientId: string
  ingredientName: string
  status: 'added' | 'removed' | 'modified' | 'unchanged'
  quantity1?: number
  quantity2?: number
  quantityDiff?: number
  percentDiff?: number
}

export function FormulaComparison({ formula1, formula2 }: FormulaComparisonProps) {
  // Determine which is older (v1) and newer (v2)
  const [older, newer] = formula1.version < formula2.version
    ? [formula1, formula2]
    : [formula2, formula1]

  // Build ingredient comparison
  const changes: IngredientChange[] = []
  const allIngredientIds = new Set([
    ...older.items.map((i) => i.ingredient_id),
    ...newer.items.map((i) => i.ingredient_id),
  ])

  allIngredientIds.forEach((ingredientId) => {
    const oldItem = older.items.find((i) => i.ingredient_id === ingredientId)
    const newItem = newer.items.find((i) => i.ingredient_id === ingredientId)

    if (!oldItem && newItem) {
      // Added
      changes.push({
        ingredientId,
        ingredientName: newItem.ingredient.name,
        status: 'added',
        quantity2: newItem.quantity_g,
      })
    } else if (oldItem && !newItem) {
      // Removed
      changes.push({
        ingredientId,
        ingredientName: oldItem.ingredient.name,
        status: 'removed',
        quantity1: oldItem.quantity_g,
      })
    } else if (oldItem && newItem) {
      // Check if modified
      const diff = newItem.quantity_g - oldItem.quantity_g
      const percentDiff = ((diff / oldItem.quantity_g) * 100)

      if (Math.abs(diff) > 0.01) {
        changes.push({
          ingredientId,
          ingredientName: newItem.ingredient.name,
          status: 'modified',
          quantity1: oldItem.quantity_g,
          quantity2: newItem.quantity_g,
          quantityDiff: diff,
          percentDiff,
        })
      } else {
        changes.push({
          ingredientId,
          ingredientName: newItem.ingredient.name,
          status: 'unchanged',
          quantity1: oldItem.quantity_g,
          quantity2: newItem.quantity_g,
        })
      }
    }
  })

  // Sort: removed, added, modified, unchanged
  changes.sort((a, b) => {
    const order = { removed: 0, added: 1, modified: 2, unchanged: 3 }
    return order[a.status] - order[b.status]
  })

  const baseDiff = newer.base_total_g - older.base_total_g
  const baseDiffPercent = ((baseDiff / older.base_total_g) * 100).toFixed(2)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900">
          Comparing Versions
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-gray-600">Version {older.version}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatQuantity(older.base_total_g)}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(older.created_at).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-gray-600">Version {newer.version}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatQuantity(newer.base_total_g)}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(newer.created_at).toLocaleDateString('es-MX')}
            </p>
          </div>
        </div>

        {Math.abs(baseDiff) > 0.01 && (
          <div className="mt-4 rounded-lg bg-yellow-50 p-3">
            <p className="text-sm text-gray-700">
              Base quantity changed by{' '}
              <span className="font-semibold">
                {baseDiff > 0 ? '+' : ''}
                {formatQuantity(Math.abs(baseDiff))}
              </span>{' '}
              ({baseDiff > 0 ? '+' : ''}
              {baseDiffPercent}%)
            </p>
          </div>
        )}
      </div>

      {/* Changes Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">
            {changes.filter((c) => c.status === 'added').length}
          </p>
          <p className="text-sm text-green-600">Added</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">
            {changes.filter((c) => c.status === 'removed').length}
          </p>
          <p className="text-sm text-red-600">Removed</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-4 text-center">
          <p className="text-2xl font-bold text-orange-700">
            {changes.filter((c) => c.status === 'modified').length}
          </p>
          <p className="text-sm text-orange-600">Modified</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">
            {changes.filter((c) => c.status === 'unchanged').length}
          </p>
          <p className="text-sm text-gray-600">Unchanged</p>
        </div>
      </div>

      {/* Detailed Changes Table */}
      <div className="rounded-lg bg-white shadow">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ingredient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  v{older.version}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Change
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  v{newer.version}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {changes.map((change) => {
                let statusBadge
                let rowClass = ''

                switch (change.status) {
                  case 'added':
                    statusBadge = (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Added
                      </span>
                    )
                    rowClass = 'bg-green-50'
                    break
                  case 'removed':
                    statusBadge = (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        Removed
                      </span>
                    )
                    rowClass = 'bg-red-50'
                    break
                  case 'modified':
                    statusBadge = (
                      <span className="inline-flex rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                        Modified
                      </span>
                    )
                    rowClass = 'bg-orange-50'
                    break
                  default:
                    statusBadge = (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                        Unchanged
                      </span>
                    )
                }

                return (
                  <tr key={change.ingredientId} className={rowClass}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {change.ingredientName}
                    </td>
                    <td className="px-6 py-4">{statusBadge}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {change.quantity1 !== undefined
                        ? formatQuantity(change.quantity1)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      {change.status === 'modified' && change.quantityDiff !== undefined && (
                        <div className="font-medium">
                          <div
                            className={
                              change.quantityDiff > 0 ? 'text-green-700' : 'text-red-700'
                            }
                          >
                            {change.quantityDiff > 0 ? '+' : ''}
                            {formatQuantity(Math.abs(change.quantityDiff))}
                          </div>
                          <div className="text-xs text-gray-500">
                            ({change.percentDiff !== undefined && change.percentDiff > 0 ? '+' : ''}
                            {change.percentDiff?.toFixed(1)}%)
                          </div>
                        </div>
                      )}
                      {change.status === 'added' && (
                        <div className="text-green-700">NEW</div>
                      )}
                      {change.status === 'removed' && (
                        <div className="text-red-700">REMOVED</div>
                      )}
                      {change.status === 'unchanged' && (
                        <div className="text-gray-400">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {change.quantity2 !== undefined
                        ? formatQuantity(change.quantity2)
                        : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Comparison */}
      {(older.notes || newer.notes) && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">v{older.version}</p>
              <p className="mt-2 text-sm text-gray-700">
                {older.notes || <span className="italic text-gray-400">No notes</span>}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">v{newer.version}</p>
              <p className="mt-2 text-sm text-gray-700">
                {newer.notes || <span className="italic text-gray-400">No notes</span>}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
