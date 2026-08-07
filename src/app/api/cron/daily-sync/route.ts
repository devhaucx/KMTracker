import { NextRequest, NextResponse } from 'next/server'
import { validateCronRequest } from '@/lib/auth/cron'
import { createAdminClient } from '@/lib/supabase/admin'
import { backfillUserActivities } from '@/lib/strava/backfill'

/**
 * Daily sync: backfill activities for all users in active competitions.
 * Catches activities missed by webhook (Strava downtime, Worker killed, etc).
 * Called by pg_cron daily at 2:00 AM.
 */
export async function POST(request: NextRequest) {
  try {
    await validateCronRequest(request)

    const supabase = createAdminClient()

    // Get all active competitions
    const { data: activeComps } = await supabase
      .from('competitions')
      .select('id, name')
      .eq('status', 'active')
      .eq('is_deleted', false)

    if (!activeComps || activeComps.length === 0) {
      return NextResponse.json({ success: true, message: 'No active competitions' })
    }

    const stats = {
      competitions: activeComps.length,
      usersProcessed: 0,
      usersFailed: 0,
      errors: [] as string[],
    }

    for (const comp of activeComps) {
      // Get all active participants in this competition with their Strava link
      const { data: participants } = await supabase
        .from('competition_participants')
        .select('user_id, users!inner(strava_athlete_id)')
        .eq('competition_id', comp.id)
        .eq('status', 'active')

      if (!participants || participants.length === 0) continue

      for (const p of participants) {
        const userData = p.users as unknown as { strava_athlete_id: number | null }
        if (!userData?.strava_athlete_id) continue

        try {
          const result = await backfillUserActivities(p.user_id, comp.id)
          if (result.success) {
            stats.usersProcessed++
          } else {
            stats.usersFailed++
            stats.errors.push(`${comp.name}/user ${p.user_id}: ${result.error}`)
          }
        } catch (err: any) {
          stats.usersFailed++
          stats.errors.push(`${comp.name}/user ${p.user_id}: ${err.message}`)
        }
      }
    }

    console.log(`Daily sync complete: ${stats.usersProcessed} users processed, ${stats.usersFailed} failed`)
    if (stats.errors.length > 0) {
      console.error('Daily sync errors:', stats.errors)
    }

    return NextResponse.json({ success: true, ...stats })
  } catch (error: any) {
    if (error.constructor.name === 'CronAuthorizationError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Daily sync cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
