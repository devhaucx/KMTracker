'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export async function updateDepartment(departmentId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Không tìm thấy phiên đăng nhập.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({ department_id: departmentId, is_profile_complete: true })
    .eq('id', user.id)

  if (error) return { error: 'Lỗi khi cập nhật phòng ban.' }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}
