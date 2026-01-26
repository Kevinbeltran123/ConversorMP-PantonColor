'use server'

import { createClient } from '@/infrastructure/supabase/server'
import type { UserRole } from '@/domain/entities/database.types'

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data.role as UserRole
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}

export async function isOperator(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'operator'
}

export async function hasRole(): Promise<boolean> {
  const role = await getUserRole()
  return role !== null
}

export async function assignRole(userId: string, role: UserRole): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Verificar que el usuario actual es admin
  const currentUserIsAdmin = await isAdmin()
  if (!currentUserIsAdmin) {
    return { error: 'Solo administradores pueden asignar roles' }
  }

  const { error } = await supabase.from('user_roles').insert({
    user_id: userId,
    role,
    created_by: (await supabase.auth.getUser()).data.user?.id,
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}

export async function updateRole(
  userId: string,
  newRole: UserRole
): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Verificar que el usuario actual es admin
  const currentUserIsAdmin = await isAdmin()
  if (!currentUserIsAdmin) {
    return { error: 'Solo administradores pueden modificar roles' }
  }

  const { error } = await supabase
    .from('user_roles')
    .update({ role: newRole })
    .eq('user_id', userId)

  if (error) {
    return { error: error.message }
  }

  return {}
}
