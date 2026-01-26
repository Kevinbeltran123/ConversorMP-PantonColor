import { createClient } from '@/infrastructure/supabase/server'

export default async function DebugAdvancedPage() {
  const supabase = await createClient()

  // 1. Obtener usuario
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // 2. Obtener sesión
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  // 3. Intentar llamar a la función is_admin() directamente desde la base de datos
  const { data: isAdminResult, error: isAdminError } = await supabase.rpc('is_admin')

  // 4. Intentar llamar a la función get_user_role() directamente
  const { data: getUserRoleResult, error: getUserRoleError } = await supabase.rpc('get_user_role')

  // 5. Intentar llamar a la función has_role() directamente
  const { data: hasRoleResult, error: hasRoleError } = await supabase.rpc('has_role')

  // 6. Intentar leer user_roles con bypass RLS (usando service role)
  // Nota: Esto NO funcionará con anon key, solo con service_role key
  const { data: userRolesData, error: userRolesError } = await supabase
    .from('user_roles')
    .select('*')

  // 7. Verificar qué auth.uid() ve PostgreSQL
  const { data: authUidResult, error: authUidError } = await supabase.rpc('get_auth_uid')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Diagnóstico Avanzado</h1>

      {/* Usuario autenticado */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">1. Usuario Autenticado (Next.js)</h2>
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
            <p>
              <strong>Role (metadata):</strong> {user.role || 'N/A'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-yellow-800">⚠️ No hay usuario autenticado</p>
        )}
      </section>

      {/* Sesión */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">2. Sesión de Supabase</h2>
        {sessionError ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">❌ Error: {sessionError.message}</p>
          </div>
        ) : session ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>✅ Access Token:</strong> {session.access_token.substring(0, 20)}...
            </p>
            <p>
              <strong>User ID (token):</strong> {session.user.id}
            </p>
            <p>
              <strong>Expires:</strong> {new Date(session.expires_at! * 1000).toLocaleString('es')}
            </p>
          </div>
        ) : (
          <p className="text-sm text-yellow-800">⚠️ No hay sesión activa</p>
        )}
      </section>

      {/* RPC: is_admin() */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          3. Función PostgreSQL: is_admin()
        </h2>
        {isAdminError ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">❌ Error: {isAdminError.message}</p>
            <p className="mt-1 text-xs text-red-600">
              Code: {isAdminError.code} | Details: {isAdminError.details}
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <strong>{isAdminResult ? '✅' : '❌'} is_admin():</strong>{' '}
              {isAdminResult ? 'true' : 'false'}
            </p>
          </div>
        )}
      </section>

      {/* RPC: get_user_role() */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          4. Función PostgreSQL: get_user_role()
        </h2>
        {getUserRoleError ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">❌ Error: {getUserRoleError.message}</p>
            <p className="mt-1 text-xs text-red-600">
              Code: {getUserRoleError.code} | Details: {getUserRoleError.details}
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <strong>{getUserRoleResult ? '✅' : '⚠️'} get_user_role():</strong>{' '}
              {getUserRoleResult || 'null'}
            </p>
          </div>
        )}
      </section>

      {/* RPC: has_role() */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          5. Función PostgreSQL: has_role()
        </h2>
        {hasRoleError ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">❌ Error: {hasRoleError.message}</p>
            <p className="mt-1 text-xs text-red-600">
              Code: {hasRoleError.code} | Details: {hasRoleError.details}
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <strong>{hasRoleResult ? '✅' : '❌'} has_role():</strong>{' '}
              {hasRoleResult ? 'true' : 'false'}
            </p>
          </div>
        )}
      </section>

      {/* auth.uid() desde PostgreSQL */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          6. auth.uid() desde PostgreSQL
        </h2>
        {authUidError ? (
          <div className="rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ La función get_auth_uid() no existe (esto es normal)
            </p>
            <p className="mt-2 text-xs text-yellow-700">Error: {authUidError.message}</p>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <strong>{authUidResult ? '✅' : '❌'} auth.uid():</strong>{' '}
              {authUidResult || 'NULL'}
            </p>
          </div>
        )}
      </section>

      {/* Lectura de user_roles */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">7. Lectura de tabla user_roles</h2>
        {userRolesError ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">❌ Error: {userRolesError.message}</p>
            <p className="mt-1 text-xs text-red-600">
              Code: {userRolesError.code} | Details: {userRolesError.details}
            </p>
          </div>
        ) : userRolesData && userRolesData.length > 0 ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>✅ Registros encontrados:</strong> {userRolesData.length}
            </p>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
              {JSON.stringify(userRolesData, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-yellow-800">⚠️ No se encontraron registros</p>
        )}
      </section>

      {/* Diagnóstico final */}
      <section className="rounded-lg bg-blue-50 p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-blue-900">📋 Resumen</h2>
        <div className="space-y-3 text-sm">
          {!user && <p className="text-red-800">❌ No hay usuario autenticado en Next.js</p>}

          {!session && (
            <p className="text-red-800">❌ No hay sesión activa (cookies no se están propagando)</p>
          )}

          {user && session && userRolesError && (
            <>
              <p className="text-red-800">
                ❌ El usuario está autenticado en Next.js, pero PostgreSQL no puede leer user_roles
              </p>
              <p className="mt-2 text-sm">
                Esto indica que el contexto de autenticación (JWT) no se está propagando
                correctamente a PostgreSQL.
              </p>
              <p className="mt-2 text-sm font-semibold">Posibles causas:</p>
              <ul className="ml-4 mt-1 list-inside list-disc space-y-1">
                <li>Las cookies de sesión no se están enviando correctamente</li>
                <li>El JWT no contiene el user_id correcto</li>
                <li>Las políticas RLS están mal configuradas</li>
                <li>El middleware de Next.js no está refrescando la sesión</li>
              </ul>
            </>
          )}

          {user && session && !userRolesError && hasRoleResult && (
            <p className="text-green-800">✅ Todo está funcionando correctamente!</p>
          )}
        </div>
      </section>
    </div>
  )
}
