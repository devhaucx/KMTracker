'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Trophy, RefreshCw, KeyRound, ArrowRight, Flame, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Activity, Competition, UserProfile } from '@/lib/supabase/types'

interface Props {
  user: UserProfile
  competitions: Competition[]
  activeCompetition: Competition | null
  activities: Activity[]
}

const SPORT_META: Record<string, { icon: string; badge: string; color: string; border: string }> = {
  Run:  { icon: '🏃', badge: 'badge badge-run',  color: 'var(--sport-run)',  border: 'var(--sport-run)' },
  Ride: { icon: '🚴', badge: 'badge badge-ride', color: 'var(--sport-ride)', border: 'var(--sport-ride)' },
  Walk: { icon: '🚶', badge: 'badge badge-walk', color: 'var(--sport-walk)', border: 'var(--sport-walk)' },
  Swim: { icon: '🏊', badge: 'badge badge-swim', color: 'var(--sport-swim)', border: 'var(--sport-swim)' },
}

export default function DashboardClient({ user, competitions, activeCompetition, activities }: Props) {
  const router = useRouter()
  const [selectedCompId, setSelectedCompId] = useState(activeCompetition?.id || competitions[0]?.id || '')
  const [resyncing, setResyncing] = useState(false)
  const [resyncMsg, setResyncMsg] = useState('')
  const [inputCode, setInputCode] = useState('')

  const selectedComp = competitions.find(c => c.id === selectedCompId) || activeCompetition

  const compActivities = activities.filter(a => !selectedComp || a.competition_id === selectedComp.id)

  const totalConverted = compActivities.filter(a => a.is_valid).reduce((s, a) => s + a.distance_converted_km, 0)
  const totalActual = compActivities.filter(a => a.is_valid).reduce((s, a) => s + a.distance_actual_km, 0)
  const validCount = compActivities.filter(a => a.is_valid).length

  const sportBreakdown = ['Run', 'Ride', 'Walk', 'Swim'].map(sport => {
    const sportActs = compActivities.filter(a => a.is_valid && a.sport_type === sport)
    const km = sportActs.reduce((s, a) => s + a.distance_converted_km, 0)
    return { sport, km, count: sportActs.length }
  }).filter(s => s.km > 0)

  const sportTotal = sportBreakdown.reduce((s, x) => s + x.km, 0)

  const handleResync = () => {
    setResyncing(true)
    setTimeout(() => {
      setResyncing(false)
      window.location.reload()
    }, 800)
  }

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim()) return
    const code = inputCode.includes('/join/')
      ? inputCode.split('/join/')[1].split('/')[0].split('?')[0]
      : inputCode.trim()
    router.push(`/join/${code.toUpperCase()}`)
  }

  const STATS = [
    { label: 'KM quy đổi',     value: totalConverted.toFixed(1), sub: 'km',  accent: 'var(--color-primary)' },
    { label: 'Bài tập hợp lệ', value: `${validCount}`,            sub: 'hoạt động', accent: 'var(--color-success)' },
    { label: 'KM thực tế',      value: totalActual.toFixed(1),    sub: 'km',  accent: 'var(--text-primary)' },
    { label: 'Tổng hoạt động',  value: `${compActivities.length}`, sub: 'từ Strava', accent: 'var(--text-secondary)' },
  ]

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem' }}>

      {/* 1. Competition banner (simplified) */}
      {selectedComp && (
        <div className="card" style={{
          padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--bg-base) 100%)',
          borderColor: 'var(--color-primary)',
          borderLeftWidth: '6px', borderLeftColor: 'var(--color-primary)',
        }}>
          <div className="mobile-stack" style={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: '#EF4444', color: '#fff', fontWeight: 800, padding: '0.25rem 0.6rem', gap: '0.3rem', fontSize: '0.75rem' }}>
                  <Flame size={12} /> ĐANG THAM GIA
                </span>
                <span className="badge badge-blue" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Mã: {selectedComp.invite_code}</span>
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.2rem' }}>{selectedComp.name}</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {new Date(selectedComp.start_date).toLocaleDateString('vi-VN')} → {new Date(selectedComp.end_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
            {competitions.length > 1 && (
              <select value={selectedCompId} onChange={e => setSelectedCompId(e.target.value)} className="input mobile-full-width"
                style={{ width: 'auto', minWidth: 180, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                {competitions.map(c => <option key={c.id} value={c.id}>{c.name} ({c.invite_code})</option>)}
              </select>
            )}
          </div>
        </div>
      )}

      {/* 2. Stats + Resync button */}
      <div className="mobile-stack" style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.1rem' }}>
            Thành tích của {user.full_name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
            {user.strava_athlete_id ? `Strava #${user.strava_athlete_id}` : 'Chưa kết nối Strava'}
          </p>
        </div>
        <button onClick={handleResync} disabled={resyncing} className="btn btn-secondary btn-sm mobile-full-width" style={{ gap: '0.35rem' }}>
          <RefreshCw size={14} className={resyncing ? 'animate-spin' : ''} /> {resyncing ? 'Đang đồng bộ...' : 'Đồng bộ lại'}
        </button>
      </div>

      <div className="stats-grid-mobile" style={{ marginBottom: '1.5rem' }}>
        {STATS.map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.accent}` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.accent }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 3. Activity history (PRIMARY content — moved up) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Lịch sử bài tập</h2>
        {selectedComp && (
          <span className="hide-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            {new Date(selectedComp.start_date).toLocaleDateString('vi-VN')} → {new Date(selectedComp.end_date).toLocaleDateString('vi-VN')}
          </span>
        )}
      </div>

      {compActivities.length === 0 ? (
        <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Chưa có bài tập nào được đồng bộ. Hoàn thành hoạt động trên Strava để bài tập tự động xuất hiện!
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table view */}
          <div className="desktop-table-view">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Hoạt động</th>
                    <th>Môn</th>
                    <th style={{ textAlign: 'right' }}>Thực tế</th>
                    <th style={{ textAlign: 'right' }}>Quy đổi</th>
                    <th style={{ textAlign: 'center' }}>Pace/Speed</th>
                    <th style={{ textAlign: 'center' }}>Hợp lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {compActivities.map(a => {
                    const meta = SPORT_META[a.sport_type] || { icon: '体育局', badge: 'badge', color: 'var(--text-tertiary)', border: 'var(--border-base)' }
                    return (
                      <tr key={a.id}>
                        <td>
                          <a href={`https://www.strava.com/activities/${a.strava_activity_id}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                            {a.activity_name} ↗
                          </a>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                            {new Date(a.start_date).toLocaleDateString('vi-VN')} · #{a.strava_activity_id}
                          </div>
                        </td>
                        <td><span className={meta.badge}>{meta.icon} {a.sport_type}</span></td>
                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{a.distance_actual_km.toFixed(1)} km</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: a.is_valid ? 'var(--color-primary)' : 'var(--text-tertiary)' }}>
                          {a.distance_converted_km.toFixed(1)} km
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{a.pace_or_speed}</td>
                        <td style={{ textAlign: 'center' }}>
                          {a.is_valid
                            ? <span className="badge status-ok" style={{ gap: '0.25rem' }}><CheckCircle2 size={13} /> Hợp lệ</span>
                            : <span className="badge status-err" title={a.rejection_reason || ''} style={{ gap: '0.25rem', cursor: 'help' }}><XCircle size={13} /> Loại</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card view */}
          <div className="mobile-card-view">
            {compActivities.map(a => {
              const meta = SPORT_META[a.sport_type] || { icon: '体育局', badge: 'badge', color: 'var(--text-tertiary)', border: 'var(--border-base)' }
              return (
                <div key={a.id} className="card" style={{ padding: '1rem 1.25rem', borderLeftWidth: '4px', borderLeftColor: meta.border }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <a href={`https://www.strava.com/activities/${a.strava_activity_id}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.activity_name} ↗
                    </a>
                    <span className={meta.badge} style={{ fontSize: '0.7rem', flexShrink: 0 }}>{meta.icon} {a.sport_type}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.6rem' }}>
                    {new Date(a.start_date).toLocaleDateString('vi-VN')} · #{a.strava_activity_id}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.825rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Thực tế</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{a.distance_actual_km.toFixed(1)} km</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Quy đổi</div>
                      <div style={{ fontWeight: 700, color: a.is_valid ? 'var(--color-primary)' : 'var(--text-tertiary)' }}>{a.distance_converted_km.toFixed(1)} km</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Pace</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{a.pace_or_speed}</div>
                    </div>
                  </div>
                  {a.is_valid
                    ? <span className="badge status-ok" style={{ gap: '0.25rem', fontSize: '0.7rem' }}><CheckCircle2 size={12} /> Hợp lệ</span>
                    : <span className="badge status-err" style={{ gap: '0.25rem', fontSize: '0.7rem' }}><XCircle size={12} /> Loại{a.rejection_reason ? ` · ${a.rejection_reason}` : ''}</span>}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* 4. Sport breakdown — progress bars */}
      {sportBreakdown.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.75rem' }}>Phân bổ môn thể thao</h2>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sportBreakdown.map(s => {
              const meta = SPORT_META[s.sport]
              const pct = sportTotal > 0 ? Math.round((s.km / sportTotal) * 100) : 0
              return (
                <div key={s.sport}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '3px', background: meta?.color }} />
                      {meta?.icon} {s.sport}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {s.km.toFixed(1)} km
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 'var(--radius-full)', background: 'var(--bg-muted)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 'var(--radius-full)',
                      background: meta?.color, width: `${pct}%`,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.2rem', textAlign: 'right' }}>
                    {pct}% tổng số · {s.count} bài tập
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 5. Join by code (collapsible) */}
      <details style={{ marginTop: '1.5rem' }}>
        <summary className="card-subtle" style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
          <KeyRound size={15} style={{ color: 'var(--color-primary)' }} /> Tham gia giải khác
          <ChevronDown size={15} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }} />
        </summary>
        <form onSubmit={handleJoinByCode} className="mobile-stack" style={{ marginTop: '0.75rem', alignItems: 'stretch' }}>
          <input type="text" required placeholder="Nhập mã mời hoặc dán link..." value={inputCode}
            onChange={e => setInputCode(e.target.value)} className="input mobile-full-width" style={{ fontSize: '0.85rem', flex: 1 }} />
          <button type="submit" className="btn btn-primary btn-sm mobile-full-width" style={{ gap: '0.25rem', whiteSpace: 'nowrap' }}>
            Vào giải <ArrowRight size={14} />
          </button>
        </form>
      </details>

      {resyncMsg && (
        <div className="card" style={{ padding: '0.85rem 1.25rem', marginTop: '1.5rem', background: 'var(--color-primary-light)', borderColor: 'var(--color-primary-ring)', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
          <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> {resyncMsg}
        </div>
      )}
    </div>
  )
}
