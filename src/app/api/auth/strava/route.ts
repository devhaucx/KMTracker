import { NextRequest, NextResponse } from 'next/server'

// MOCK: Strava login redirect
// Khi có STRAVA_CLIENT_ID thật, xoá MOCK_MODE để dùng OAuth thật
const MOCK_MODE = !process.env.STRAVA_CLIENT_ID

export async function GET(request: NextRequest) {
  const inviteCode = request.nextUrl.searchParams.get('invite') || ''
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`

  if (MOCK_MODE) {
    // Mock: thẳng vào callback với mock athlete
    const callbackUrl = new URL(`${baseUrl}/api/auth/strava/callback`)
    callbackUrl.searchParams.set('mock', '1')
    if (inviteCode) callbackUrl.searchParams.set('state', inviteCode)
    return NextResponse.redirect(callbackUrl.toString())
  }

  const { getStravaAuthUrl } = await import('@/lib/strava/oauth')
  const redirectUri = `${baseUrl}/api/auth/strava/callback`
  return NextResponse.redirect(getStravaAuthUrl(redirectUri, inviteCode))
}
