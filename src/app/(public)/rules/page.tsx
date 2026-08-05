'use client'

import { useState } from 'react'
import { CheckCircle2, ShieldAlert, Award, Calendar, Layers, Zap } from 'lucide-react'
import { MOCK_COMPETITIONS_LIST } from '@/lib/mock/data'

const COMPETITIONS = MOCK_COMPETITIONS_LIST.filter(c => !c.is_deleted)

export default function RulesPage() {
  const [selectedCompId, setSelectedCompId] = useState(COMPETITIONS[0]?.id || 'comp-1')
  const currentComp = COMPETITIONS.find(c => c.id === selectedCompId) || COMPETITIONS[0]

  const isAutumn = selectedCompId === 'comp-1'
  const isSummer = selectedCompId === 'comp-2'

  const sportRulesTable = [
    {
      sport: '🏃 Chạy bộ',
      enabled: true,
      ratio: '1.0x (1 km = 1 km)',
      cls: 'badge-run',
      pace: isAutumn ? 'Pace 4:00 – 9:00 min/km' : isSummer ? 'Pace 4:30 – 10:00 min/km' : 'Pace 4:00 – 9:30 min/km'
    },
    {
      sport: '🚶 Đi bộ',
      enabled: true,
      ratio: '1.0x (1 km = 1 km)',
      cls: 'badge-walk',
      pace: isAutumn ? 'Pace 9:00 – 14:00 min/km' : isSummer ? 'Pace 9:30 – 15:00 min/km' : 'Pace 9:00 – 14:30 min/km'
    },
    {
      sport: '🚴 Đạp xe',
      enabled: true,
      ratio: isAutumn ? '0.33x (3 km = 1 km)' : isSummer ? '0.50x (2 km = 1 km)' : '0.33x (3 km = 1 km)',
      cls: 'badge-ride',
      pace: isAutumn ? 'Tốc độ 10.0 – 25.0 km/h' : isSummer ? 'Tốc độ 12.0 – 30.0 km/h' : 'Tốc độ 10.0 – 28.0 km/h'
    },
    {
      sport: '🏊 Bơi lội',
      enabled: !isSummer, // Summer competition disabled Swim
      ratio: '5.0x (200m = 1 km)',
      cls: 'badge-swim',
      pace: 'Pace 1:30 – 5:30 min/100m'
    },
  ]

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: 840 }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Zap size={15} /> Thể Lệ Do Ban Tổ Chức Cấu Hình
        </div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Thể lệ &amp; Quy định tính điểm cuộc thi
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Xem thể lệ và dải pace được thiết lập riêng bởi Ban Tổ Chức (Admin) cho từng Cuộc Thi.
        </p>
      </div>

      {/* Select Competition Dropdown */}
      <div className="card" style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
        background: 'var(--color-primary-light)',
        borderColor: 'var(--color-primary-ring)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Layers size={20} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {currentComp.name} ({currentComp.invite_code})
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Mã mời: <strong>{currentComp.invite_code}</strong> · Trạng thái: {currentComp.status === 'active' ? '🟢 Đang thi đấu' : '⚪ Đã kết thúc/Lưu trữ'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Xem thể lệ giải:
          </label>
          <select
            value={selectedCompId}
            onChange={e => setSelectedCompId(e.target.value)}
            className="input"
            style={{ width: 'auto', minWidth: 200, cursor: 'pointer', fontWeight: 600, background: 'var(--bg-base)' }}
          >
            {COMPETITIONS.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.invite_code})
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
              <strong style={{ color: 'var(--text-primary)' }}>Thời gian bắt đầu:</strong> 00:00 ngày {currentComp.start_date}
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Thời gian kết thúc:</strong> 23:59 ngày {currentComp.end_date}
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Hạn đăng ký chọn phòng ban:</strong> Trước 23:59 ngày {currentComp.registration_deadline}
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
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Bộ môn</th>
                  <th style={{ textAlign: 'center' }}>Tỉ lệ quy đổi</th>
                  <th>Dải pace / tốc độ hợp lệ</th>
                  <th style={{ textAlign: 'center' }}>Trạng thái áp dụng</th>
                </tr>
              </thead>
              <tbody>
                {sportRulesTable.map(r => (
                  <tr key={r.sport} style={!r.enabled ? { opacity: 0.5, background: 'var(--bg-subtle)' } : {}}>
                    <td>
                      <span className={`badge ${r.cls}`}>{r.sport}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-primary)' }}>{r.ratio}</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.pace}</td>
                    <td style={{ textAlign: 'center' }}>
                      {r.enabled ? (
                        <span className="badge status-ok">✓ Được chấp nhận</span>
                      ) : (
                        <span className="badge status-err">✕ BTC Không tính điểm</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
