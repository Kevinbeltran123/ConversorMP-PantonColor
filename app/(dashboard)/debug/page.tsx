import { createClient } from '@/infrastructure/supabase/server'
import { getUserRole, isAdmin } from '@/application/use-cases/roles.actions'

export default async function DebugPage() {
  const supabase = await createClient()

  // 1. Obtener usuario actual
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // 2. Verificar rol desde función helper
  const role = await getUserRole()
  const admin = await isAdmin()

  // 3. Verificar rol directo desde tabla
  let directRole = null
  let directRoleError = null
  if (user) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    directRole = data
    directRoleError = error
  }

  // 4. Intentar leer colors
  const { data: colors, error: colorsError } = await supabase.from('colors').select('*').limit(5)

  // 5. Verificar políticas (esto requiere permisos especiales)
  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('schemaname', 'public')
    .eq('tablename', 'colors')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Diagnóstico RLS</h1>

      {/* Usuario actual */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">1. Usuario Autenticado</h2>
        {userError ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">❌ Error: {userError.message}</p>
          </div>
        ) : user ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>✅ User ID:</strong> {user.id}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        ) : (
          <p className="text-sm text-yellow-800">⚠️ No hay usuario autenticado</p>
        )}
      </section>

      {/* Rol desde función helper */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">2. Rol desde función helper</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>getUserRole():</strong> {role || 'null'}
          </p>
          <p>
            <strong>isAdmin():</strong> {admin ? '✅ true' : '❌ false'}
          </p>
        </div>
      </section>

      {/* Rol directo desde tabla */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">3. Rol directo desde user_roles</h2>
        {directRoleError ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">❌ Error: {directRoleError.message}</p>
          </div>
        ) : directRole ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>✅ Rol:</strong> {directRole.role}
            </p>
            <p>
              <strong>User ID:</strong> {directRole.user_id}
            </p>
            <p>
              <strong>Creado:</strong> {new Date(directRole.created_at).toLocaleString('es')}
            </p>
          </div>
        ) : (
          <p className="text-sm text-yellow-800">⚠️ No se encontró rol en la tabla</p>
        )}
      </section>

      {/* Lectura de colors */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">4. Lectura de tabla colors</h2>
        {colorsError ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">❌ Error: {colorsError.message}</p>
            <p className="mt-2 text-xs text-red-600">
              Code: {colorsError.code} | Details: {colorsError.details}
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <strong>✅ Colores encontrados:</strong> {colors?.length || 0}
            </p>
            {colors && colors.length > 0 && (
              <div className="mt-2">
                <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                  {JSON.stringify(colors, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Políticas */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">5. Políticas RLS en colors</h2>
        {policiesError ? (
          <div className="rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ No se pudo acceder a pg_policies (requiere permisos especiales)
            </p>
            <p className="mt-1 text-xs text-yellow-700">Error: {policiesError.message}</p>
          </div>
        ) : policies && policies.length > 0 ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>✅ Políticas encontradas:</strong> {policies.length}
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {policies.map((p: { policyname: string }, i: number) => (
                <li key={i}>{p.policyname}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-red-800">❌ No se encontraron políticas</p>
        )}
      </section>

      {/* Diagnóstico */}
      <section className="rounded-lg bg-blue-50 p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-blue-900">📋 Diagnóstico</h2>
        <div className="space-y-3 text-sm">
          {!user && <p className="text-red-800">❌ No hay usuario autenticado</p>}

          {user && !directRole && (
            <>
              <p className="text-red-800">
                ❌ El usuario {user.id.substring(0, 8)}... NO tiene rol asignado en la tabla user_roles
              </p>
              <div className="mt-2 rounded bg-white p-3">
                <p className="font-semibold">Solución:</p>
                <p className="mt-1">Ejecuta en Supabase SQL Editor:</p>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                  {`INSERT INTO public.user_roles (user_id, role, created_by)
VALUES ('${user?.id}', 'admin', '${user?.id}');`}
                </pre>
              </div>
            </>
          )}

          {user && directRole && colorsError && (
            <>
              <p className="text-red-800">
                ❌ El usuario tiene rol &ldquo;{directRole.role}&rdquo; pero no puede leer la tabla
                colors
              </p>
              <div className="mt-2 rounded bg-white p-3">
                <p className="font-semibold">Posibles causas:</p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>Las políticas RLS no se aplicaron correctamente</li>
                  <li>
                    Las funciones helper (is_admin, has_role) no existen o tienen errores
                  </li>
                  <li>El contexto de autenticación no se está propagando correctamente</li>
                </ul>
                <p className="mt-2 font-semibold">Solución:</p>
                <p className="mt-1">
                  Verifica que ejecutaste el archivo: supabase/migrations/20260126_rls_policies.sql
                </p>
              </div>
            </>
          )}

          {user && directRole && !colorsError && (
            <p className="text-green-800">✅ Todo está funcionando correctamente</p>
          )}
        </div>
      </section>
    </div>
  )
}
