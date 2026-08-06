'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Shield, Download, Copy, Check,
  AlertTriangle, Users, Building2, Trophy,
  XCircle, ArrowRight, ExternalLink, Plus
} from 'lucide-react'

interface AdminDashboardClientProps {
  competition: any
  stats: any
  suspiciousActivities: any[]
  topAthletes: any[]
  appUrl: string
}

export default function AdminDashboardClient({ competition, stats, suspiciousActivities, topAthletes, appUrl }: AdminDashboardClientProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const inviteUrl = competition ? `${appUrl}/join/${competition.invite_code}` : appUrl

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const exportCSV = () => {
    if (!competition) return
    const header = 'Hạng,Họ Tên,Phòng Ban,KM Quy Đổi,KM Thực Tế,Bài Tập\n'
    const rows   = topAthletes
      .map((p, i) => `${i + 1},${p.full_name},${p.department_name || ''},${p.total_converted_km},${p.total_actual_km ?? ''},${p.activity_count}`)
      .join('\n')
    const a = Object.assign(document.createElement('a'), {
      href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows),
      download: `Bao_Cao_${competition.invite_code}.csv`,
    })
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const STAT_CARDS = [
    { icon: <Users size={14} style={{ color: 'var(--color-primary)' }} />,  label: 'VĐV',   value: `${stats?.participant_count ?? stats?.participantCount ?? 0}` },
    { icon: <Building2 size={14} style={{ color: 'var(--sport-swim)' }} />, label: 'Đơn vị',  value: `${stats?.department_count ?? stats?.departmentCount ?? 0}` },
    { icon: <Trophy size={14} style={{ color: 'var(--rank-gold)' }} />,     label: 'Tổng KM', value: `${stats?.total_converted_km ?? stats?.totalKm ?? 0}` },
    { icon: <AlertTriangle size={14} style={{ color: 'var(--color-danger)' }} />, label: 'Nghi vấn', value: `${stats?.suspicious_count ?? stats?.suspiciousCount ?? 0}`, danger: true },
  ]

  return (
    <div className="container" style={{ padding: '0.75rem 0.75rem 4rem' }}>

      {/* Header - Desktop only or 1-line Android action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div>
          <h1 className="hide-mobile" style={{ fontSize: '1.4rem', fontWeight: 700 }}>Tổng Quan Hệ Thống</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            {competition ? `${competition.name} (${competition.invite_code})` : 'Chưa có giải đấu'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button onClick={exportCSV} className="btn btn-secondary btn-sm" style={{ gap: '0.25rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
            <Download size={13} /> <span className="hide-mobile">Xuất CSV</span>
          </button>
          <Link href="/admin/competitions/new" className="btn btn-primary btn-sm" style={{ gap: '0.25rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
            <Plus size={13} /> Tạo giải
          </Link>
        </div>
      </div>

      {/* Native Android Metrics Bar - 4 in 1 Compact Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem',
        background: 'var(--bg-base)', padding: '0.5rem 0.35rem', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-base)', marginBottom: '0.75rem', textAlign: 'center',
      }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              {s.icon} <span>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.1rem', color: s.danger ? 'var(--color-danger)' : 'var(--text-primary)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Invite link card - Compact 1-liner */}
      {competition && (
      <div className="card" style={{ padding: '0.6rem 0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
          <Trophy size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Mã mời: <strong style={{ color: 'var(--color-primary)' }}>{competition.invite_code}</strong>
          </span>
        </div>
        <button onClick={copyLink} className={`btn ${copiedLink ? 'btn-secondary' : 'btn-primary'} btn-sm`} style={{ gap: '0.25rem', padding: '0.25rem 0.55rem', fontSize: '0.75rem', flexShrink: 0 }}>
          {copiedLink ? <><Check size={12} /> Đã copy</> : <><Copy size={12} /> Copy link</>}
        </button>
      </div>
      )}

      {/* Suspicious activities section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Bài tập nghi vấn</h2>
          <span className="badge status-err" style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem' }}>{suspiciousActivities.length}</span>
        </div>
        <Link href="/admin/activities" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
          Tất cả <ArrowRight size={11} />
        </Link>
      </div>

      <div className="desktop-table-view" style={{ marginBottom: '1.25rem' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Vận động viên</th>
                <th>Phòng ban</th>
                <th>Môn</th>
                <th style={{ textAlign: 'right' }}>Thực tế</th>
                <th style={{ textAlign: 'center' }}>Pace / Speed</th>
                <th>Cảnh báo vi phạm</th>
                <th style={{ textAlign: 'center' }}>Xử lý</th>
              </tr>
            </thead>
            <tbody>
              {suspiciousActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-tertiary)' }}>
                    Không có bài tập nghi vấn nào.
                  </td>
                </tr>
              ) : (
                suspiciousActivities.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{row.name}</td>
                    <td><span className="badge badge-neutral">{row.dept}</span></td>
                    <td>{row.sport}</td>
                    <td style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{row.actual}</td>
                    <td style={{ textAlign: 'center', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>{row.pace}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.775rem', fontWeight: 600, color: row.severity === 'error' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                        <AlertTriangle size={12} /> {row.warning}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                        <a href={row.strava_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} title="Mở Strava">
                          <ExternalLink size={12} /> Strava
                        </a>
                        <Link href="/admin/activities" className="btn btn-sm" style={{ gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)' }}>
                          <XCircle size={12} /> Duyệt
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mobile-card-view" style={{ marginBottom: '1rem' }}>
        {suspiciousActivities.length === 0 ? (
          <div className="card" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
            Không có bài tập nghi vấn nào.
          </div>
        ) : (
          suspiciousActivities.map((row, i) => (
            <div key={i} className="card" style={{ padding: '0.65rem 0.75rem', marginBottom: '0.4rem', borderLeft: '3px solid var(--color-danger)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{row.name}</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>{row.dept}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                <span>{row.sport} · {row.actual} · Pace: {row.pace}</span>
                <span style={{ fontWeight: 600, color: row.severity === 'error' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                  {row.warning}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <a href={row.strava_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ gap: '0.2rem', flex: 1, padding: '0.25rem 0.4rem', fontSize: '0.725rem' }}>
                  <ExternalLink size={11} /> Strava
                </a>
                <Link href="/admin/activities" className="btn btn-sm" style={{ gap: '0.2rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', flex: 1, padding: '0.25rem 0.4rem', fontSize: '0.725rem' }}>
                  <XCircle size={11} /> Duyệt ngay
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Top Athletes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Top VĐV Dẫn Đầu</h2>
        <Link href="/admin/users" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
          Quản lý {stats?.participant_count ?? stats?.participantCount ?? 0} VĐV <ArrowRight size={11} />
        </Link>
      </div>

      <div className="desktop-table-view">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Hạng</th>
                <th>Họ tên</th>
                <th>Phòng ban</th>
                <th style={{ textAlign: 'center' }}>Số bài tập</th>
                <th style={{ textAlign: 'right' }}>KM quy đổi</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {topAthletes.map((p, i) => {
                const suspicious = suspiciousActivities.some(s => s.name === p.full_name)
                return (
                  <tr key={p.user_id || i}>
                    <td style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 600 }}>#{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{p.full_name}</td>
                    <td><span className="badge badge-neutral">{p.department_name}</span></td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{p.activity_count}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>{Number(p.total_converted_km).toFixed(1)} km</td>
                    <td style={{ textAlign: 'center' }}>
                      {suspicious
                        ? <span className="badge status-err">⚠ Cần đối soát</span>
                        : <span className="badge status-ok">✓ Hợp lệ</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mobile-card-view">
        {topAthletes.map((p, i) => (
          <div key={p.user_id || i} className="card" style={{ padding: '0.55rem 0.75rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: i < 3 ? 'var(--color-primary)' : 'var(--text-tertiary)', minWidth: 20 }}>#{i + 1}</span>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontWeight: 700, fontSize: '0.825rem' }}>{p.full_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{p.department_name} · {p.activity_count} bài</div>
              </div>
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)', flexShrink: 0 }}>{Number(p.total_converted_km).toFixed(1)} km</span>
          </div>
        ))}
      </div>

    </div>
  )
}
