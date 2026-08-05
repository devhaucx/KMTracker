import { NextRequest, NextResponse } from 'next/server'
import { calculateActivityScore } from '@/lib/strava/scoring'
import { createAdminClient } from '@/lib/supabase/admin'

// GET handler: Strava Webhook Subscription Verification
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

// POST handler: Async Strava Webhook Event Receiver
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    console.log('Received Strava Webhook Event:', payload)

    const { object_type, aspect_type, object_id, owner_id } = payload

    // Only process new activity creations
    if (object_type === 'activity' && aspect_type === 'create') {
      const supabaseAdmin = createAdminClient()

      // Fetch user profile and tokens from owner_id (strava_athlete_id)
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, strava_access_token')
        .eq('strava_athlete_id', owner_id)
        .single()

      if (user && user.strava_access_token) {
        // Fetch detailed activity payload from Strava API v3
        const activityRes = await fetch(`https://www.strava.com/api/v3/activities/${object_id}`, {
          headers: { Authorization: `Bearer ${user.strava_access_token}` }
        })

        if (activityRes.ok) {
          const act = await activityRes.json()

          // Get active competition
          const { data: activeComp } = await supabaseAdmin
            .from('competitions')
            .select('id, start_date, end_date')
            .eq('status', 'active')
            .single()

          // Calculate score & pace validation
          const score = calculateActivityScore(
            act.type,
            act.distance,
            act.moving_time,
            act.start_date,
            activeComp?.start_date,
            activeComp?.end_date
          )

          // Insert into public.activities table
          await supabaseAdmin.from('activities').upsert({
            user_id: user.id,
            competition_id: activeComp?.id || null,
            strava_activity_id: object_id,
            sport_type: act.type,
            activity_name: act.name || 'Hoạt động Strava',
            distance_actual_km: score.distanceActualKm,
            distance_converted_km: score.distanceConvertedKm,
            moving_time_seconds: act.moving_time,
            pace_or_speed: score.paceOrSpeed,
            start_date: act.start_date,
            is_valid: score.isValid,
            rejection_reason: score.rejectionReason,
            sync_status: 'processed'
          }, { onConflict: 'strava_activity_id' })

          // Trigger materialized view refresh asynchronously
          await supabaseAdmin.rpc('refresh_leaderboard_views')
        }
      }
    }

    // Always respond 200 OK immediately to Strava API (< 2s rule)
    return NextResponse.json({ status: 'success' })
  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ status: 'error', message: err.message }, { status: 200 })
  }
}
