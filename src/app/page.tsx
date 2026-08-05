import Link from 'next/link'
import { Trophy, Shield, Zap, Users, ArrowRight, Link2, LayoutDashboard, Sparkles, Building2 } from 'lucide-react'

export default function Home() {
  const WORKFLOW_STEPS = [
    {
      num: '01',
      icon: <Building2 size={22} style={{ color: 'var(--color-primary)' }} />,
      title: 'Ban Tổ Chức Tạo Cuộc Thi',
      desc: 'Thiết lập danh sách các bộ môn, tỉ lệ quy đổi điểm và phát hành Link Mời riêng cho doanh nghiệp.',
    },
    {
      num: '02',
      icon: <Link2 size={22} style={{ color: 'var(--sport-run)' }} />,
      title: 'Tham Gia Qua Link Mời',
      desc: 'Vận động viên mở đường link mời được gửi, đăng nhập tài khoản Strava và chọn phòng ban đại diện.',
    },
    {
      num: '03',
      icon: <Zap size={22} style={{ color: 'var(--color-warning)' }} />,
      title: 'Tự Động Tính Điểm & Xếp Hạng',
      desc: 'Mọi bài tập được tự động kiểm tra dải pace hợp lệ và quy đổi điểm số lên Bảng Xếp Hạng.',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Hero Section ── */}
      <section style={{ padding: '4.5rem 0 3.5rem', borderBottom: '1px solid var(--border-base)', background: 'var(--bg-base)' }}>
        <div className="container" style={{ maxWidth: 840, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          
          <span className="badge badge-blue" style={{ fontSize: '0.825rem', padding: '0.3rem 0.8rem', gap: '0.4rem' }}>
            <Sparkles size={14} /> Nền Tảng Thi Đua Thể Thao Doanh Nghiệp
          </span>

          <h1 style={{ fontSize: 'clamp(2.1rem, 5.5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
            KM Tracker — Hệ thống tích lũy &amp; thi đua KM thể thao<br />
            <span style={{ color: 'var(--color-primary)' }}>dựa trên quãng đường thực hiện được</span>
          </h1>

          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: 620, lineHeight: 1.65 }}>
            Thi đua phong trào tích lũy KM thể thao giữa các cá nhân &amp; phòng ban qua ứng dụng Strava. Tự động quy đổi và minh bạch quãng đường thực hiện.
          </p>

          {/* Dual Action Cards: User Path vs Admin Path */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            width: '100%',
            marginTop: '1.5rem',
            textAlign: 'left',
          }}>
            {/* User Path Card */}
            <div className="card" style={{ padding: '1.75rem', borderColor: 'var(--color-primary-ring)', background: 'var(--color-primary-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                <Users size={20} /> Vận Động Viên &amp; Nhân Viên
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                Nhận được link mời từ Ban Tổ Chức? Bấm vào link mời để xem thể lệ và đăng ký tham gia bằng tài khoản Strava.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link href="/leaderboard" className="btn btn-primary btn-sm">
                  <Trophy size={15} /> Xem Bảng Xếp Hạng
                </Link>
                <Link href="/dashboard" className="btn btn-secondary btn-sm">
                  <LayoutDashboard size={15} /> Dashboard Cá Nhân
                </Link>
              </div>
            </div>

            {/* Admin Path Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                <Shield size={20} style={{ color: 'var(--color-warning)' }} /> Ban Tổ Chức &amp; Admin
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                Quản trị viên khởi tạo cuộc thi mới, cài đặt bộ môn thi đấu, tạo link mời và đối soát bài tập.
              </p>
              <Link href="/admin/login" className="btn btn-outline btn-sm" style={{ width: 'fit-content' }}>
                <Shield size={15} /> Đăng Nhập Trang Admin <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── Workflow Steps ── */}
      <section style={{ padding: '3.5rem 0', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem' }}>Quy trình vận hành đơn giản</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              Chỉ 3 bước để khởi tạo và tham gia giải đấu thể thao nội bộ.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {WORKFLOW_STEPS.map(s => (
              <div key={s.num} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {s.icon}
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{s.num}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
