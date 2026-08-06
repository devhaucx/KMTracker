'use client'

import React, { useState } from 'react'
import {
  FileText,
  Download,
  Trophy,
  Building2,
  Award,
} from 'lucide-react'
import { exportToCSV } from '@/lib/utils/export'
import type { Competition } from '@/lib/supabase/types'

interface AdminStats {
  participantCount: number
  activityCount: number
  suspiciousCount: number
  totalKm: number
}

interface Props {
  competition: Competition | { name: string; invite_code: string } | null
  stats: AdminStats | { participant_count: number; total_converted_km: number; suspicious_count: number } | null
  individualLeaderboard: any[]
  departmentLeaderboard: any[]
}

export default function AdminReportsClient({ competition, stats, individualLeaderboard, departmentLeaderboard }: Props) {
  const [downloading, setDownloading] = useState(false)

  const competitionName = competition?.name ?? 'Giải đấu'
  const inviteCode = (competition as any)?.invite_code ?? 'REPORT'

  const participantCount = (stats as any)?.participantCount ?? (stats as any)?.participant_count ?? 0
  const totalConvertedKm = (stats as any)?.totalKm ?? (stats as any)?.total_converted_km ?? 0
  const activityCount = (stats as any)?.activityCount ?? 0
  const suspiciousCount = (stats as any)?.suspiciousCount ?? (stats as any)?.suspicious_count ?? 0

  const totalActualKm = departmentLeaderboard.reduce((sum, d) => sum + (d.total_actual_km || 0), 0)
  const validRate = activityCount > 0
    ? (((activityCount - suspiciousCount) / activityCount) * 100).toFixed(1)
    : '100.0'

  const exportCSV = () => {
    setDownloading(true)

    const deptHeaders = ['Hạng', 'Tên Phòng Ban', 'Mã Code', 'Số VĐV', 'KM Quy Đổi', 'KM Thực Tế', 'Tổng Bài Tập', 'Trung Bình KM/VĐV']
    const deptRows = departmentLeaderboard.map((dept: any) => [
      dept.overall_rank,
      dept.department_name,
      dept.department_code,
      dept.participant_count,
      dept.total_converted_km,
      dept.total_actual_km,
      dept.total_activities,
      (dept.total_converted_km / dept.participant_count).toFixed(1)
    ])

    const indHeaders = ['Hạng', 'Họ và Tên', 'Phòng Ban', 'Môn Thể Thao', 'KM Quy Đổi', 'KM Thực Tế', 'Số Bài Tập']
    const indRows = individualLeaderboard.map((ind: any) => [
      ind.overall_rank,
      ind.full_name,
      ind.department_name,
      ind.sport_type,
      ind.total_converted_km,
      ind.total_actual_km,
      ind.activity_count
    ])

    exportToCSV(`Bao_Cao_Biet_Doi_${inviteCode}.csv`, indHeaders, indRows)
    setTimeout(() => setDownloading(false), 500)
  }

  const getTopBySport = (sport: string) => {
    return individualLeaderboard.find((i: any) => i.sport_type === sport)
  }

  const topRun = getTopBySport('Run')
  const topRide = getTopBySport('Ride')
  const topSwim = getTopBySport('Swim')
  const topWalk = getTopBySport('Walk')

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.3rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <FileText size={14} /> Tổng hợp dữ liệu
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700 }}>Báo Cáo & Thống Kê Giải Đấu</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {competitionName} · Dữ liệu tự động cập nhật từ Strava
          </p>
        </div>

        <button onClick={exportCSV} disabled={downloading} className="btn btn-primary mobile-full-width" style={{ gap: '0.4rem' }}>
          <Download size={16} /> {downloading ? 'Đang xuất CSV...' : 'Xuất CSV báo cáo'}
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="stats-grid-mobile" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">Tổng VĐV tham gia</div>
          <div className="stat-value">{participantCount.toLocaleString()}</div>
          <div className="stat-sub">trên toàn công ty</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Tổng KM Quy Đổi</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {totalConvertedKm.toLocaleString()}
          </div>
          <div className="stat-sub">km quy đổi toàn giải</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Tổng KM Thực Tế</div>
          <div className="stat-value" style={{ color: 'var(--sport-run)' }}>
            {totalActualKm.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </div>
          <div className="stat-sub">km vận động thực tế</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Tổng số bài tập</div>
          <div className="stat-value">{activityCount.toLocaleString()}</div>
          <div className="stat-sub">bài tập đã ghi nhận</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Tỷ lệ hợp lệ</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {validRate}%
          </div>
          <div className="stat-sub">hoạt động đạt chuẩn</div>
        </div>
      </div>

      {/* Top Performers by Sport Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Award size={18} style={{ color: 'var(--rank-gold)' }} /> Cá Nhân Xuất Sắc Theo Môn Thể Thao
        </h2>

        <div
          className="mobile-grid-1col"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            '--grid-min': '240px',
          } as React.CSSProperties}
        >
          {topRun && (
            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--sport-run)' }}>
              <div className="badge badge-run" style={{ marginBottom: '0.5rem' }}>
                🏃 Chạy bộ (Run)
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{topRun.full_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{topRun.department_name}</div>
              <div style={{ marginTop: '0.75rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--sport-run)' }}>
                {topRun.total_converted_km} km
              </div>
            </div>
          )}

          {topRide && (
            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--sport-ride)' }}>
              <div className="badge badge-ride" style={{ marginBottom: '0.5rem' }}>
                🚴 Đạp xe (Ride)
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{topRide.full_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{topRide.department_name}</div>
              <div style={{ marginTop: '0.75rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--sport-ride)' }}>
                {topRide.total_converted_km} km quy đổi ({topRide.total_actual_km} km thực)
              </div>
            </div>
          )}

          {topSwim && (
            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--sport-swim)' }}>
              <div className="badge badge-swim" style={{ marginBottom: '0.5rem' }}>
                🏊 Bơi lội (Swim)
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{topSwim.full_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{topSwim.department_name}</div>
              <div style={{ marginTop: '0.75rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--sport-swim)' }}>
                {topSwim.total_converted_km} km quy đổi ({topSwim.total_actual_km} km thực)
              </div>
            </div>
          )}

          {topWalk && (
            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--sport-walk)' }}>
              <div className="badge badge-walk" style={{ marginBottom: '0.5rem' }}>
                🚶 Đi bộ (Walk)
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{topWalk.full_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{topWalk.department_name}</div>
              <div style={{ marginTop: '0.75rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--sport-walk)' }}>
                {topWalk.total_converted_km} km
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Department Ranking Table */}
      <div style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Building2 size={18} style={{ color: 'var(--color-primary)' }} /> Bảng Xếp Hạng Đồng Đội (Phòng Ban)
        </h2>

        <div className="desktop-table-view">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center', width: 60 }}>Hạng</th>
                  <th>Phòng ban</th>
                  <th style={{ textAlign: 'center' }}>Số VĐV</th>
                  <th style={{ textAlign: 'right' }}>KM Quy Đổi</th>
                  <th style={{ textAlign: 'right' }}>KM Thực Tế</th>
                  <th style={{ textAlign: 'center' }}>Tổng bài tập</th>
                  <th style={{ textAlign: 'right' }}>TB KM/VĐV</th>
                </tr>
              </thead>
              <tbody>
                {departmentLeaderboard.map((dept: any) => {
                  const avgPerMember = (dept.total_converted_km / dept.participant_count).toFixed(1)
                  return (
                    <tr key={dept.department_id}>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        {dept.overall_rank === 1 ? (
                          <span style={{ color: 'var(--rank-gold)', fontSize: '1.1rem' }}>🥇 #1</span>
                        ) : dept.overall_rank === 2 ? (
                          <span style={{ color: 'var(--rank-silver)', fontSize: '1.05rem' }}>🥈 #2</span>
                        ) : dept.overall_rank === 3 ? (
                          <span style={{ color: 'var(--rank-bronze)', fontSize: '1rem' }}>🥉 #3</span>
                        ) : (
                          `#${dept.overall_rank}`
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: dept.department_color,
                              display: 'inline-block',
                            }}
                          />
                          <span style={{ fontWeight: 600 }}>{dept.department_name}</span>
                          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                            {dept.department_code}
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>{dept.participant_count} người</td>

                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {dept.total_converted_km.toFixed(1)} km
                      </td>

                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {dept.total_actual_km.toFixed(1)} km
                      </td>

                      <td style={{ textAlign: 'center' }}>{dept.total_activities}</td>

                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>
                        {avgPerMember} km/người
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mobile-card-view">
          {departmentLeaderboard.map((dept: any) => {
            const avgPerMember = (dept.total_converted_km / dept.participant_count).toFixed(1)
            return (
              <div key={dept.department_id} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: 36 }}>
                    {dept.overall_rank === 1 ? '🥇 #1' : dept.overall_rank === 2 ? '🥈 #2' : dept.overall_rank === 3 ? '🥉 #3' : `#${dept.overall_rank}`}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                    {dept.department_code}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: dept.department_color, display: 'inline-block' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{dept.department_name}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span>{dept.participant_count} VĐV</span>
                  <span>{dept.total_activities} bài</span>
                  <span>TB: {avgPerMember} km/người</span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                  {dept.total_converted_km.toFixed(1)} km
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top 5 Individuals Summary */}
      <div>
        <h2
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Trophy size={18} style={{ color: 'var(--rank-gold)' }} /> Top 5 Vận Động Viên Dẫn Đầu Toàn Giải
        </h2>

        <div className="desktop-table-view">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center', width: 60 }}>Hạng</th>
                  <th>Họ và Tên</th>
                  <th>Phòng ban</th>
                  <th>Môn thi đấu</th>
                  <th style={{ textAlign: 'center' }}>Bài tập</th>
                  <th style={{ textAlign: 'right' }}>KM Quy Đổi</th>
                </tr>
              </thead>
              <tbody>
                {individualLeaderboard.slice(0, 5).map((ind: any) => (
                  <tr key={ind.user_id}>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>
                      {ind.overall_rank === 1
                        ? '🥇 #1'
                        : ind.overall_rank === 2
                        ? '🥈 #2'
                        : ind.overall_rank === 3
                        ? '🥉 #3'
                        : `#${ind.overall_rank}`}
                    </td>
                    <td style={{ fontWeight: 600 }}>{ind.full_name}</td>
                    <td>
                      <span className="badge badge-neutral">{ind.department_name}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${ind.sport_type.toLowerCase()}`}>{ind.sport_type}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{ind.activity_count}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {ind.total_converted_km.toFixed(1)} km
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mobile-card-view">
          {individualLeaderboard.slice(0, 5).map((ind: any) => (
            <div key={ind.user_id} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: 36 }}>
                  {ind.overall_rank === 1 ? '🥇 #1' : ind.overall_rank === 2 ? '🥈 #2' : ind.overall_rank === 3 ? '🥉 #3' : `#${ind.overall_rank}`}
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', flex: 1 }}>{ind.full_name}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span className="badge badge-neutral">{ind.department_name}</span>
                <span className={`badge badge-${ind.sport_type.toLowerCase()}`}>{ind.sport_type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ind.activity_count} bài tập</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{ind.total_converted_km.toFixed(1)} km</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
