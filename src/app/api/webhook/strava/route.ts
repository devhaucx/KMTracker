import { NextRequest, NextResponse } from 'next/server'
import { calculateActivityScore, type CompetitionRulesConfig } from '@/lib/strava/scoring'
import { createAdminClient } from '@/lib/supabase/admin'
import { getValidAccessToken } from '@/lib/strava/token'
import {
  storeFailedWebhookEvent,
  markWebhookEventSuccess,
  incrementWebhookEventRetry,
  markWebhookEventFailed
} from '@/lib/strava/webhook-retry'
import type { SportType } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  // Strava requires verification response within 2 seconds
  // This handler is fast (<50ms) as it only validates query params
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const expectedToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'strava_ranking_verify_token'

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('Strava Webhook subscription verified successfully!')
    // Return hub.challenge as required by Strava webhook spec
    return NextResponse.json({ 'hub.challenge': challenge })
  }

  return new NextResponse('Verification failed', { status: 403 })
}

export async function POST(request: NextRequest) {
  // Strava requires webhook POST response within 2 seconds
  // We use Cloudflare waitUntil for async processing to meet this requirement
  let payload: any
  try {
    payload = await request.json()
    console.log('Received Strava Webhook Event:', payload)

    const { object_type, aspect_type, object_id, owner_id, updates } = payload

    if (object_type !== 'activity') {
      return NextResponse.json({ status: 'ignored' })
    }

    const ctx = getCfContext()
    const work = processWebhookEvent(object_id, owner_id, aspect_type, updates)

    if (ctx) {
      // Cloudflare Workers: continue processing in background, respond immediately (<100ms)
      ctx.waitUntil(work)
      return NextResponse.json({ status: 'accepted' })
    }

    // Fallback: await processing (may exceed 2s for large competitions)
    await work
    return NextResponse.json({ status: 'processed' })
  } catch (err: any) {
    console.error('Webhook processing error:', err)

    // Store failed event for retry (payload already parsed above)
    try {
      if (payload) {
        await storeFailedWebhookEvent(
          payload.object_id,
          payload.owner_id,
          payload.aspect_type,
          payload.updates,
          err.message
        )
      }
    } catch (storeError) {
      console.error('Failed to store webhook event:', storeError)
    }

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

// Export for cron job retry mechanism
export async function processWebhookEvent(
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
    // Handle full activity updates, not just title
    if (updates?.title || updates?.distance || updates?.moving_time) {
      // For now, only update title as other changes require re-scoring
      if (updates?.title) {
        await supabase
          .from('activities')
          .update({ activity_name: updates.title })
          .eq('strava_activity_id', activityId)
      }
    }
    return
  }

  if (aspectType !== 'create') return

  const accessToken = await getValidAccessToken(athleteId)
  if (!accessToken) {
    console.error(`No valid token for athlete ${athleteId}`)
    await storeFailedWebhookEvent(activityId, athleteId, aspectType, updates, 'No valid access token')
    return
  }

  const activityRes = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!activityRes.ok) {
    // Handle rate limiting
    if (activityRes.status === 429) {
      const retryAfter = activityRes.headers.get('Retry-After')
      const error = `Rate limited fetching activity ${activityId}. Retry after ${retryAfter}s`
      console.error(error)
      await storeFailedWebhookEvent(activityId, athleteId, aspectType, updates, error)
      return
    }
    const error = `Failed to fetch activity ${activityId}: ${activityRes.status}`
    console.error(error)
    await storeFailedWebhookEvent(activityId, athleteId, aspectType, updates, error)
    return
  }

  const act = await activityRes.json()

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('strava_athlete_id', athleteId)
    .single()

  if (!user) {
    console.log(`User not found for athlete ${athleteId}`)
    return
  }

  // GET ALL ACTIVE COMPETITIONS (not just single)
  const { data: activeCompetitions } = await supabase
    .from('competitions')
    .select('id, name, start_date, end_date')
    .eq('status', 'active')
    .eq('is_deleted', false)

  if (!activeCompetitions || activeCompetitions.length === 0) {
    console.log('No active competitions, skipping activity')
    return
  }

  // Process activity for EACH active competition
  let processedCount = 0

  for (const competition of activeCompetitions) {
    // CRITICAL FIX: Check if user is registered for this competition
    const { data: participant } = await supabase
      .from('competition_participants')
      .select('status')
      .eq('user_id', user.id)
      .eq('competition_id', competition.id)
      .eq('status', 'active')
      .single()

    if (!participant) {
      console.log(`User ${user.id} not registered for competition ${competition.id}, skipping`)
      continue
    }

    const { data: sports } = await supabase
      .from('competition_sports')
      .select('*')
      .eq('competition_id', competition.id)
      .eq('is_active', true)

    const customRules = buildCustomRules(sports || [])

    const score = calculateActivityScore(
      act.sport_type || act.type,
      act.distance,
      act.moving_time,
      act.start_date,
      competition.start_date,
      competition.end_date,
      customRules
    )

    // Skip if sport is not supported in this competition
    const sportKey = score.categorySport
    const matchedSport = (sports || []).find(
      s => s.sport_type === sportKey
    )

    await supabase.from('activities').upsert({
      user_id: user.id,
      competition_id: competition.id,
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
    }, { onConflict: 'user_id,competition_id,strava_activity_id' })

    processedCount++
    console.log(`Processed activity ${activityId} for athlete ${athleteId} in competition ${competition.id}: ${score.distanceConvertedKm} km (valid: ${score.isValid})`)
  }

  if (processedCount === 0) {
    console.log(`Activity ${activityId} did not match any active competition rules`)
  }
}

function buildCustomRules(sports: any[]): CompetitionRulesConfig {
  const rules: CompetitionRulesConfig = {}

  for (const s of sports) {
    const unit = s.validation_unit === 'km/h' ? 'km/h' : s.validation_unit === 'sec/100m' ? 'sec/100m' : 'sec/km'
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
