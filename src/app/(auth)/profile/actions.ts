'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export async function updateDepartment(departmentId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Không tìm thấy phiên đăng nhập.' }

  const admin = createAdminClient()

  // CHECK REGISTRATION DEADLINE FOR ACTIVE COMPETITIONS
  const { data: activeCompetitions } = await admin
    .from('competitions')
    .select('id, name, registration_deadline, start_date')
    .eq('status', 'active')
    .eq('is_deleted', false)

  if (activeCompetitions && activeCompetitions.length > 0) {
    const now = new Date().getTime()

    for (const comp of activeCompetitions) {
      const deadline = new Date(comp.registration_deadline).getTime()
      const competitionStart = new Date(comp.start_date).getTime()

      // Allow department change if:
      // 1. Before registration deadline, OR
      // 2. After competition has started (grace period for latecomers)
      if (now > deadline && now < competitionStart) {
        return {
          error: `Cuộc thi "${comp.name}" đang trong giai đoạn thi đấu. Bạn không thể thay đổi phòng ban giữa thời điểm đăng ký (${new Date(comp.registration_deadline).toLocaleDateString('vi-VN')}) và ngày bắt đầu (${new Date(comp.start_date).toLocaleDateString('vi-VN')}).`
        }
      }
    }
  }

  const { error } = await admin
    .from('users')
    .update({ department_id: departmentId, is_profile_complete: true })
    .eq('id', user.id)

  if (error) return { error: 'Lỗi khi cập nhật phòng ban.' }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}
