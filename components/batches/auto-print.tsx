'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface AutoPrintProps {
  backHref?: string
}

export function AutoPrint({ backHref }: AutoPrintProps) {
  const router = useRouter()

  useEffect(() => {
    // Abre el diálogo de impresión automáticamente al entrar a la página.
    window.print()
  }, [])

  return (
    <div className="no-print mb-4 flex flex-wrap gap-3">
      <Button onClick={() => window.print()} className="px-4 py-2 text-base font-semibold">
        🖨️ Imprimir
      </Button>
      {backHref && (
        <Button
          variant="secondary"
          onClick={() => router.push(backHref)}
          className="px-4 py-2 text-base font-semibold"
        >
          Volver
        </Button>
      )}
    </div>
  )
}

