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

  // Use UTC timestamps to avoid timezone issues
  // Add buffer to end date to include full final day
  const afterEpoch = Math.floor(new Date(competition.start_date).getTime() / 1000)
  const beforeEpoch = Math.floor((new Date(competition.end_date).getTime() + 86399000) / 1000) // +23:59:59

  let afterCursor: number | undefined = undefined
  let hasMore = true
  let processed = 0

  while (hasMore) {
    // Use cursor-based pagination as per Strava API 2025 spec
    const params = new URLSearchParams({
      after: afterEpoch.toString(),
      before: beforeEpoch.toString(),
      page_size: '100', // Use page_size instead of deprecated per_page
    })

    if (afterCursor) {
      params.append('after_cursor', afterCursor.toString())
    }

    const url = `https://www.strava.com/api/v3/athlete/activities?${params.toString()}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      // Handle rate limiting specifically
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After')
        console.error(`Rate limited on backfill. Retry after: ${retryAfter} seconds`)
        return { success: false, error: `Rate limited. Retry after ${retryAfter}s` }
      }
      console.error(`Backfill fetch failed: ${res.status}`)
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

    // Get cursor from the last activity for next page
    const lastActivity = activities[activities.length - 1]
    afterCursor = lastActivity?.id // Use activity ID as cursor
    hasMore = activities.length === 100 // Continue if we got a full page
  }

  console.log(`Backfill complete for user ${userId}: ${processed} activities processed`)
  return { success: true, processed }
}
