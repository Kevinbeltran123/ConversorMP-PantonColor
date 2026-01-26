/**
 * Script de diagnóstico para RLS
 * Verifica políticas, funciones y permisos
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

// Cliente con service_role (bypass RLS para diagnóstico)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function diagnose() {
  console.log('🔍 Diagnóstico RLS - ConversorMP\n')

  // 1. Verificar que RLS está habilitado
  console.log('1️⃣  Verificando RLS habilitado en tablas...')
  const { data: rlsStatus, error: rlsError } = await supabase.rpc('check_rls_enabled')

  if (rlsError) {
    console.log('   ⚠️  No se pudo verificar (esperado si la función no existe)')
    console.log('   Creando función de verificación...\n')

    // Crear función temporal para verificar RLS
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION check_rls_enabled()
        RETURNS TABLE(tablename text, rowsecurity boolean) AS $$
        BEGIN
          RETURN QUERY
          SELECT
            c.relname::text,
            c.relrowsecurity
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public'
          AND c.relkind = 'r'
          AND c.relname IN ('colors', 'products', 'user_roles', 'ingredients', 'formulas', 'formula_items', 'batches', 'batch_items', 'audit_logs')
          ORDER BY c.relname;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `,
    })

    if (createError) {
      console.log('   ⚠️  No se pudo crear función de verificación')
    }
  }

  // 2. Verificar políticas en tabla colors
  console.log('2️⃣  Verificando políticas en tabla colors...')
  const { data: policies } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('schemaname', 'public')
    .eq('tablename', 'colors')

  if (!policies || policies.length === 0) {
    console.log('   ❌ No se encontraron políticas en tabla colors')
  } else {
    console.log(`   ✅ ${policies.length} políticas encontradas:`)
    policies.forEach((p: { policyname: string; cmd: string }) => {
      console.log(`      - ${p.policyname} (${p.cmd})`)
    })
  }
  console.log('')

  // 3. Verificar funciones de ayuda
  console.log('3️⃣  Verificando funciones de ayuda (is_admin, has_role, etc.)...')
  const functions = ['is_admin', 'is_operator', 'has_role', 'get_user_role']

  for (const funcName of functions) {
    const { data: funcExists } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', funcName)
      .limit(1)

    if (!funcExists || funcExists.length === 0) {
      console.log(`   ❌ Función ${funcName}() NO existe`)
    } else {
      console.log(`   ✅ Función ${funcName}() existe`)
    }
  }
  console.log('')

  // 4. Verificar usuarios y roles
  console.log('4️⃣  Verificando usuarios y roles...')
  const { data: users } = await supabase.from('user_roles').select('*')

  if (!users || users.length === 0) {
    console.log('   ❌ No hay usuarios con roles asignados')
  } else {
    console.log(`   ✅ ${users.length} usuario(s) con rol:`)
    users.forEach((u: { user_id: string; role: string }) => {
      console.log(`      - ${u.user_id.substring(0, 8)}... → ${u.role}`)
    })
  }
  console.log('')

  // 5. Verificar datos en tabla colors
  console.log('5️⃣  Verificando datos en tabla colors...')
  const { data: colors, error: colorsError } = await supabase.from('colors').select('*')

  if (colorsError) {
    console.log(`   ❌ Error al leer colors: ${colorsError.message}`)
  } else {
    console.log(`   ✅ ${colors?.length || 0} color(es) en la base de datos`)
  }
  console.log('')

  // Resumen
  console.log('📋 RESUMEN:')
  console.log('---------------------------------------------------')

  if (!policies || policies.length === 0) {
    console.log('❌ PROBLEMA: Las políticas RLS no están aplicadas')
    console.log('   SOLUCIÓN: Ejecuta el archivo:')
    console.log('   supabase/migrations/20260126_rls_policies.sql')
    console.log('')
  }

  if (!users || users.length === 0) {
    console.log('❌ PROBLEMA: No hay usuarios con roles asignados')
    console.log('   SOLUCIÓN: Asegúrate de que el trigger assign_admin_to_first_user esté funcionando')
    console.log('   O asigna manualmente el rol con:')
    console.log(`   INSERT INTO user_roles (user_id, role) VALUES ('TU_USER_ID', 'admin');`)
    console.log('')
  }

  console.log('---------------------------------------------------')
}

diagnose().catch(console.error)
