'use server'

import { createClient } from '@supabase/supabase-js'
import { setSessionCookie } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function adminLogin(formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' }
  }

  // Use anon key for password verification (service_role bypasses auth)
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authData, error: authError } = await authClient.auth.signInWithPassword({ email, password })

  if (authError || !authData.user) {
    return { error: 'Email hoặc mật khẩu không đúng.' }
  }

  // Use service role to fetch profile (bypasses RLS)
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await adminClient
    .from('users')
    .select('id, role')
    .eq('id', authData.user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return { error: 'Tài khoản không có quyền quản trị.' }
  }

  const cookieStore = await cookies()
  const response = new Response()
  await setSessionCookie(profile.id, response)

  // Extract Set-Cookie header and set via next/headers
  const setCookie = response.headers.get('set-cookie')
  if (setCookie) {
    const [cookiePart] = setCookie.split(';')
    const [name, value] = cookiePart.split('=')
    cookieStore.set(name, value, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  redirect('/admin')
}
