import { NextRequest, NextResponse } from 'next/server'

const MOCK_MODE = !process.env.STRAVA_CLIENT_ID

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const isMock  = searchParams.get('mock') === '1'
  const error   = searchParams.get('error')
  const code    = searchParams.get('code')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?error=strava_auth_cancelled`)
  }

  // ── MOCK PATH ────────────────────────────────────────────
  if (MOCK_MODE || isMock) {
    const response = NextResponse.redirect(`${baseUrl}/dashboard`)
    response.cookies.set('mock_user_id', 'mock-user-1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    response.cookies.set('mock_mode', '1', {
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  }

  // ── PRODUCTION PATH ──────────────────────────────────────
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
      .select('id, is_profile_complete')
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

    const inviteCode = searchParams.get('state') || ''
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

    const redirectUrl = existingUser?.is_profile_complete
      ? `${baseUrl}/dashboard`
      : `${baseUrl}/profile?setup=true`

    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set('user_id', userId, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/',
    })
    return response
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'auth_error'
    console.error('Strava OAuth callback error:', err)
    return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(msg)}`)
  }
}
