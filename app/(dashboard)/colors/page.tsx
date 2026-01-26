import Link from 'next/link'
import { getColors } from '@/application/use-cases/colors.actions'
import { Button } from '@/components/ui/button'
import { getUserRole } from '@/application/use-cases/roles.actions'

export default async function ColorsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const search = params.search
  const { data: colors, error } = await getColors(search)
  const role = await getUserRole()
  const isAdmin = role === 'admin'

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Colores</h1>
          <p className="mt-2 text-gray-600">Gestión de colores y fórmulas</p>
        </div>
        {isAdmin && (
          <Link href="/colors/new">
            <Button>Crear Color</Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      <div className="mt-8">
        {colors && colors.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-500">No hay colores registrados</p>
            {isAdmin && (
              <Link href="/colors/new">
                <Button className="mt-4">Crear Primer Color</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colors?.map((color) => (
              <Link
                key={color.id}
                href={`/colors/${color.id}`}
                className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{color.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {Array.isArray(color.product) ? color.product[0]?.name : color.product?.name}
                    </p>
                  </div>
                  {color.active ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                      Inactivo
                    </span>
                  )}
                </div>
                {color.notes && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{color.notes}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
