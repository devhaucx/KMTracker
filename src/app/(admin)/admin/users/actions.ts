'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export async function assignDepartment(userId: string, departmentId: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('users')
    .update({ department_id: departmentId || null })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function withdrawUser(userId: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('competition_participants')
    .update({ status: 'withdrawn' })
    .eq('user_id', userId)
    .eq('status', 'active')

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function restoreUser(userId: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('competition_participants')
    .update({ status: 'active' })
    .eq('user_id', userId)
    .eq('status', 'withdrawn')

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}
