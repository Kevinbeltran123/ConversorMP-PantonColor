'use client'

import { useRouter } from 'next/navigation'

interface PrintButtonProps {
  batchId?: string
}

export function PrintButton({ batchId }: PrintButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => {
        if (!batchId) {
          router.back()
          return
        }
        router.push(`/batches/${batchId}/print`)
      }}
      className="rounded-lg bg-red-600 px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-red-700"
    >
      🖨️ Imprimir
    </button>
  )
}

export function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="rounded-lg border border-gray-300 px-4 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
    >
      Volver
    </button>
  )
}
