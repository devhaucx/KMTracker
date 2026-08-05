'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Shield, Download, Copy, Check,
  AlertTriangle, Users, Building2, Trophy,
  XCircle, Eye, ArrowRight, ExternalLink
} from 'lucide-react'
import {
  MOCK_ADMIN_STATS,
  MOCK_SUSPICIOUS_ACTIVITIES,
  MOCK_INDIVIDUAL_LEADERBOARD,
  MOCK_COMPETITION,
} from '@/lib/mock/data'

export default function AdminPage() {
  const [copiedLink, setCopiedLink] = useState(false)
  const inviteUrl = `https://strava-ranking.pages.dev/join/${MOCK_COMPETITION.invite_code}`

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const exportCSV = () => {
    const header = 'Hạng,Họ Tên,Phòng Ban,KM Quy Đổi,KM Thực Tế,Bài Tập\n'
    const rows   = MOCK_INDIVIDUAL_LEADERBOARD
      .map((p, i) => `${i + 1},${p.full_name},${p.department_name},${p.total_converted_km},${p.total_actual_km},${p.activity_count}`)
      .join('\n')
    const a = Object.assign(document.createElement('a'), {
      href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows),
      download: `Bao_Cao_${MOCK_COMPETITION.invite_code}.csv`,
    })
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const STAT_CARDS = [
    { icon: <Users size={18} style={{ color: 'var(--color-primary)' }} />,  label: 'Vận động viên',   value: `${MOCK_ADMIN_STATS.participant_count}`,  sub: 'người tham gia' },
    { icon: <Building2 size={18} style={{ color: 'var(--sport-swim)' }} />, label: 'Phòng ban',        value: `${MOCK_ADMIN_STATS.department_count}`,   sub: 'đơn vị' },
    { icon: <Trophy size={18} style={{ color: 'var(--rank-gold)' }} />,     label: 'Tổng KM quy đổi', value: `${MOCK_ADMIN_STATS.total_converted_km}`, sub: 'km toàn giải' },
    { icon: <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />, label: 'Bài tập nghi vấn', value: `${MOCK_ADMIN_STATS.suspicious_count}`, sub: 'cần kiểm duyệt', danger: true },
  ]

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-warning)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <Shield size={14} /> Trang quản trị · Bảng Tổng Quan
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700 }}>Tổng Quan Hệ Thống</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {MOCK_COMPETITION.name} · {MOCK_COMPETITION.start_date} – {MOCK_COMPETITION.end_date}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={exportCSV} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <Download size={14} /> Xuất báo cáo CSV
          </button>
          <Link href="/admin/competitions/new" className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
            Tạo giải đấu mới
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Trophy size={16} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Link Mời Đăng Ký Tham Gia</h2>
          <span className="badge badge-blue">{MOCK_COMPETITION.invite_code}</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Gửi link mời riêng này cho cán bộ nhân viên để đăng ký tham gia giải đấu qua tài khoản Strava.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input type="text" readOnly value={inviteUrl} className="input"
            style={{ flex: 1, minWidth: 260, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}
          />
          <button onClick={copyLink} className={`btn ${copiedLink ? 'btn-secondary' : 'btn-primary'}`}>
            {copiedLink ? <><Check size={15} /> Đã copy link!</> : <><Copy size={15} /> Copy link mời</>}
          </button>
        </div>
      </div>

      {/* Suspicious activities section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Bài tập nghi vấn cần kiểm duyệt</h2>
          <span className="badge status-err">{MOCK_SUSPICIOUS_ACTIVITIES.length} bài</span>
        </div>
        <Link href="/admin/activities" style={{ fontSize: '0.825rem', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          Xem tất cả bài tập <ArrowRight size={13} />
        </Link>
      </div>

      <div className="table-wrapper" style={{ marginBottom: '2rem' }}>
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
            {MOCK_SUSPICIOUS_ACTIVITIES.map((row, i) => (
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

      {/* Participants List */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Top VĐV Dẫn Đầu</h2>
        <Link href="/admin/users" style={{ fontSize: '0.825rem', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          Quản lý {MOCK_ADMIN_STATS.participant_count} người dùng <ArrowRight size={13} />
        </Link>
      </div>

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
            {MOCK_INDIVIDUAL_LEADERBOARD.map((p, i) => {
              const suspicious = MOCK_SUSPICIOUS_ACTIVITIES.some(s => s.name === p.full_name)
              return (
                <tr key={p.user_id}>
                  <td style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 600 }}>#{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.full_name}</td>
                  <td><span className="badge badge-neutral">{p.department_name}</span></td>
                  <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{p.activity_count}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>{p.total_converted_km.toFixed(1)} km</td>
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
  )
}
