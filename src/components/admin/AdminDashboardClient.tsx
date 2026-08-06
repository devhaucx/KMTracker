'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Shield, Download, Copy, Check,
  AlertTriangle, Users, Building2, Trophy,
  XCircle, Eye, ArrowRight, ExternalLink
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
    { icon: <Users size={18} style={{ color: 'var(--color-primary)' }} />,  label: 'Vận động viên',   value: `${stats?.participant_count ?? stats?.participantCount ?? 0}`,  sub: 'người tham gia' },
    { icon: <Building2 size={18} style={{ color: 'var(--sport-swim)' }} />, label: 'Phòng ban',        value: `${stats?.department_count ?? stats?.departmentCount ?? 0}`,   sub: 'đơn vị' },
    { icon: <Trophy size={18} style={{ color: 'var(--rank-gold)' }} />,     label: 'Tổng KM quy đổi', value: `${stats?.total_converted_km ?? stats?.totalKm ?? 0}`, sub: 'km toàn giải' },
    { icon: <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />, label: 'Bài tập nghi vấn', value: `${stats?.suspicious_count ?? stats?.suspiciousCount ?? 0}`, sub: 'cần kiểm duyệt', danger: true },
  ]

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-warning)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <Shield size={14} /> Trang quản trị · Bảng Tổng Quan
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700 }}>Tổng Quan Hệ Thống</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {competition ? `${competition.name} · ${competition.start_date} – ${competition.end_date}` : 'Chưa có giải đấu'}
          </p>
        </div>
        <div className="mobile-stack" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={exportCSV} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <Download size={14} /> Xuất báo cáo CSV
          </button>
          <Link href="/admin/competitions/new" className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
            Tạo giải đấu mới
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-mobile" style={{ marginBottom: '2rem' }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} className="stat-card" style={s.danger ? { borderTop: '3px solid var(--color-danger)' } : { borderTop: '3px solid var(--border-base)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {s.icon}
              <div className="stat-label" style={{ margin: 0 }}>{s.label}</div>
            </div>
            <div className="stat-value" style={s.danger ? { color: 'var(--color-danger)' } : {}}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Invite link card */}
      {competition && (
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Trophy size={16} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Link Mời Đăng Ký Tham Gia</h2>
          <span className="badge badge-blue">{competition.invite_code}</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Gửi link mời riêng này cho cán bộ nhân viên để đăng ký tham gia giải đấu qua tài khoản Strava.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input type="text" readOnly value={inviteUrl} className="input"
            style={{ flex: 1, minWidth: 260, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}
          />
          <button onClick={copyLink} className={`btn ${copiedLink ? 'btn-secondary' : 'btn-primary'} mobile-full-width`}>
            {copiedLink ? <><Check size={15} /> Đã copy link!</> : <><Copy size={15} /> Copy link mời</>}
          </button>
        </div>
      </div>
      )}

      {/* Suspicious activities section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Bài tập nghi vấn cần kiểm duyệt</h2>
          <span className="badge status-err">{suspiciousActivities.length} bài</span>
        </div>
        <Link href="/admin/activities" style={{ fontSize: '0.825rem', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          Xem tất cả bài tập <ArrowRight size={13} />
        </Link>
      </div>

      <div className="desktop-table-view" style={{ marginBottom: '2rem' }}>
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
              {suspiciousActivities.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td><span className="badge badge-neutral">{row.dept}</span></td>
                  <td>{row.sport}</td>
                  <td style={{ textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{row.actual}</td>
                  <td style={{ textAlign: 'center', fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>{row.pace}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: row.severity === 'error' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                      <AlertTriangle size={13} /> {row.warning}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                      <a href={row.strava_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ gap: '0.3rem' }} title="Mở Strava">
                        <ExternalLink size={13} /> Strava ↗
                      </a>
                      <Link href="/admin/activities" className="btn btn-sm" style={{ gap: '0.3rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)' }}>
                        <XCircle size={13} /> Kiểm duyệt
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mobile-card-view" style={{ marginBottom: '2rem' }}>
        {suspiciousActivities.map((row, i) => (
          <div key={i} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{row.name}</span>
              <span className="badge status-err" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertTriangle size={12} /> Nghi vấn
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span className="badge badge-neutral">{row.dept}</span>
              <span className="badge badge-neutral">{row.sport}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span>Thực tế: <strong style={{ color: 'var(--text-primary)' }}>{row.actual}</strong></span>
              <span>Pace: <strong style={{ color: 'var(--text-primary)' }}>{row.pace}</strong></span>
            </div>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: row.severity === 'error' ? 'var(--color-danger)' : 'var(--color-warning)', marginBottom: '0.75rem' }}>
              {row.warning}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href={row.strava_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ gap: '0.3rem', flex: 1 }}>
                <ExternalLink size={13} /> Strava
              </a>
              <Link href="/admin/activities" className="btn btn-sm" style={{ gap: '0.3rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', flex: 1 }}>
                <XCircle size={13} /> Kiểm duyệt
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Participants List */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Top VĐV Dẫn Đầu</h2>
        <Link href="/admin/users" style={{ fontSize: '0.825rem', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          Quản lý {stats?.participant_count ?? stats?.participantCount ?? 0} người dùng <ArrowRight size={13} />
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
        {topAthletes.map((p, i) => {
          const suspicious = suspiciousActivities.some(s => s.name === p.full_name)
          return (
            <div key={p.user_id || i} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-tertiary)', minWidth: 28 }}>#{i + 1}</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', flex: 1 }}>{p.full_name}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span className="badge badge-neutral">{p.department_name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.activity_count} bài tập</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{Number(p.total_converted_km).toFixed(1)} km</span>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                {suspicious
                  ? <span className="badge status-err">⚠ Cần đối soát</span>
                  : <span className="badge status-ok">✓ Hợp lệ</span>}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
