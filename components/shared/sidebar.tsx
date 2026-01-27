'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/application/use-cases/auth.actions'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Colores', href: '/colors' },
]

// Agregar Debug solo en desarrollo
const isDevelopment = process.env.NODE_ENV === 'development'
const devNavigation = isDevelopment ? [{ name: '🔍 Debug', href: '/debug' }] : []
const allNavigation = [...navigation, ...devNavigation]

export function Sidebar() {
  const pathname = usePathname()

  async function handleLogout() {
    await logout()
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">ConversorMP</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {allNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
