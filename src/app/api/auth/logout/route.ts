import { NextRequest, NextResponse } from 'next/server'
import { getAppUrl } from '@/lib/utils/url'

export async function GET(request: NextRequest) {
  // Prevent Next.js client prefetcher from triggering background logout redirects
  if (
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('x-middleware-prefetch') === '1' ||
    request.headers.get('next-router-prefetch') === '1'
  ) {
    return new NextResponse(null, { status: 204 })
  }

  const baseUrl = getAppUrl(request)
  const response = NextResponse.redirect(`${baseUrl}/`)

  response.cookies.set('tm_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
