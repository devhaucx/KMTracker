import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'experimental-edge'

const SESSION_COOKIE = 'tm_session'

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin') && pathname !== '/admin/login'
}

function isUserRoute(pathname: string): boolean {
  return pathname.startsWith('/dashboard') ||
         pathname.startsWith('/profile') ||
         pathname.startsWith('/competitions') ||
         pathname.startsWith('/leaderboard') && !pathname.startsWith('/admin/leaderboard')
}

function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/dashboard') || pathname.startsWith('/profile')
}

function hasValidSessionStructure(cookie: string | undefined): boolean {
  if (!cookie) return false
  const parts = cookie.split('.')
  return parts.length === 4 && parts[0].length > 0 // Updated for new format: userId.timestamp.role.signature
}

function getRoleFromSession(cookie: string | undefined): string | null {
  if (!cookie) return null
  const parts = cookie.split('.')
  if (parts.length !== 4) return null
  return parts[2] || null // Role is at index 2
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
  // Only redirect if user is explicitly requesting admin login page (not from forbidden error)
  if (pathname === '/admin/login' && hasValidSessionStructure(sessionCookie) && !request.url.includes('error=forbidden')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (isAdminRoute(pathname)) {
    if (!hasValidSessionStructure(sessionCookie)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Check if user has admin role from session token
    const userRole = getRoleFromSession(sessionCookie)
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/admin/login?error=forbidden', request.url))
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

  // Block admin users from accessing user pages
  if (isUserRoute(pathname) && hasValidSessionStructure(sessionCookie)) {
    const userRole = getRoleFromSession(sessionCookie)
    if (userRole === 'admin' || userRole === 'super_admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
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
