'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, CheckCircle2, LogOut } from 'lucide-react'
import { updateDepartment } from '@/app/(auth)/profile/actions'
import type { UserProfile, Department } from '@/lib/supabase/types'

export default function ProfileClient({ user, departments }: { user: UserProfile; departments: Department[] }) {
  const [dept, setDept] = useState(user.department_id || '')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await updateDepartment(dept)
    setLoading(false)
    if (result?.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem', maxWidth: 640 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.375rem)', fontWeight: 700, marginBottom: '0.2rem' }}>Hồ sơ cá nhân</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)' }}>
          Cập nhật phòng ban để điểm được ghi nhận vào bảng đồng đội.
        </p>
      </div>

      <div className="card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <div className="mobile-stack" style={{ alignItems: 'center', gap: '1rem', paddingBottom: 'clamp(0.875rem, 2.5vw, 1.25rem)', borderBottom: '1px solid var(--border-base)', marginBottom: 'clamp(0.875rem, 2.5vw, 1.25rem)' }}>
          <div style={{ width: 'clamp(56px, 15vw, 64px)', height: 'clamp(56px, 15vw, 64px)', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 700, flexShrink: 0 }}>
            {user.full_name.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 'clamp(0.95rem, 3vw, 1.05rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name}</div>
            {user.strava_athlete_id && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem', fontSize: 'clamp(0.75rem, 2.5vw, 0.825rem)', color: 'var(--color-success)', fontWeight: 500 }}>
                <CheckCircle2 size={14} /> <span className="hide-mobile">Đã kết nối Strava (#{user.strava_athlete_id})</span><span className="show-mobile">Strava ✓</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: 'clamp(0.8rem, 2.5vw, 0.875rem)', marginBottom: '0.5rem' }}>
              <Building2 size={14} style={{ color: 'var(--text-tertiary)' }} /> Phòng ban
            </label>
            <select value={dept} onChange={e => setDept(e.target.value)} className="input">
              <option value="">-- Chọn phòng ban --</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(0.6rem, 2vw, 0.875rem) clamp(0.75rem, 2.5vw, 1rem)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: 'clamp(0.8rem, 2.5vw, 0.875rem)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Vai trò</span>
            <span className="badge badge-blue">{user.role === 'admin' || user.role === 'super_admin' ? 'Quản trị' : 'Vận động viên'}</span>
          </div>

          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', fontSize: 'clamp(0.8rem, 2.5vw, 0.875rem)', fontWeight: 500 }}>
              <CheckCircle2 size={16} /> Đã lưu thành công.
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 'clamp(0.55rem, 2vw, 0.65rem)' }} disabled={loading}>
            {loading ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      <a href="/api/auth/logout" className="btn btn-sm" style={{
        width: '100%', justifyContent: 'center', marginTop: '1rem',
        color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)',
        background: 'transparent', gap: '0.4rem',
      }}>
        <LogOut size={15} /> Đăng xuất
      </a>
    </div>
  )
}
