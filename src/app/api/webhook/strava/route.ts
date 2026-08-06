import { NextRequest, NextResponse } from 'next/server'
import { calculateActivityScore, type CompetitionRulesConfig } from '@/lib/strava/scoring'
import { createAdminClient } from '@/lib/supabase/admin'
import { getValidAccessToken } from '@/lib/strava/token'
import type { SportType } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const expectedToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'strava_ranking_verify_token'

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('Strava Webhook subscription verified successfully!')
    return NextResponse.json({ 'hub.challenge': challenge })
  }

  return new NextResponse('Verification failed', { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    console.log('Received Strava Webhook Event:', payload)

    const { object_type, aspect_type, object_id, owner_id, updates } = payload

    if (object_type !== 'activity') {
      return NextResponse.json({ status: 'ignored' })
    }

    const ctx = getCfContext()
    const work = processWebhookEvent(object_id, owner_id, aspect_type, updates)

    if (ctx) {
      ctx.waitUntil(work)
      return NextResponse.json({ status: 'accepted' })
    }

    await work
    return NextResponse.json({ status: 'processed' })
  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ status: 'error', message: err.message })
  }
}

function getCfContext(): { waitUntil: (p: Promise<unknown>) => void } | null {
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare')
    const ctx = getCloudflareContext().ctx
    if (ctx && typeof ctx.waitUntil === 'function') return ctx
    return null
  } catch {
    return null
  }
}

async function processWebhookEvent(
  activityId: number,
  athleteId: number,
  aspectType: string,
  updates?: any
) {
  const supabase = createAdminClient()

  if (aspectType === 'delete') {
    await supabase
      .from('activities')
      .delete()
      .eq('strava_activity_id', activityId)
    console.log(`Deleted activity ${activityId}`)
    return
  }

  if (aspectType === 'update') {
    if (updates?.title) {
      await supabase
        .from('activities')
        .update({ activity_name: updates.title })
        .eq('strava_activity_id', activityId)
    }
    return
  }

  if (aspectType !== 'create') return

  const accessToken = await getValidAccessToken(athleteId)
  if (!accessToken) {
    console.error(`No valid token for athlete ${athleteId}`)
    return
  }

  const activityRes = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!activityRes.ok) {
    console.error(`Failed to fetch activity ${activityId}: ${activityRes.status}`)
    return
  }

  const act = await activityRes.json()

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('strava_athlete_id', athleteId)
    .single()

  if (!user) return

  const { data: activeComp } = await supabase
    .from('competitions')
    .select('id, start_date, end_date')
    .eq('status', 'active')
    .eq('is_deleted', false)
    .single()

  if (!activeComp) {
    console.log('No active competition, skipping activity')
    return
  }

  const { data: sports } = await supabase
    .from('competition_sports')
    .select('*')
    .eq('competition_id', activeComp.id)
    .eq('is_active', true)

  const customRules = buildCustomRules(sports || [])

  const score = calculateActivityScore(
    act.sport_type || act.type,
    act.distance,
    act.moving_time,
    act.start_date,
    activeComp.start_date,
    activeComp.end_date,
    customRules
  )

  const sportKey = score.categorySport
  const matchedSport = (sports || []).find(
    s => s.sport_type === sportKey
  )

  await supabase.from('activities').upsert({
    user_id: user.id,
    competition_id: activeComp.id,
    competition_sport_id: matchedSport?.id || null,
    strava_activity_id: activityId,
    sport_type: score.categorySport === 'Other' ? (act.sport_type || act.type) : score.categorySport,
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

  console.log(`Processed activity ${activityId} for athlete ${athleteId}: ${score.distanceConvertedKm} km (valid: ${score.isValid})`)
}

function buildCustomRules(sports: any[]): CompetitionRulesConfig {
  const rules: CompetitionRulesConfig = {}

  for (const s of sports) {
    const unit = s.validation_unit === 'km/h' ? 'km/h' : s.validation_unit === 'min/100m' ? 'min/100m' : 'min/km'
    rules[s.sport_type as SportType] = {
      enabled: s.is_active,
      ratio: s.conversion_ratio,
      minPaceOrSpeed: s.min_pace_or_speed,
      maxPaceOrSpeed: s.max_pace_or_speed,
      unit,
    }
  }

  return rules
}
