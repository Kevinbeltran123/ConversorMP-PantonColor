import Link from 'next/link'
import Image from 'next/image'
import { getColors } from '@/application/use-cases/colors.actions'
import { Button } from '@/components/ui/button'
import { getUserRole } from '@/application/use-cases/roles.actions'
import { ColorsSearch } from '@/components/colors/colors-search'

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
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200/80 bg-white p-7 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-950">Colores</h1>
            <p className="mt-1 text-sm text-gray-600">
              Selecciona un color para ver sus fórmulas y generar un lote.
            </p>
          </div>
          {isAdmin && (
            <Link href="/colors/new">
              <Button>Crear Color</Button>
            </Link>
          )}
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">Buscar color</label>
          <ColorsSearch defaultValue={search || ''} />
        </div>
      </section>

      {colors && colors.length > 0 && (
        <p className="text-sm text-gray-600">
          {colors.length} {colors.length === 1 ? 'color encontrado' : 'colores encontrados'}
        </p>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      <section>
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
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {colors?.map((color) => {
              const productName = Array.isArray(color.product)
                ? color.product[0]?.name
                : color.product?.name

              return (
                <Link
                  key={color.id}
                  href={`/colors/${color.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_18px_38px_rgba(185,28,28,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  {color.image_url ? (
                    <div className="relative h-56 w-full bg-gray-100">
                      <Image
                        src={color.image_url}
                        alt={color.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-white">
                      <p className="text-sm font-semibold text-gray-400">Sin imagen</p>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-950">{color.name}</h2>
                        <p className="mt-1 text-sm text-gray-500">{productName}</p>
                      </div>
                      {color.active ? (
                        <span className="inline-flex shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          Inactivo
                        </span>
                      )}
                    </div>

                    {color.notes ? (
                      <p className="text-sm leading-6 text-gray-600">{color.notes}</p>
                    ) : (
                      <p className="text-sm text-gray-400">Sin notas</p>
                    )}

                    <div className="mt-2 text-sm font-semibold text-red-600 group-hover:text-red-700">
                      Ver fórmulas →
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
