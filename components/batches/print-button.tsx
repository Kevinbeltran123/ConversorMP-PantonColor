"use client";

import { useRouter } from "next/navigation";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
    >
      🖨️ Imprimir
    </button>
  );
}

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      Volver
    </button>
  );
}
