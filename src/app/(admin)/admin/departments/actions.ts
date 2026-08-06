'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createDepartment(name: string, code: string, color: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('departments')
    .insert({ name: name.trim(), code: code.trim().toUpperCase(), avatar_color: color })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/departments')
  return { success: true }
}

export async function updateDepartment(id: string, name: string, code: string, color: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('departments')
    .update({ name: name.trim(), code: code.trim().toUpperCase(), avatar_color: color })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/departments')
  return { success: true }
}

export async function deleteDepartment(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: usersInDept } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('department_id', id)

  if ((usersInDept as any)?.length > 0) {
    return { success: false, error: 'Không thể xóa phòng ban đang có nhân viên. Vui lòng chuyển nhân viên sang phòng ban khác trước.' }
  }

  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/departments')
  return { success: true }
}
