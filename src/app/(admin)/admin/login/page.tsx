'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    setTimeout(() => {
      if (email && password) { document.cookie = 'admin_session=true; path=/'; router.push('/admin') }
      else { setError('Vui lòng nhập đầy đủ email và mật khẩu.') }
      setLoading(false)
    }, 600)
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-muted)', border: '1px solid var(--border-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Shield size={22} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.3rem' }}>Đăng nhập Quản trị</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Dành riêng cho Ban Tổ Chức và Quản trị hệ thống.
          </p>
        </div>

        <div className="card" style={{ padding: '1.75rem 2rem' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <Mail size={13} style={{ color: 'var(--text-tertiary)' }} /> Email
              </label>
              <input type="email" required placeholder="admin@company.com" value={email}
                onChange={e => setEmail(e.target.value)} className="input" />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <Lock size={13} style={{ color: 'var(--text-tertiary)' }} /> Mật khẩu
              </label>
              <input type="password" required placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} className="input" />
            </div>

            {error && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: 500 }}>{error}</p>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', marginTop: '0.25rem' }} disabled={loading}>
              {loading ? 'Đang đăng nhập…' : <><ArrowRight size={16} /> Truy cập trang quản trị</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
