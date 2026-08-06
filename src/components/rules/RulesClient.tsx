'use client'

import { useState } from 'react'
import { CheckCircle2, ShieldAlert, Award, Calendar, Layers, Zap } from 'lucide-react'
import type { Competition, CompetitionSport } from '@/lib/supabase/types'

const SPORT_BADGE: Record<string, string> = { Run: 'badge-run', Walk: 'badge-walk', Ride: 'badge-ride', Swim: 'badge-swim' }

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('vi-VN') } catch { return iso }
}

function fmtRatio(r: number) {
  if (r >= 1) return `${r.toFixed(2)}x (1 km = ${r.toFixed(2)} km)`
  const kmPer1 = 1 / r
  return `${r.toFixed(2)}x (${kmPer1.toFixed(1)} km = 1 km)`
}

function fmtPaceRange(min: number, max: number, unit: string) {
  if (unit === 'min/km') {
    return `Pace ${fmtPace(min)} – ${fmtPace(max)} min/km`
  }
  if (unit === 'min/100m') {
    return `Pace ${fmtPace(min)} – ${fmtPace(max)} min/100m`
  }
  return `Tốc độ ${min.toFixed(1)} – ${max.toFixed(1)} ${unit}`
}

function fmtPace(secPerUnit: number) {
  const m = Math.floor(secPerUnit / 60)
  const s = Math.round(secPerUnit % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

interface CompWithSports {
  competition: Competition
  sports: CompetitionSport[]
}

export default function RulesClient({ competitions }: { competitions: CompWithSports[] }) {
  const [selectedId, setSelectedId] = useState(competitions[0]?.competition.id || '')
  const current = competitions.find(c => c.competition.id === selectedId) || competitions[0]

  if (!current) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Chưa có cuộc thi nào</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Thể lệ sẽ hiển thị khi Ban Tổ Chức tạo cuộc thi.
          </p>
        </div>
      </div>
    )
  }

  const { competition: comp, sports } = current

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem', maxWidth: 840 }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.75rem)', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Zap size={14} /> Thể Lệ Cuộc Thi
        </div>
        <h1 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.375rem)', fontWeight: 700, marginBottom: '0.2rem' }}>
          Quy định tính điểm
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)' }}>
          Dải pace và hệ số quy đổi do Ban Tổ Chức thiết lập cho từng cuộc thi.
        </p>
      </div>

      {/* Select Competition Dropdown */}
      <div className="card" style={{
        padding: 'clamp(0.875rem, 2.5vw, 1rem) clamp(1rem, 3vw, 1.25rem)',
        marginBottom: '1.5rem',
        background: 'var(--color-primary-light)',
        borderColor: 'var(--color-primary-ring)',
      }}>
        {/* Competition info - always on top */}
        <div className="mobile-stack" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1rem',
        }}>
          <Layers size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 'clamp(0.9rem, 3vw, 1rem)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {comp.name} ({comp.invite_code})
            </div>
            <div style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.8rem)', color: 'var(--text-secondary)' }}>
              <span className="hide-mobile">Mã mời: <strong>{comp.invite_code}</strong> · </span>Trạng thái: {comp.status === 'active' ? '🟢 Đang thi đấu' : comp.status === 'registration' ? '🔵 Đang đăng ký' : '⚪ Đã kết thúc'}
            </div>
          </div>
        </div>

        {/* Dropdown selector - full width on mobile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Xem thể lệ giải khác:
            <span className="badge badge-neutral" style={{ fontSize: '0.7rem', fontWeight: 500 }}>
              {competitions.length} giải
            </span>
          </label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="input"
            style={{ width: '100%', cursor: 'pointer', fontWeight: 600, background: 'var(--bg-base)' }}
          >
            {competitions.map(c => (
              <option key={c.competition.id} value={c.competition.id}>
                {c.competition.name} ({c.competition.invite_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* 1. Time & Window */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
            <Calendar size={17} /> 1. Khung thời gian thi đấu chính thức
          </h2>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Thời gian bắt đầu:</strong> 00:00 ngày {fmtDate(comp.start_date)}
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Thời gian kết thúc:</strong> 23:59 ngày {fmtDate(comp.end_date)}
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Hạn đăng ký chọn phòng ban:</strong> Trước 23:59 ngày {fmtDate(comp.registration_deadline)}
            </li>
            <li>
              <span className="badge badge-warning" style={{ marginTop: '0.2rem' }}>
                ⚠ Tất cả bài tập Strava nằm ngoài khoảng thời gian trên sẽ bị loại tự động (0.0 km quy đổi).
              </span>
            </li>
          </ul>
        </div>

        {/* 2. Conversion table */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-success)' }}>
            <Award size={17} /> 2. Ma trận hệ số quy đổi KM &amp; Dải pace/speed
          </h2>
          {sports.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', padding: '0.5rem 0' }}>
              Chưa cấu hình bộ môn tính điểm cho cuộc thi này.
            </p>
          ) : (
            <>
              <div className="desktop-table-view">
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Bộ môn</th>
                        <th style={{ textAlign: 'center' }}>Tỉ lệ quy đổi</th>
                        <th>Dải pace / tốc độ hợp lệ</th>
                        <th style={{ textAlign: 'center' }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sports.map(s => (
                        <tr key={s.id} style={!s.is_active ? { opacity: 0.5, background: 'var(--bg-subtle)' } : {}}>
                          <td>
                            <span className={`badge ${SPORT_BADGE[s.sport_type] || ''}`}>
                              {s.icon} {s.display_name}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-primary)' }}>{fmtRatio(s.conversion_ratio)}</td>
                          <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {fmtPaceRange(s.min_pace_or_speed, s.max_pace_or_speed, s.validation_unit)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {s.is_active ? (
                              <span className="badge status-ok">✓ Được chấp nhận</span>
                            ) : (
                              <span className="badge status-err">✕ Không tính điểm</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile card view */}
              <div className="mobile-card-view">
                {sports.map(s => (
                  <div key={s.id} className="card-subtle" style={{ padding: 'clamp(0.75rem, 2vw, 0.85rem) clamp(0.875rem, 2.5vw, 1rem)', opacity: s.is_active ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span className={`badge ${SPORT_BADGE[s.sport_type] || ''}`} style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)' }}>
                        {s.icon} {s.display_name}
                      </span>
                      {s.is_active
                        ? <span className="badge status-ok" style={{ fontSize: 'clamp(0.65rem, 2vw, 0.7rem)' }}>✓ Tính điểm</span>
                        : <span className="badge status-err" style={{ fontSize: 'clamp(0.65rem, 2vw, 0.7rem)' }}>✕ Không</span>}
                    </div>
                    <div style={{ fontSize: 'clamp(0.775rem, 2.5vw, 0.825rem)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.2rem' }}>
                      {fmtRatio(s.conversion_ratio)}
                    </div>
                    <div style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.8rem)', color: 'var(--text-secondary)' }}>
                      {fmtPaceRange(s.min_pace_or_speed, s.max_pace_or_speed, s.validation_unit)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 3. Anti-fraud */}
        <div className="card" style={{ borderColor: 'var(--color-danger-border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-danger)' }}>
            <ShieldAlert size={17} /> 3. Gian lận &amp; Quyền đối soát của Ban Tổ Chức
          </h2>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <li>Nghiêm cấm sử dụng phương tiện cơ giới (xe máy, e-bike), can thiệp vị trí GPS giả lập hoặc gian lận tài khoản.</li>
            <li>Hệ thống tự động hủy bài tập vượt dải pace/speed tối đa hoặc tối thiểu đã cài đặt ở mục 2.</li>
            <li>Ban Tổ Chức (Admin) có quyền xem link trực tiếp Strava Athlete Profile để kiểm tra danh tính chính chủ và bấm <strong>`[Loại khỏi giải]`</strong> đối với tài khoản vi phạm.</li>
            <li>VĐV có quyền khiếu nại trong vòng 3 ngày. Sau khi khiếu nại thành công, Admin bấm <strong>`[↺ Khôi phục]`</strong> để tự động tính lại 100% điểm thi đấu.</li>
          </ul>
        </div>

        {/* 4. Fair play */}
        <div className="card" style={{ borderColor: 'var(--color-success-border)', background: 'var(--color-success-bg)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-success)' }}>
            <CheckCircle2 size={17} /> 4. Tinh thần Fair Play &amp; Xếp hạng đơn vị
          </h2>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <li>Mỗi vận động viên chỉ đại diện cho 1 Phòng Ban duy nhất trong suốt giải đấu.</li>
            <li>Điểm phòng ban bằng tổng KM quy đổi của tất cả các thành viên trực thuộc phòng ban đó.</li>
            <li>Bảng xếp hạng cập nhật thời gian thực qua Strava Webhook. Kết quả cuối cùng là căn cứ để BTC trao giải thưởng.</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
