import { createAdminClient } from '@/lib/supabase/admin'
import { getValidAccessToken } from '@/lib/strava/token'
import { calculateActivityScore, type CompetitionRulesConfig } from '@/lib/strava/scoring'
import type { SportType } from '@/lib/supabase/types'

export async function backfillUserActivities(userId: string, competitionId: string) {
  const supabase = createAdminClient()

  const { data: user } = await supabase
    .from('users')
    .select('strava_athlete_id')
    .eq('id', userId)
    .single()

  if (!user?.strava_athlete_id) {
    return { success: false, error: 'User has no Strava connection' }
  }

  const { data: competition } = await supabase
    .from('competitions')
    .select('id, start_date, end_date')
    .eq('id', competitionId)
    .single()

  if (!competition) {
    return { success: false, error: 'Competition not found' }
  }

  const { data: sports } = await supabase
    .from('competition_sports')
    .select('*')
    .eq('competition_id', competitionId)
    .eq('is_active', true)

  const customRules: CompetitionRulesConfig = {}
  for (const s of sports || []) {
    const unit = s.validation_unit === 'km/h' ? 'km/h' : s.validation_unit === 'min/100m' ? 'min/100m' : 'min/km'
    customRules[s.sport_type as SportType] = {
      enabled: s.is_active,
      ratio: s.conversion_ratio,
      minPaceOrSpeed: s.min_pace_or_speed,
      maxPaceOrSpeed: s.max_pace_or_speed,
      unit,
    }
  }

  const accessToken = await getValidAccessToken(user.strava_athlete_id)
  if (!accessToken) {
    return { success: false, error: 'Cannot get valid Strava token' }
  }

  const afterEpoch = Math.floor(new Date(competition.start_date).getTime() / 1000)
  const beforeEpoch = Math.floor(new Date(competition.end_date).getTime() / 1000)

  let page = 1
  let hasMore = true
  let processed = 0

  while (hasMore) {
    const url = `https://www.strava.com/api/v3/athlete/activities?after=${afterEpoch}&before=${beforeEpoch}&per_page=100&page=${page}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      console.error(`Backfill fetch failed page ${page}: ${res.status}`)
      break
    }

    const activities = await res.json()
    if (!Array.isArray(activities) || activities.length === 0) {
      hasMore = false
      break
    }

    for (const act of activities) {
      const score = calculateActivityScore(
        act.sport_type || act.type,
        act.distance,
        act.moving_time,
        act.start_date,
        competition.start_date,
        competition.end_date,
        customRules
      )

      if (score.categorySport === 'Other') continue

      const sportKey = score.categorySport
      const matchedSport = (sports || []).find((s: any) => s.sport_type === sportKey)

      await supabase.from('activities').upsert({
        user_id: userId,
        competition_id: competitionId,
        competition_sport_id: matchedSport?.id || null,
        strava_activity_id: act.id,
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
      }, { onConflict: 'strava_activity_id' })

      processed++
    }

    hasMore = activities.length === 100
    page++
  }

  console.log(`Backfill complete for user ${userId}: ${processed} activities processed`)
  return { success: true, processed }
}
