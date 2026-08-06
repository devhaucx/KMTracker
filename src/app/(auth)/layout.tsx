import { getCurrentUser } from '@/lib/auth/session'
import { ShieldAlert } from 'lucide-react'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
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
