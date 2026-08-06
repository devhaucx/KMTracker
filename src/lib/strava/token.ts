import { createAdminClient } from '@/lib/supabase/admin'
import { refreshStravaToken } from './oauth'

const REFRESH_BUFFER_MS = 5 * 60 * 1000

export async function getValidAccessToken(stravaAthleteId: number): Promise<string | null> {
  const supabase = createAdminClient()

  const { data: user } = await supabase
    .from('users')
    .select('id, strava_access_token, strava_refresh_token, token_expires_at')
    .eq('strava_athlete_id', stravaAthleteId)
    .single()

  if (!user) return null

  const expiresAt = user.token_expires_at ? new Date(user.token_expires_at).getTime() : 0
  const needsRefresh = !user.strava_access_token || expiresAt - Date.now() < REFRESH_BUFFER_MS

  if (!needsRefresh) {
    return user.strava_access_token
  }

  if (!user.strava_refresh_token) {
    console.error(`No refresh token for athlete ${stravaAthleteId}`)
    return null
  }

  try {
    const refreshed = await refreshStravaToken(user.strava_refresh_token)

    await supabase
      .from('users')
      .update({
        strava_access_token: refreshed.access_token,
        strava_refresh_token: refreshed.refresh_token,
        token_expires_at: new Date(refreshed.expires_at * 1000).toISOString(),
      })
      .eq('id', user.id)

    return refreshed.access_token
  } catch (err) {
    console.error(`Token refresh failed for athlete ${stravaAthleteId}:`, err)
    return null
  }
}
