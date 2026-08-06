'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Calendar, Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Breadcrumbs from '@/components/common/Breadcrumbs'
import type { Competition, UserProfile } from '@/lib/supabase/types'

interface Props {
  competitions: Competition[]
  currentUser?: UserProfile | null
}

export default function CompetitionsClient({ competitions, currentUser }: Props) {
  const router = useRouter()
  const [joining, setJoining] = useState<string | null>(null)

  // Filter out deleted competitions and sort by status
  const activeCompetitions = competitions
    .filter(c => !c.is_deleted && (c.status === 'active' || c.status === 'registration'))
    .sort((a, b) => {
      // Active first, then registration, then by start date
      const statusOrder = { active: 0, registration: 1, draft: 2, ended: 3 }
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    })

  const handleJoin = async (inviteCode: string) => {
    setJoining(inviteCode)
    try {
      window.location.href = `/api/auth/strava?state=${inviteCode}`
    } catch (error) {
      console.error('Join error:', error)
      setJoining(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge" style={{ background: '#10B981', color: '#fff', fontWeight: 700 }}>🟢 Đang thi đấu</span>
      case 'registration':
        return <span className="badge" style={{ background: '#3B82F6', color: '#fff', fontWeight: 700 }}>🔵 Đang đăng ký</span>
      case 'ended':
        return <span className="badge badge-neutral">⚪ Đã kết thúc</span>
      default:
        return <span className="badge badge-neutral">📝 Nháp</span>
    }
  }

  const getTimelineComponent = (comp: Competition) => {
    const now = new Date().getTime()
    const regDeadline = new Date(comp.registration_deadline).getTime()
    const startDate = new Date(comp.start_date).getTime()
    const endDate = new Date(comp.end_date).getTime()

    // Determine current phase
    let currentPhase = 'before_registration'
    let phaseText = 'Sắp mở đăng ký'
    let phaseColor = 'var(--text-tertiary)'

    if (comp.status === 'ended' || (comp.status === 'active' && now > endDate)) {
      currentPhase = 'ended'
      phaseText = 'Đã kết thúc'
      phaseColor = 'var(--text-tertiary)'
    } else if (comp.status === 'active' && now >= startDate && now <= endDate) {
      currentPhase = 'active'
      phaseText = 'Đang thi đấu'
      phaseColor = 'var(--color-success)'
    } else if (comp.status === 'registration' && now >= regDeadline && now < startDate) {
      currentPhase = 'registration_closed'
      phaseText = 'Đóng đăng ký'
      phaseColor = 'var(--color-warning)'
    } else if (comp.status === 'registration' && now < regDeadline) {
      currentPhase = 'registration'
      phaseText = 'Đang đăng ký'
      phaseColor = 'var(--color-primary)'
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: phaseColor }}>
        <Clock size={14} />
        <span>{phaseText}</span>
      </div>
    )
  }

  const getJoinButton = (comp: Competition) => {
    if (!currentUser) {
      return (
        <a href={`/api/auth/strava?state=${comp.invite_code}`} className="btn btn-primary" style={{ gap: '0.35rem' }}>
          Tham gia ngay <ArrowRight size={14} />
        </a>
      )
    }

    if (comp.status === 'active') {
      return (
        <Link href="/dashboard" className="btn btn-secondary" style={{ gap: '0.35rem' }}>
          <CheckCircle2 size={14} /> Đã tham gia
        </Link>
      )
    }

    return (
      <button
        onClick={() => handleJoin(comp.invite_code)}
        disabled={joining === comp.invite_code}
        className="btn btn-primary"
        style={{ gap: '0.35rem' }}
      >
        {joining === comp.invite_code ? 'Đang xử lý...' : 'Tham gia giải'} <ArrowRight size={14} />
      </button>
    )
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem' }}>
      <Breadcrumbs items={[
        { label: 'Cuộc thi', current: true }
      ]} />
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Trophy size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Cuộc Thi
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.375rem)', fontWeight: 700, marginBottom: '0.2rem' }}>
          Khám phá các giải đấu
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)' }}>
          Tham gia các cuộc thi đang diễn ra và thi đấu với đồng nghiệp
        </p>
      </div>

      {!activeCompetitions || activeCompetitions.length === 0 ? (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <Trophy size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Chưa có cuộc thi nào
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Khi có cuộc thi mới, bạn sẽ thấy danh sách ở đây để tham gia.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeCompetitions.map(comp => (
            <div key={comp.id} className="card" style={{
              padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1.1rem, 3.5vw, 1.5rem)',
              borderLeftWidth: '4px',
              borderLeftColor: comp.status === 'active' ? 'var(--color-success)' : 'var(--color-primary)',
            }}>
              <div className="mobile-stack" style={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 'clamp(1rem, 3.5vw, 1.15rem)', fontWeight: 700, margin: 0 }}>
                      {comp.name}
                    </h2>
                    {getStatusBadge(comp.status)}
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      Mã: {comp.invite_code}
                    </span>
                  </div>
                  {comp.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.8rem, 2.5vw, 0.875rem)', marginBottom: '0.5rem' }}>
                      {comp.description}
                    </p>
                  )}
                </div>
                {getJoinButton(comp)}
              </div>

              <div className="mobile-stack" style={{ gap: '1rem', fontSize: 'clamp(0.775rem, 2.5vw, 0.825rem)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  {getTimelineComponent(comp)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                  <span><strong>Thi đấu:</strong> {new Date(comp.start_date).toLocaleDateString('vi-VN')} → {new Date(comp.end_date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <Users size={14} style={{ color: 'var(--color-info)' }} />
                  <span><strong>Đăng ký đến:</strong> {new Date(comp.registration_deadline).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-subtle)', borderStyle: 'dashed' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>💡</span>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Mẹo tham gia cuộc thi</h3>
        </div>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          <li>Nhấn "Tham gia ngay" để kết nối tài khoản Strava của bạn với hệ thống</li>
          <li>Sau khi tham gia, hệ thống sẽ tự động đồng bộ các bài tập trong thời gian thi đấu</li>
          <li>Đừng quên chọn phòng ban trước thời hạn đăng ký!</li>
          <li>Theo dõi bảng xếp hạng để xem thành tích của bạn và đồng nghiệp</li>
        </ul>
      </div>
    </div>
  )
}
