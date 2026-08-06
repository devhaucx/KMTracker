import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { UserProfile, UserRole } from '@/lib/supabase/types'

const SESSION_COOKIE = 'tm_session'
const DEFAULT_SESSION_SECRET = 'tm-tracker-dev-secret-change-in-prod-2026'

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET
}

async function hmacSign(payload: string): Promise<string> {
  const secret = getSessionSecret()
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return Buffer.from(sig).toString('base64url')
}

async function hmacVerify(payload: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(payload)
  return expected === signature
}

export async function createSessionToken(userId: string, role: string = 'user'): Promise<string> {
  const payload = `${userId}.${Date.now()}.${role}`
  const sig = await hmacSign(payload)
  return `${payload}.${sig}`
}

async function verifySessionToken(token: string): Promise<{ userId: string; role: string } | null> {
  const parts = token.split('.')
  if (parts.length !== 4) return null
  const [userId, timestamp, role, sig] = parts
  const payload = `${userId}.${timestamp}.${role}`
  const valid = await hmacVerify(payload, sig)
  if (!valid) return null
  const ageHours = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60)
  if (ageHours > 24 * 30) return null
  return { userId, role: role || 'user' }
}

export async function setSessionCookie(userId: string, response: Response, role: string = 'user') {
  const token = await createSessionToken(userId, role)
  response.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax; Secure`
  )
}

export function clearSessionCookie(response: Response) {
  response.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`
  )
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value || headerStore.get('x-tm-session') || null

  if (!sessionCookie) return null

  const sessionData = await verifySessionToken(sessionCookie)
  if (!sessionData) return null

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  const { data: profile, error } = await admin
    .from('users')
    .select('*')
    .eq('id', sessionData.userId)
    .single()

  if (error || !profile) return null

  return profile as UserProfile | null
}

export async function requireNonAdmin(): Promise<UserProfile> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/?auth=required')
  }
  // Redirect admin users to admin dashboard
  if (user.role === 'admin' || user.role === 'super_admin') {
    redirect('/admin')
  }
  return user
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/admin/login?error=unauthenticated')
  }
  return user
}

export async function requireAdmin(): Promise<UserProfile> {
  const user = await requireAuth()
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    redirect('/admin/login?error=forbidden')
  }
  return user
}

export async function getCurrentUserIdFromRequest(request: Request): Promise<{ userId: string; role: string } | null> {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [k, ...v] = c.split('=')
      return [k, v.join('=')]
    })
  )
  const token = cookies[SESSION_COOKIE] || request.headers.get('x-tm-session')
  if (!token) return null
  return verifySessionToken(token)
}
