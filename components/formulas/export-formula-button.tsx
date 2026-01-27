'use client'

import { Button } from '@/components/ui/button'
import { exportFormulaToCSV } from '@/lib/utils/csv-export'
import type { FormulaWithDetails } from '@/application/dtos/formula.dto'

interface ExportFormulaButtonProps {
  formula: FormulaWithDetails
}

export function ExportFormulaButton({ formula }: ExportFormulaButtonProps) {
  const handleExport = () => {
    exportFormulaToCSV(formula)
  }

  return (
    <Button variant="secondary" onClick={handleExport}>
      📊 Exportar CSV
    </Button>
  )
}
