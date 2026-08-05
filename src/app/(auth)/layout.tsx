'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_USER } from '@/lib/mock/data'
import { ShieldAlert } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(true)

  // In real implementation, check Supabase auth session or cookies.
  // In mock mode, user is authenticated by default or redirected.
  useEffect(() => {
    // Mock authorization check
    const hasMockSession = true
    if (!hasMockSession) {
      setAuthorized(false)
      router.push('/api/auth/strava')
    }
  }, [router])

  if (!authorized) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 400, margin: '0 auto', padding: '2rem' }}>
          <ShieldAlert size={36} style={{ color: 'var(--color-warning)', margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Yêu cầu đăng nhập</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Bạn cần kết nối tài khoản Strava để truy cập nội dung này.
          </p>
          <a href="/api/auth/strava" className="btn btn-primary" style={{ width: '100%' }}>
            Đăng nhập Strava
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
