"use client";

import { formatQuantity } from "@/lib/utils/scaling";
import type { FormulaWithDetails } from "@/application/dtos/formula.dto";

interface PrintCalculation {
  scaleFactor: number;
  targetTotal: number;
  actualTotal: number;
  roundingDifference: number;
  items: {
    ingredientId: string;
    ingredientName: string;
    scaledQuantity: number;
    position: number;
  }[];
}

interface BatchPrintOrderProps {
  formula: FormulaWithDetails;
  calculation: PrintCalculation;
  batchId?: string;
  observations?: string;
  createdAt?: Date;
  operatorEmail: string;
}

export function BatchPrintOrder({
  formula,
  calculation,
  batchId,
  observations,
  createdAt,
  operatorEmail,
}: BatchPrintOrderProps) {
  const currentDate = createdAt || new Date();

  return (
    <div className="print-container max-w-4xl mx-auto bg-white p-8">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">
          ORDEN DE MEZCLA
        </h1>
        {batchId && (
          <p className="text-center text-sm text-gray-600">
            Lote #{batchId.slice(0, 8).toUpperCase()}
          </p>
        )}
      </div>

      {/* General Information */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold text-gray-600">Producto:</p>
          <p className="text-lg font-bold">{formula.product?.name || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600">Color:</p>
          <p className="text-lg font-bold">{formula.color?.name || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600">Versión:</p>
          <p className="text-lg">v{formula.version}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600">Fecha:</p>
          <p className="text-lg">
            {currentDate.toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600">Operador:</p>
          <p className="text-lg">{operatorEmail}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600">
            Cantidad Objetivo:
          </p>
          <p className="text-lg font-bold text-blue-600">
            {formatQuantity(calculation.targetTotal)}
          </p>
        </div>
      </div>

      {/* Scaling Information */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 print:bg-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Cantidad Base:</p>
            <p className="font-semibold">{formatQuantity(formula.base_total_g)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Factor de Escalado:</p>
            <p className="font-semibold">{calculation.scaleFactor.toFixed(4)}</p>
          </div>
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-2">
          Ingredientes
        </h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                #
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Ingrediente
              </th>
              <th className="border border-gray-300 px-4 py-2 text-right">
                Cantidad
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center w-24">
                ✓
              </th>
            </tr>
          </thead>
          <tbody>
            {calculation.items.map((item, index) => (
              <tr key={item.ingredientId} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-medium">
                  {index + 1}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {item.ingredientName}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                  {formatQuantity(item.scaledQuantity)}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {/* Checkbox for manual verification */}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td
                colSpan={2}
                className="border border-gray-300 px-4 py-3 text-right"
              >
                TOTAL:
              </td>
              <td className="border border-gray-300 px-4 py-3 text-right">
                {formatQuantity(calculation.actualTotal)}
              </td>
              <td className="border border-gray-300 px-4 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Rounding Difference Warning */}
      {calculation.roundingDifference !== 0 && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-300 rounded print:border-yellow-600">
          <p className="text-sm">
            <span className="font-semibold">Diferencia por redondeo:</span>{" "}
            {calculation.roundingDifference > 0 ? "+" : ""}
            {formatQuantity(Math.abs(calculation.roundingDifference))}
          </p>
        </div>
      )}

      {/* Observations */}
      {observations && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Observaciones:</h3>
          <div className="border border-gray-300 p-4 rounded min-h-[80px] whitespace-pre-wrap">
            {observations}
          </div>
        </div>
      )}

      {/* Signature Section */}
      <div className="mt-12 pt-6 border-t border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-8">Preparado por:</p>
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm text-center">{operatorEmail}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-8">Verificado por:</p>
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm text-center text-gray-400">Firma</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>
          Sistema de Gestión de Fórmulas - Generado el{" "}
          {new Date().toLocaleString("es-ES")}
        </p>
      </div>
    </div>
  );
}
