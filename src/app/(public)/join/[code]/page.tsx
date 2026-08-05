'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { Trophy, Calendar, Users, CheckCircle2, ArrowRight, Zap, Building2, Clock } from 'lucide-react'
import { MOCK_DEPARTMENTS } from '@/lib/mock/data'

interface JoinPageProps {
  params: Promise<{ code: string }>
}

const SPORTS = [
  { cls: 'badge-run',  label: '🏃 Chạy bộ', rule: 'Pace 4–9 min/km',       conv: '1 km = 1 km quy đổi' },
  { cls: 'badge-walk', label: '🚶 Đi bộ',   rule: 'Pace 9–14 min/km',      conv: '1 km = 1 km quy đổi' },
  { cls: 'badge-ride', label: '🚴 Đạp xe',  rule: 'Tốc độ 10–25 km/h',    conv: '3 km = 1 km quy đổi' },
  { cls: 'badge-swim', label: '🏊 Bơi lội', rule: 'Pace 2–6 min/100m',    conv: '0.2 km = 1 km quy đổi' },
]

export default function JoinPage({ params }: JoinPageProps) {
  const { code } = use(params)
  const [selectedDept, setSelectedDept] = useState('d1')

  // Live Countdown state to 2026-09-10T00:00:00
  const targetDate = new Date('2026-09-10T00:00:00').getTime()
  const [timeLeft, setTimeLeft] = useState({ days: 35, hours: 14, minutes: 22, seconds: 10 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const diff = targetDate - now
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: 680 }}>

      {/* Card wrapper */}
      <div className="card" style={{ padding: '2.25rem 2rem' }}>

        {/* Badge + Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.75rem', gap: '0.75rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={28} style={{ color: 'var(--color-primary)' }} />
          </div>

          <span className="badge badge-blue" style={{ fontSize: '0.8rem', letterSpacing: '0.04em' }}>
            Mã mời: {code.toUpperCase()}
          </span>

          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Giải Thể Thao Mùa Thu 2026
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, maxWidth: 480 }}>
            Bạn đã nhận được lời mời tham gia thi đua thể thao giữa các cá nhân và phòng ban. Kết nối Strava một lần, mọi bài tập tự động được ghi nhận.
          </p>
        </div>

        {/* Live Countdown Timer */}
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-base)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            <Clock size={15} /> Khai mạc sau
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {[
              { num: timeLeft.days, label: 'Ngày' },
              { num: timeLeft.hours, label: 'Giờ' },
              { num: timeLeft.minutes, label: 'Phút' },
              { num: timeLeft.seconds, label: 'Giây' },
            ].map((t, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)', lineHeight: 1 }}>
                  {String(t.num).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.2rem', fontWeight: 500 }}>
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="card-subtle" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Calendar size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Thời gian thi đấu</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>10/09 – 30/09/2026</div>
            </div>
          </div>
          <div className="card-subtle" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Users size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Đã tham gia</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>500+ Vận động viên</div>
            </div>
          </div>
        </div>

        {/* Choose Department on Join */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            <Building2 size={15} style={{ color: 'var(--color-primary)' }} /> Chọn phòng ban đại diện của bạn:
          </label>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="input"
            style={{ fontWeight: 500 }}
          >
            {MOCK_DEPARTMENTS.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
            Thành tích tập luyện của bạn sẽ được tích lũy tự động cho cá nhân và đóng góp vào tổng điểm của phòng ban đã chọn.
          </p>
        </div>

        {/* Sports */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
            Bộ môn được tính điểm
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {SPORTS.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span className={`badge ${s.cls}`} style={{ fontSize: '0.8rem' }}>{s.label}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.rule}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{s.conv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/api/auth/strava?invite=${code}&dept=${selectedDept}`}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Zap size={18} /> Tham gia bằng Strava <ArrowRight size={16} />
        </Link>

        <p style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '0.85rem', lineHeight: 1.5 }}>
          Bằng việc bấm tham gia, bạn đồng ý cấp quyền xem hoạt động tập luyện công khai cho hệ thống.<br />
          Xem <Link href="/rules" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>thể lệ đầy đủ</Link> trước khi tham gia.
        </p>
      </div>
    </div>
  )
}
