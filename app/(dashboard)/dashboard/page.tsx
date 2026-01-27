import { getUser } from '@/application/use-cases/auth.actions'
import { getUserRole } from '@/application/use-cases/roles.actions'
import { getDashboardStats } from '@/application/use-cases/dashboard.actions'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const role = await getUserRole()
  const { data: stats, error } = await getDashboardStats()

  const roleName = role === 'admin' ? 'Administrador' : role === 'operator' ? 'Operador' : 'Sin rol'
  const roleColor = role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {role && (
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${roleColor}`}>
            {roleName}
          </span>
        )}
      </div>
      <p className="mt-4 text-gray-600">Bienvenido, {user.email}</p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Colores</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {stats?.colorsCount ?? 0}
          </p>
          <p className="mt-1 text-sm text-gray-500">Total de colores registrados</p>
        </div>
      </div>
    </div>
  )
}
