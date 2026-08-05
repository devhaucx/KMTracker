'use client'

import { useState } from 'react'
import { Building2, CheckCircle2 } from 'lucide-react'
import { MOCK_USER, MOCK_DEPARTMENTS } from '@/lib/mock/data'

export default function ProfilePage() {
  const [dept, setDept]       = useState('d1')
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(false)

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSaved(true); setTimeout(() => setSaved(false), 3000) }, 600)
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: 640 }}>

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, marginBottom: '0.2rem' }}>Hồ sơ cá nhân</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Cập nhật phòng ban để điểm của bạn được ghi nhận vào bảng đồng đội.
        </p>
      </div>

      <div className="card" style={{ padding: '1.75rem 2rem' }}>

        {/* User identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-base)', marginBottom: '1.5rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, flexShrink: 0 }}>
            {MOCK_USER.full_name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{MOCK_USER.full_name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem', fontSize: '0.825rem', color: 'var(--color-success)', fontWeight: 500 }}>
              <CheckCircle2 size={14} /> Đã kết nối Strava (#{MOCK_USER.strava_athlete_id})
            </div>
          </div>
        </div>

        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <Building2 size={14} style={{ color: 'var(--text-tertiary)' }} /> Phòng ban
            </label>
            <select value={dept} onChange={e => setDept(e.target.value)} className="input">
              {MOCK_DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
              Điểm của bạn sẽ cộng vào tổng điểm phòng ban này trên bảng xếp hạng đồng đội.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Vai trò</span>
            <span className="badge badge-blue">Vận động viên</span>
          </div>

          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 500 }}>
              <CheckCircle2 size={16} /> Đã lưu thay đổi thành công.
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.65rem' }} disabled={loading}>
            {loading ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  )
}
