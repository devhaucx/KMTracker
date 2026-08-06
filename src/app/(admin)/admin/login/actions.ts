'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceKey } from '@/lib/supabase/config'

export async function adminLogin(prevState: any, formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' }
  }

  // Use anon key for password verification (service_role bypasses auth)
  const authClient = createClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authData, error: authError } = await authClient.auth.signInWithPassword({ email, password })

  if (authError || !authData.user) {
    console.error('Supabase Auth Login Error:', authError)
    return { error: authError?.message || 'Email hoặc mật khẩu không đúng.' }
  }

  // Use service role to fetch profile (bypasses RLS)
  const adminClient = createClient(
    getSupabaseUrl(),
    getSupabaseServiceKey(),
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

  const { createSessionToken } = await import('@/lib/auth/session')
  const token = await createSessionToken(profile.id, profile.role || 'admin')

  const cookieStore = await cookies()
  cookieStore.set('tm_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })

  redirect('/admin')
}
