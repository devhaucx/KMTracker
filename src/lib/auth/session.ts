import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { UserProfile, UserRole } from '@/lib/supabase/types'

const SESSION_COOKIE = 'tm_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'tm-tracker-dev-secret-change-in-prod'

async function hmacSign(payload: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SESSION_SECRET),
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

export async function createSessionToken(userId: string): Promise<string> {
  const payload = `${userId}.${Date.now()}`
  const sig = await hmacSign(payload)
  return `${payload}.${sig}`
}

async function verifySessionToken(token: string): Promise<string | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [userId, timestamp, sig] = parts
  const payload = `${userId}.${timestamp}`
  const valid = await hmacVerify(payload, sig)
  if (!valid) return null
  const ageHours = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60)
  if (ageHours > 24 * 30) return null
  return userId
}

export async function setSessionCookie(userId: string, response: Response) {
  const token = await createSessionToken(userId)
  response.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  )
}

export function clearSessionCookie(response: Response) {
  response.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  )
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionCookie) return null

  const userId = await verifySessionToken(sessionCookie)
  if (!userId) return null

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return profile as UserProfile | null
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/?auth=required')
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

export async function getCurrentUserIdFromRequest(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [k, ...v] = c.split('=')
      return [k, v.join('=')]
    })
  )
  const token = cookies[SESSION_COOKIE]
  if (!token) return null
  return verifySessionToken(token)
}
