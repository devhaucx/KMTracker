import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const inviteCode = request.nextUrl.searchParams.get('invite') || ''
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`

  const { getStravaAuthUrl } = await import('@/lib/strava/oauth')
  const redirectUri = `${baseUrl}/api/auth/strava/callback`
  return NextResponse.redirect(getStravaAuthUrl(redirectUri, inviteCode))
}
