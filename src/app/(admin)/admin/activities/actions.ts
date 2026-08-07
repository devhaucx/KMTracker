'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { getValidAccessToken } from '@/lib/strava/token'
import { calculateActivityScore, type CompetitionRulesConfig } from '@/lib/strava/scoring'
import type { SportType } from '@/lib/supabase/types'

export async function approveActivity(activityId: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: activity } = await supabase
    .from('activities')
    .select('*, competition_sports(conversion_ratio)')
    .eq('id', activityId)
    .single()

  if (!activity) return { success: false, error: 'Không tìm thấy bài tập' }

  const ratio = activity.competition_sports?.conversion_ratio ?? 1
  const convertedKm = Math.round(activity.distance_actual_km * ratio * 100) / 100

  await supabase
    .from('activities')
    .update({ is_valid: true, rejection_reason: null, distance_converted_km: convertedKm })
    .eq('id', activityId)

  await logAudit(activityId, 'APPROVED', 'Xác nhận kết quả bài tập hợp lệ')
  revalidatePath('/admin/activities')
  return { success: true }
}

export async function rejectActivity(activityId: string, reason: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  await supabase
    .from('activities')
    .update({ is_valid: false, rejection_reason: reason, distance_converted_km: 0 })
    .eq('id', activityId)

  await logAudit(activityId, 'REJECTED', reason)
  revalidatePath('/admin/activities')
  return { success: true }
}

export async function bulkApprove(activityIds: string[]) {
  await requireAdmin()
  const supabase = createAdminClient()

  for (const id of activityIds) {
    const { data: activity } = await supabase
      .from('activities')
      .select('*, competition_sports(conversion_ratio)')
      .eq('id', id)
      .single()

    if (!activity) continue

    const ratio = activity.competition_sports?.conversion_ratio ?? 1
    const convertedKm = Math.round(activity.distance_actual_km * ratio * 100) / 100

    await supabase
      .from('activities')
      .update({ is_valid: true, rejection_reason: null, distance_converted_km: convertedKm })
      .eq('id', id)

    await logAudit(id, 'APPROVED', 'Phê duyệt hàng loạt bởi Admin')
  }

  revalidatePath('/admin/activities')
  return { success: true }
}

export async function bulkReject(activityIds: string[], reason: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  await supabase
    .from('activities')
    .update({ is_valid: false, rejection_reason: reason, distance_converted_km: 0 })
    .in('id', activityIds)

  for (const id of activityIds) {
    await logAudit(id, 'REJECTED', reason)
  }

  revalidatePath('/admin/activities')
  return { success: true }
}

export async function manualSync(stravaActivityId: number, expectedUserId?: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  let userId = expectedUserId

  if (!userId) {
    const { data: activity } = await supabase
      .from('activities')
      .select('user_id')
      .eq('strava_activity_id', stravaActivityId)
      .single()
    userId = activity?.user_id
  }

  if (!userId) {
    return { success: false, error: 'Không tìm thấy người dùng cho activity này' }
  }

  const { data: user } = await supabase
    .from('users')
    .select('strava_athlete_id')
    .eq('id', userId)
    .single()

  if (!user?.strava_athlete_id) {
    return { success: false, error: 'Người dùng chưa kết nối Strava' }
  }

  const accessToken = await getValidAccessToken(user.strava_athlete_id)
  if (!accessToken) {
    return { success: false, error: 'Không thể lấy token Strava' }
  }

  const res = await fetch(`https://www.strava.com/api/v3/activities/${stravaActivityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    return { success: false, error: `Strava API error: ${res.status}` }
  }

  const act = await res.json()

  // Get ALL active competitions the user participates in (not just one)
  const { data: userComps } = await supabase
    .from('competition_participants')
    .select('competition_id, competitions!inner(id, start_date, end_date)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .eq('competitions.status', 'active')
    .eq('competitions.is_deleted', false)

  if (!userComps || userComps.length === 0) {
    return { success: false, error: 'Không có giải đấu đang hoạt động để đồng bộ.' }
  }

  const scores: any[] = []

  for (const uc of userComps) {
    const comp = uc.competitions as unknown as { id: string; start_date: string; end_date: string }

    const { data: sports } = await supabase
      .from('competition_sports')
      .select('*')
      .eq('competition_id', comp.id)
      .eq('is_active', true)

    const customRules: CompetitionRulesConfig = {}
    for (const s of sports || []) {
      const unit = s.validation_unit === 'km/h' ? 'km/h' : s.validation_unit === 'sec/100m' ? 'sec/100m' : 'sec/km'
      customRules[s.sport_type as SportType] = {
        enabled: s.is_active,
        ratio: s.conversion_ratio,
        minPaceOrSpeed: s.min_pace_or_speed,
        maxPaceOrSpeed: s.max_pace_or_speed,
        unit,
      }
    }

    const score = calculateActivityScore(
      act.sport_type || act.type,
      act.distance,
      act.moving_time,
      act.start_date,
      comp.start_date,
      comp.end_date,
      customRules
    )

    if (score.categorySport === 'Other') continue

    const sportKey = score.categorySport
    const matchedSport = (sports || []).find((s: any) => s.sport_type === sportKey)

    await supabase.from('activities').upsert({
      user_id: userId,
      competition_id: comp.id,
      competition_sport_id: matchedSport?.id || null,
      strava_activity_id: stravaActivityId,
      sport_type: score.categorySport,
      activity_name: act.name || 'Hoạt động Strava',
      distance_actual_km: score.distanceActualKm,
      distance_converted_km: score.distanceConvertedKm,
      moving_time_seconds: act.moving_time,
      pace_or_speed: score.paceOrSpeed,
      start_date: act.start_date,
      is_valid: score.isValid,
      rejection_reason: score.rejectionReason,
      sync_status: 'processed',
    }, { onConflict: 'user_id,competition_id,strava_activity_id' })

    scores.push({ competitionId: comp.id, score })
  }

  await logAudit(stravaActivityId.toString(), 'MANUAL_SYNC', `Đồng bộ thủ công Strava #${stravaActivityId}`)
  revalidatePath('/admin/activities')
  return { success: true, scores }
}

async function logAudit(activityId: string, action: string, reason: string) {
  const supabase = createAdminClient()
  const user = await requireAdmin()
  await supabase.from('activity_audit_logs').insert({
    activity_id: activityId,
    admin_id: user.id,
    action,
    reason,
  })
}
