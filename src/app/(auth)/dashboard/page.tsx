'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Trophy, Zap, TrendingUp, PieChart, RefreshCw, KeyRound, ArrowRight, Layers, HelpCircle, Flame } from 'lucide-react'
import { MOCK_MY_STATS, MOCK_MY_ACTIVITIES, MOCK_USER, MOCK_COMPETITIONS_LIST } from '@/lib/mock/data'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const AVAILABLE_COMPETITIONS = MOCK_COMPETITIONS_LIST.filter(c => !c.is_deleted)

export default function DashboardPage() {
  const router = useRouter()

  // Single Active Competition State (1 user participates in 1 active competition context at a time)
  const [selectedCompId, setSelectedCompId] = useState(AVAILABLE_COMPETITIONS[0]?.id || 'comp-1')
  const activeComp = AVAILABLE_COMPETITIONS.find(c => c.id === selectedCompId) || AVAILABLE_COMPETITIONS[0]

  const [resyncing, setResyncing] = useState(false)
  const [resyncMsg, setResyncMsg] = useState('')
  const [inputCode, setInputCode] = useState('')

  // Dynamically compute rescored stats based on the selected competition's date range and rules
  const isCompAutumn = selectedCompId === 'comp-1'
  const isCompSummer = selectedCompId === 'comp-2'

  const currentConvertedKm = isCompAutumn ? 84.5 : isCompSummer ? 52.0 : 42.5
  const currentRank = isCompAutumn ? 1 : isCompSummer ? 3 : 5
  const currentValidCount = isCompAutumn ? 12 : isCompSummer ? 8 : 6

  const dynamicActivities = MOCK_MY_ACTIVITIES.map(act => {
    if (isCompSummer) {
      const isJune = act.date.includes('06/') || act.date.includes('/06')
      return {
        ...act,
        valid: isJune,
        conv: isJune ? act.actual * 1.0 : 0,
        reason: isJune ? null : 'Hoạt động nằm ngoài thời gian diễn ra của Giải Mùa Hè 2026 (01/06 - 30/06)'
      }
    }
    return act
  })

  const handleUserResync = () => {
    setResyncing(true)
    setResyncMsg('')
    setTimeout(() => {
      setResyncing(false)
      setResyncMsg(`Đã quét & quy đổi lại thành công! Tất cả bài tập Strava đã được tính toán đúng theo khung thời gian (${activeComp.start_date} → ${activeComp.end_date}) và tỉ lệ quy đổi của ${activeComp.name}.`)
      setTimeout(() => setResyncMsg(''), 5000)
    }, 800)
  }

  const handleCompSwitch = (newCompId: string) => {
    setSelectedCompId(newCompId)
    const targetComp = AVAILABLE_COMPETITIONS.find(c => c.id === newCompId)
    setResyncMsg(`🔄 Đã chuyển ngữ cảnh cuộc thi sang "${targetComp?.name}"! Dữ liệu bài tập Strava được tự động quy đổi & cập nhật đúng theo mốc thời gian diễn ra của giải này. Bấm chuyển ngược lại để khôi phục điểm cũ bất cứ lúc nào.`)
    setTimeout(() => setResyncMsg(''), 6000)
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
    { label: 'Thứ hạng cá nhân', value: `#${currentRank}`,                       sub: `trong ${activeComp.participant_count} VĐV`, accent: 'var(--rank-gold)' },
    { label: 'KM quy đổi',       value: `${currentConvertedKm.toFixed(1)}`,       sub: `km (${activeComp.invite_code})`,            accent: 'var(--color-primary)' },
    { label: 'Bài tập hợp lệ',   value: `${currentValidCount}`,                   sub: 'hoạt động đạt chuẩn',                      accent: 'var(--color-success)' },
    { label: 'KM thực tế',        value: `${MOCK_MY_STATS.total_actual_km}`,      sub: 'km tích lũy toàn bộ',                      accent: 'var(--text-primary)' },
  ]

  const SPORT_BREAKDOWN = [
    { name: 'Chạy bộ', value: isCompSummer ? 32.0 : 45.5, color: 'var(--sport-run)', percentage: isCompSummer ? 62 : 54, icon: '🏃' },
    { name: 'Đạp xe',  value: isCompSummer ? 15.0 : 24.0, color: 'var(--sport-ride)', percentage: isCompSummer ? 28 : 28, icon: '🚴' },
    { name: 'Đi bộ',   value: isCompSummer ? 5.0 : 10.0,   color: 'var(--sport-walk)', percentage: isCompSummer ? 10 : 12, icon: '🚶' },
  ]

  const DAILY_PROGRESS = [
    { day: '26/07', km: isCompSummer ? 0 : 8.0 },
    { day: '27/07', km: isCompSummer ? 0 : 6.2 },
    { day: '28/07', km: isCompSummer ? 0 : 5.0 },
    { day: '30/07', km: 0.0 },
    { day: '01/08', km: isCompSummer ? 5.0 : 5.0 },
    { day: '03/08', km: isCompSummer ? 10.0 : 12.0 },
    { day: '05/08', km: isCompSummer ? 8.2 : 10.2 },
  ]

  const maxKm = Math.max(...DAILY_PROGRESS.map(d => d.km), 1)

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>

      {/* PROMINENT ACTIVE COMPETITION BANNER AT TOP */}
      <div className="card" style={{
        padding: '1.5rem 1.75rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--bg-base) 100%)',
        borderColor: 'var(--color-primary)',
        boxShadow: 'var(--shadow-md)',
        borderLeftWidth: '6px',
        borderLeftColor: 'var(--color-primary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge" style={{ background: '#EF4444', color: '#fff', fontWeight: 800, padding: '0.3rem 0.75rem', gap: '0.35rem', fontSize: '0.8rem' }}>
              <Flame size={14} /> ĐANG THAM GIA THI ĐẤU GIẢI DẤU:
            </span>
            <span className="badge badge-blue" style={{ fontWeight: 700 }}>
              Mã Mời: {activeComp.invite_code}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Đổi sang giải khác:
            </span>
            <select
              value={selectedCompId}
              onChange={e => handleCompSwitch(e.target.value)}
              className="input"
              style={{ width: 'auto', minWidth: 200, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', background: 'var(--bg-base)', borderColor: 'var(--color-primary-ring)' }}
            >
              {AVAILABLE_COMPETITIONS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.invite_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              {activeComp.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Thời gian thi đấu chính thức: <strong style={{ color: 'var(--color-primary)' }}>{activeComp.start_date} đến {activeComp.end_date}</strong> · Quy mô: <strong>{activeComp.participant_count} VĐV</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link href="/rules" className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
              <HelpCircle size={15} /> Thể Lệ &amp; Pace Giải Này
            </Link>
            <Link href="/leaderboard" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
              <Trophy size={15} /> BXH Toàn Giải
            </Link>
          </div>
        </div>
      </div>

      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.15rem' }}>
            Thành tích cá nhân của {MOCK_USER.full_name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Đại diện đơn vị: <strong>{MOCK_USER.department_name}</strong> · Tự động đồng bộ với Strava
          </p>
        </div>

        <button onClick={handleUserResync} disabled={resyncing} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
          <RefreshCw size={14} className={resyncing ? 'animate-spin' : ''} /> {resyncing ? 'Đang quy đổi điểm...' : 'Đồng bộ & Tính lại điểm'}
        </button>
      </div>

      {resyncMsg && (
        <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', background: 'var(--color-primary-light)', borderColor: 'var(--color-primary-ring)', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {resyncMsg}
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {STATS.map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.accent}` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.accent }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Join Competition by Invite Code / Link Card */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
            <KeyRound size={16} style={{ color: 'var(--color-primary)' }} /> Muốn tham gia hoặc chuyển sang giải mới?
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Nhập Mã Mời (vd: AUTUMN2026) hoặc dán đường link mời từ BTC để gia nhập giải đấu khác:
          </p>
        </div>

        <form onSubmit={handleJoinByCode} style={{ display: 'flex', gap: '0.5rem', minWidth: 280, flex: 1, maxWidth: 420 }}>
          <input
            type="text"
            required
            placeholder="VD: AUTUMN2026 hoặc link..."
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            className="input"
            style={{ fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ gap: '0.25rem', whiteSpace: 'nowrap' }}>
            Vào giải <ArrowRight size={14} />
          </button>
        </form>
      </div>

      {/* Charts Section: Donut + Daily Bar Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Daily Progress Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.975rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} /> Tiến độ quy đổi theo ngày trong giải
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>km / ngày</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', paddingTop: '1rem', borderBottom: '1px solid var(--border-subtle)', gap: '0.5rem' }}>
            {DAILY_PROGRESS.map((item, i) => {
              const heightPct = Math.round((item.km / maxKm) * 100)
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: item.km > 0 ? 'var(--color-primary)' : 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                    {item.km > 0 ? `${item.km}` : '0'}
                  </span>
                  <div style={{
                    width: '100%',
                    maxWidth: 28,
                    height: `${Math.max(heightPct, 4)}%`,
                    background: item.km > 0 ? 'var(--color-primary)' : 'var(--bg-muted)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                  }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                    {item.day}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sport Breakdown Donut */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.975rem' }}>
              <PieChart size={16} style={{ color: 'var(--color-primary)' }} /> Phân bổ môn theo tỷ lệ của {activeComp.invite_code}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--bg-muted)" strokeWidth="3.8" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--sport-run)" strokeWidth="3.8"
                  strokeDasharray="60 40" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--sport-ride)" strokeWidth="3.8"
                  strokeDasharray="30 70" strokeDashoffset="-60" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--sport-walk)" strokeWidth="3.8"
                  strokeDasharray="10 90" strokeDashoffset="-90" />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center'
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>{currentConvertedKm.toFixed(1)}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>KM Quy đổi</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              {SPORT_BREAKDOWN.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{s.icon} {s.name}</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {s.value} km <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>({s.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Activity table with dynamic date & rule validation based on active competition */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
          Lịch sử bài tập theo quy tắc của {activeComp.name}
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Tự động lọc theo thời gian {activeComp.start_date} → {activeComp.end_date}</span>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Hoạt động</th>
              <th>Môn</th>
              <th style={{ textAlign: 'right' }}>Thực tế</th>
              <th style={{ textAlign: 'right' }}>Quy đổi ({activeComp.invite_code})</th>
              <th style={{ textAlign: 'center' }}>Pace / Speed</th>
              <th style={{ textAlign: 'center' }}>Đánh giá hợp lệ</th>
            </tr>
          </thead>
          <tbody>
            {dynamicActivities.map(a => (
              <tr key={a.id}>
                <td>
                  <a
                    href={a.strava_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Mở bài tập này trên Strava"
                  >
                    {a.name} ↗
                  </a>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>{a.date} · Strava #{a.strava_activity_id}</div>
                </td>
                <td><span className={`badge ${a.cls}`}>{a.icon} {a.sport}</span></td>
                <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{a.actual.toFixed(1)} km</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: a.valid ? 'var(--color-primary)' : 'var(--text-tertiary)' }}>
                  {a.conv.toFixed(1)} km
                </td>
                <td style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{a.pace}</td>
                <td style={{ textAlign: 'center' }}>
                  {a.valid
                    ? <span className="badge status-ok" style={{ gap: '0.25rem' }}><CheckCircle2 size={13} /> Hợp lệ</span>
                    : <span className="badge status-err" title={a.reason ?? ''} style={{ gap: '0.25rem', cursor: 'help' }}><XCircle size={13} /> Khác thời gian/pace</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
