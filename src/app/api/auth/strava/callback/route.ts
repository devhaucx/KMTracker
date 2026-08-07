import { NextRequest, NextResponse } from 'next/server'
import { getAppUrl } from '@/lib/utils/url'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const error   = searchParams.get('error')
  const code    = searchParams.get('code')
  const baseUrl = getAppUrl(request)

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?error=strava_auth_cancelled`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?error=missing_code`)
  }

  try {
    const { exchangeStravaCode } = await import('@/lib/strava/oauth')
    const { createAdminClient }  = await import('@/lib/supabase/admin')

    const tokenData = await exchangeStravaCode(code)
    const athlete   = tokenData.athlete
    if (!athlete) throw new Error('Athlete data missing')

    const supabaseAdmin = createAdminClient()
    const email     = `${athlete.id}@strava.internal`
    const fullName  = `${athlete.firstname || ''} ${athlete.lastname || ''}`.trim() || `Athlete #${athlete.id}`
    const avatarUrl = athlete.profile

    let userId: string

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, is_profile_complete, role')
      .eq('strava_athlete_id', athlete.id)
      .single()

    if (existingUser) {
      userId = existingUser.id
      await supabaseAdmin.from('users').update({
        strava_access_token:  tokenData.access_token,
        strava_refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        full_name: fullName, avatar_url: avatarUrl,
      }).eq('id', userId)
    } else {
      const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email, email_confirm: true,
        user_metadata: { full_name: fullName, avatar_url: avatarUrl },
      })
      if (createAuthError || !newAuthUser.user) throw new Error(createAuthError?.message)
      userId = newAuthUser.user.id

      await supabaseAdmin.from('users').upsert({
        id: userId, email, full_name: fullName, avatar_url: avatarUrl,
        strava_athlete_id: athlete.id,
        strava_access_token: tokenData.access_token,
        strava_refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        role: 'user', is_profile_complete: false,
      })
    }

    const state = searchParams.get('state') || ''
    const [inviteCode, deptId] = state.split('|')

    if (deptId) {
      await supabaseAdmin.from('users').update({ department_id: deptId }).eq('id', userId)
    }

    if (inviteCode) {
      const { data: comp } = await supabaseAdmin
        .from('competitions').select('id')
        .eq('invite_code', inviteCode.toUpperCase()).single()
      if (comp) {
        await supabaseAdmin.from('competition_participants').upsert(
          { user_id: userId, competition_id: comp.id, status: 'active' },
          { onConflict: 'user_id, competition_id' }
        )
      }
    }

    // Backfill activities for ALL active competitions the user participates in
    try {
      const { backfillUserActivities } = await import('@/lib/strava/backfill')
      const { data: userComps } = await supabaseAdmin
        .from('competition_participants')
        .select('competition_id')
        .eq('user_id', userId)
        .eq('status', 'active')

      for (const uc of userComps || []) {
        try {
          await backfillUserActivities(userId, uc.competition_id)
        } catch (backfillErr) {
          console.error(`Backfill failed for competition ${uc.competition_id} (non-blocking):`, backfillErr)
        }
      }
    } catch (backfillErr) {
      console.error('Backfill setup failed (non-blocking):', backfillErr)
    }

    const redirectUrl = existingUser?.is_profile_complete
      ? `${baseUrl}/dashboard`
      : `${baseUrl}/profile?setup=true`

    const response = NextResponse.redirect(redirectUrl)
    const { setSessionCookie } = await import('@/lib/auth/session')
    // Get user role for session token
    const userRole = existingUser?.role || 'user'
    await setSessionCookie(userId, response, userRole)
    return response
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'auth_error'
    console.error('Strava OAuth callback error:', err)
    return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(msg)}`)
  }
}
