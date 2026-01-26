/**
 * Script para verificar la conexión a Supabase y el estado de la base de datos
 * Ejecutar: npx tsx scripts/verify-db.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function verifyDatabase() {
  console.log('🔍 Verificando conexión a Supabase...\n')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Variables de entorno no configuradas')
    console.error('   Verifica que .env.local tiene:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('✅ Cliente Supabase creado')
  console.log(`📍 URL: ${supabaseUrl}\n`)

  // Verificar productos
  console.log('📦 Verificando tabla products...')
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')

  if (productsError) {
    console.error('❌ Error al leer products:', productsError.message)
    console.error('   ¿Ejecutaste las migraciones SQL?')
  } else {
    console.log(`✅ Productos encontrados: ${products?.length || 0}`)
    if (products && products.length > 0) {
      products.forEach((p) => console.log(`   - ${p.name}`))
    }
  }

  // Verificar ingredientes
  console.log('\n🧪 Verificando tabla ingredients...')
  const { data: ingredients, error: ingredientsError } = await supabase
    .from('ingredients')
    .select('name')
    .limit(5)

  if (ingredientsError) {
    console.error('❌ Error al leer ingredients:', ingredientsError.message)
  } else {
    console.log(`✅ Ingredientes encontrados: ${ingredients?.length || 0} (primeros 5)`)
    if (ingredients && ingredients.length > 0) {
      ingredients.forEach((i) => console.log(`   - ${i.name}`))
    }
  }

  // Verificar colores
  console.log('\n🎨 Verificando tabla colors...')
  const { data: colors, error: colorsError } = await supabase.from('colors').select('name')

  if (colorsError) {
    console.error('❌ Error al leer colors:', colorsError.message)
  } else {
    console.log(`✅ Colores encontrados: ${colors?.length || 0}`)
    if (colors && colors.length > 0) {
      colors.forEach((c) => console.log(`   - ${c.name}`))
    }
  }

  // Verificar usuarios
  console.log('\n👥 Verificando usuarios...')
  const { data: users, error: usersError } = await supabase.from('user_roles').select('role')

  if (usersError) {
    console.error('❌ Error al leer user_roles:', usersError.message)
  } else {
    console.log(`✅ Usuarios con rol: ${users?.length || 0}`)
    if (users && users.length > 0) {
      const adminCount = users.filter((u) => u.role === 'admin').length
      const operatorCount = users.filter((u) => u.role === 'operator').length
      console.log(`   - Admins: ${adminCount}`)
      console.log(`   - Operators: ${operatorCount}`)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Verificación completada')
  console.log('='.repeat(50))
}

verifyDatabase().catch(console.error)
