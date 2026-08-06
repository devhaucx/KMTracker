import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'experimental-edge'

const SESSION_COOKIE = 'tm_session'

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin') && pathname !== '/admin/login'
}

function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/dashboard') || pathname.startsWith('/profile')
}

function hasValidSessionStructure(cookie: string | undefined): boolean {
  if (!cookie) return false
  const parts = cookie.split('.')
  return parts.length === 3 && parts[0].length > 0
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-icon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value

  // Auto-redirect already authenticated admin visiting /admin/login to /admin
  if (pathname === '/admin/login' && hasValidSessionStructure(sessionCookie)) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (isAdminRoute(pathname)) {
    if (!hasValidSessionStructure(sessionCookie)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const requestHeaders = new Headers(request.headers)
    if (sessionCookie) {
      requestHeaders.set('x-tm-session', sessionCookie)
    }
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  if (isAuthRoute(pathname) && !hasValidSessionStructure(sessionCookie)) {
    return NextResponse.redirect(new URL('/?auth=required', request.url))
  }

  const requestHeaders = new Headers(request.headers)
  if (sessionCookie) {
    requestHeaders.set('x-tm-session', sessionCookie)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!api/webhook|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.svg).*)',
  ],
}
