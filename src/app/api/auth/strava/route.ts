import { NextRequest, NextResponse } from 'next/server'
import { getAppUrl } from '@/lib/utils/url'

export async function GET(request: NextRequest) {
  // Prevent Next.js client prefetcher from triggering external OAuth redirect CORS errors
  if (
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('x-middleware-prefetch') === '1' ||
    request.headers.get('next-router-prefetch') === '1'
  ) {
    return new NextResponse(null, { status: 204 })
  }

  const inviteCode = request.nextUrl.searchParams.get('invite') || ''
  const baseUrl = getAppUrl(request)

  const { getStravaAuthUrl } = await import('@/lib/strava/oauth')
  const redirectUri = `${baseUrl}/api/auth/strava/callback`
  return NextResponse.redirect(getStravaAuthUrl(redirectUri, inviteCode))
}
