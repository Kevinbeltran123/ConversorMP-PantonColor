import { logout } from '@/application/use-cases/auth.actions'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-white">
      <header className="border-b border-black/10 bg-gradient-to-r from-black via-gray-900 to-red-700 text-white">
        <div className="flex w-full items-center justify-between px-8 py-5">
          <div>
            <p className="text-lg font-semibold text-white">Sistema de Fórmulas Panton Color</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="px-8 py-10">
        <div className="w-full max-w-none">{children}</div>
      </main>
    </div>
  )
}
