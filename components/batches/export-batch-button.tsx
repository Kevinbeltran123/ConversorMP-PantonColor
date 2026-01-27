'use client'

import { Button } from '@/components/ui/button'
import { exportBatchToCSV } from '@/lib/utils/csv-export'
import type { BatchWithFormula } from '@/application/dtos/batch.dto'

interface ExportBatchButtonProps {
  batch: BatchWithFormula
}

export function ExportBatchButton({ batch }: ExportBatchButtonProps) {
  const handleExport = () => {
    exportBatchToCSV(batch)
  }

  return (
    <Button variant="secondary" onClick={handleExport}>
      📊 Exportar CSV
    </Button>
  )
}
