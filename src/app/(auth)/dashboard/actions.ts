'use server'

import { getCurrentUser } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function resyncMyActivities(competitionId?: string) {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Không tìm thấy phiên đăng nhập.' }
  if (!user.strava_athlete_id) return { success: false, error: 'Tài khoản chưa kết nối Strava.' }

  const admin = createAdminClient()

  let targetCompetitionIds: string[]

  if (competitionId) {
    targetCompetitionIds = [competitionId]
  } else {
    const { data: participations } = await admin
      .from('competition_participants')
      .select('competition_id')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (!participations || participations.length === 0) {
      return { success: false, error: 'Bạn chưa tham gia giải đấu nào.' }
    }
    targetCompetitionIds = participations.map(p => p.competition_id)
  }

  const { backfillUserActivities } = await import('@/lib/strava/backfill')

  let totalProcessed = 0
  const errors: string[] = []

  for (const compId of targetCompetitionIds) {
    const result = await backfillUserActivities(user.id, compId)
    if (result.success) {
      totalProcessed += result.processed || 0
    } else {
      errors.push(result.error || 'Unknown error')
    }
  }

  revalidatePath('/dashboard')
  return { success: true, processed: totalProcessed, errors }
}
