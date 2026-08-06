'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { Trophy, Calendar, Users, CheckCircle2, ArrowRight, Zap, Building2, Clock } from 'lucide-react'
import type { Competition, CompetitionSport, Department } from '@/lib/supabase/types'

const SPORT_BADGE: Record<string, string> = { Run: 'badge-run', Walk: 'badge-walk', Ride: 'badge-ride', Swim: 'badge-swim' }
const SPORT_ICON: Record<string, string> = { Run: '🏃', Walk: '🚶', Ride: '🚴', Swim: '🏊' }

interface Props {
  code: string
  competition: Competition | null
  sports: CompetitionSport[]
  departments: Department[]
}

export default function JoinClient({ code, competition, sports, departments }: Props) {
  const [selectedDept, setSelectedDept] = useState(departments[0]?.id || '')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const targetDate = competition ? new Date(competition.start_date).getTime() : 0

  useEffect(() => {
    if (!targetDate) return
    const timer = setInterval(() => {
      const diff = targetDate - Date.now()
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

  const startDate = competition ? new Date(competition.start_date).toLocaleDateString('vi-VN') : ''
  const endDate = competition ? new Date(competition.end_date).toLocaleDateString('vi-VN') : ''

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem', maxWidth: 680 }}>
      <div className="card" style={{ padding: '1.75rem 1.5rem' }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem', gap: '0.6rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={28} style={{ color: 'var(--color-primary)' }} />
          </div>
          <span className="badge badge-blue" style={{ fontSize: '0.8rem' }}>Mã mời: {code.toUpperCase()}</span>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {competition?.name || 'Giải Thể Thao'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: 480 }}>
            Kết nối Strava một lần, mọi bài tập tự động được ghi nhận và quy đổi điểm.
          </p>
        </div>

        {competition && targetDate > Date.now() && (
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-base)', borderRadius: 'var(--radius-xl)', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              <Clock size={14} /> Khai mạc sau
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[
                { num: timeLeft.days, label: 'Ngày' },
                { num: timeLeft.hours, label: 'Giờ' },
                { num: timeLeft.minutes, label: 'Phút' },
                { num: timeLeft.seconds, label: 'Giây' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    {String(t.num).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mobile-grid-1col" style={{ '--grid-min': '240px', marginBottom: '1.5rem' } as React.CSSProperties}>
          <div className="card-subtle" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Calendar size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Thời gian</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{startDate} – {endDate}</div>
            </div>
          </div>
          <div className="card-subtle" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Users size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Mã giải</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{competition?.invite_code}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <Building2 size={15} style={{ color: 'var(--color-primary)' }} /> Chọn phòng ban:
          </label>
          <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="input">
            {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
          </select>
        </div>

        {sports.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Bộ môn được tính điểm
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sports.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                    <span className={`badge ${SPORT_BADGE[s.sport_type] || ''}`} style={{ fontSize: '0.8rem' }}>
                      {SPORT_ICON[s.sport_type] || ''} {s.display_name}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {s.min_pace_or_speed}–{s.max_pace_or_speed} {s.validation_unit}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Tỉ lệ: {s.conversion_ratio}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href={`/api/auth/strava?invite=${code}&dept=${selectedDept}`} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
          <Zap size={18} /> Tham gia bằng Strava <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
