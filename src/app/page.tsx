import Link from 'next/link'
import { Trophy, Zap, Activity as ActivityIcon, TrendingUp, Shield, ArrowRight, LogIn, ShieldCheck, LayoutDashboard, User } from 'lucide-react'
import { getActiveCompetition } from '@/lib/queries/competition'
import { getAdminStats } from '@/lib/queries/admin'
import { getCurrentUser } from '@/lib/auth/session'
import { getMyCompetitions, getMyActivities } from '@/lib/queries/user'
import InviteCodeInput from '@/components/home/InviteCodeInput'
import type { Activity, Competition, UserProfile } from '@/lib/supabase/types'

type AdminStats = { participantCount: number; totalKm: number; activityCount: number; suspiciousCount: number }

export default async function Home() {
  const user = await getCurrentUser()
  const competition = await getActiveCompetition()

  if (user) {
    const [competitions, activities] = await Promise.all([
      getMyCompetitions(),
      getMyActivities(competition?.id),
    ])
    const allComps = competition && !competitions.find(c => c.id === competition.id)
      ? [competition, ...competitions]
      : competitions
    return <LoggedInHome user={user} competitions={allComps} activities={activities} />
  }

  const stats = competition ? await getAdminStats(competition.id) : null
  return <LandingPage competition={competition} stats={stats} />
}

/* ─── Logged-in view: clean, action-first ─── */
function LoggedInHome({ user, competitions, activities }: { user: UserProfile; competitions: Competition[]; activities: Activity[] }) {
  const activeComps = competitions.filter(c => c.status === 'active' || c.status === 'registration')
  const recentActivities = activities.slice(0, 3)
  const totalKm = activities.filter(a => a.is_valid).reduce((s, a) => s + a.distance_converted_km, 0)

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem', maxWidth: 720 }}>

      {/* Greeting */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Chào, {user.full_name}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {totalKm > 0
            ? `Bạn đã tích lũy ${totalKm.toFixed(1)} km quy đổi.`
            : 'Bắt đầu tập luyện để tích lũy km nhé!'}
        </p>
      </div>

      {/* Quick actions — primary navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'Thành tích & bài tập', color: 'var(--color-primary)' },
          { href: '/leaderboard', icon: Trophy, label: 'Bảng xếp hạng', desc: 'Xem hạng của bạn', color: 'var(--rank-gold)' },
          { href: '/profile', icon: User, label: 'Cá nhân', desc: 'Phòng ban & tài khoản', color: 'var(--color-success)' },
          { href: '/rules', icon: ActivityIcon, label: 'Thể lệ', desc: 'Quy định tính điểm', color: 'var(--color-warning)' },
          ...(user?.role === 'admin' || user?.role === 'super_admin' ? [
            { href: '/admin', icon: Shield, label: 'Admin Portal', desc: 'Quản trị hệ thống', color: 'var(--color-warning)' },
          ] : []),
        ].map(item => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="card" style={{
              padding: '1rem 1.25rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.85rem',
              transition: 'border-color 0.15s, box-shadow 0.15s', cursor: 'pointer',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                background: `${item.color}15`, color: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.desc}</div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            </Link>
          )
        })}
      </div>

      {/* Active competitions */}
      {activeComps.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.75rem' }}>Cuộc thi đang tham gia</h2>
          {activeComps.map(comp => (
            <Link key={comp.id} href={`/dashboard`} className="card" style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.1rem 1.25rem', marginBottom: '0.6rem',
              textDecoration: 'none', borderLeftWidth: '5px', borderLeftColor: 'var(--color-primary)', cursor: 'pointer',
            }}>
              <Trophy size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>{comp.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Mã: {comp.invite_code} · {comp.status === 'registration' ? 'Đang đăng ký' : 'Đang thi đấu'}
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}

      {/* Recent activities preview */}
      {recentActivities.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Bài tập gần đây</h2>
            <Link href="/dashboard" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              Xem tất cả
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentActivities.map(a => (
              <div key={a.id} className="card-subtle" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.activity_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {a.sport_type} · {new Date(a.start_date).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: a.is_valid ? 'var(--color-primary)' : 'var(--text-tertiary)' }}>
                    {a.distance_converted_km.toFixed(1)} km
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    {a.is_valid ? 'Hợp lệ' : 'Loại'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Logged-out view: landing + login ─── */
function LandingPage({ competition, stats }: { competition: Competition | null; stats: AdminStats | null }) {
  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem', maxWidth: 920 }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>
        {/* Single logo rendering */}
        <img
          src="/icon.svg"
          alt="TM Tracker"
          width={72}
          height={72}
          style={{
            borderRadius: '20px',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 8px 30px rgba(37,99,235,0.25)',
          }}
        />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.95rem', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', marginBottom: '1.25rem' }}>
          <Trophy size={15} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-primary)' }}>TM Tracker — Thi Đua Thể Thao Doanh Nghiệp</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: '1rem' }}>
          Bảng xếp hạng KM <br className="hide-mobile" />
          <span style={{ color: 'var(--color-primary)', display: 'inline-block', marginTop: '0.2rem' }}>
            thi đua thể thao doanh nghiệp
          </span>
        </h1>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
          Kết nối Strava một lần. Mọi bài tập chạy bộ, đạp xe, đi bộ, bơi lội được tự động đồng bộ, kiểm duyệt pace và quy đổi điểm theo thể lệ.
        </p>

        {/* Invite code input — primary CTA */}
        <InviteCodeInput />

        <div style={{ marginTop: '0.75rem' }}>
          <Link href="/leaderboard" className="btn btn-secondary btn-sm" style={{ gap: '0.35rem', color: 'var(--text-primary)', border: '1px solid var(--border-base)' }}>
            <Trophy size={14} style={{ color: 'var(--rank-gold)' }} /> Xem bảng xếp hạng trực tiếp
          </Link>
        </div>
      </div>

      {/* Login section — high up, right after hero */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <LogIn size={14} /> Đăng nhập hệ thống
          </div>
        </div>
        <div className="mobile-grid-1col" style={{ '--grid-min': '260px', maxWidth: 580, margin: '0 auto', gap: '1rem' } as React.CSSProperties}>
          <a href="/api/auth/strava" className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            padding: '1.5rem', gap: '0.75rem', cursor: 'pointer', textDecoration: 'none',
            border: '1.5px solid var(--color-primary-ring)', background: 'var(--bg-base)',
            boxShadow: '0 4px 16px rgba(37,99,235,0.08)', transition: 'all 0.15s ease',
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Vận động viên</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Đăng nhập bằng tài khoản Strava để tham gia thi đấu
            </p>
          </a>
          <Link href="/admin/login" className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            padding: '1.5rem', gap: '0.75rem', cursor: 'pointer', textDecoration: 'none',
            border: '1.5px solid var(--color-warning-border)', background: 'var(--bg-base)',
            boxShadow: '0 4px 16px rgba(245,158,11,0.08)', transition: 'all 0.15s ease',
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Ban Tổ Chức</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Đăng nhập bằng email để truy cập trang quản trị
            </p>
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      {stats && stats.participantCount > 0 && (
        <div className="stats-grid-mobile" style={{ marginBottom: '2.5rem' }}>
          {[
            { icon: ActivityIcon, label: 'Vận động viên', value: stats.participantCount, color: 'var(--color-primary)' },
            { icon: TrendingUp, label: 'Tổng KM quy đổi', value: stats.totalKm?.toFixed(0) || 0, color: 'var(--color-success)' },
            { icon: Trophy, label: 'Bài tập hợp lệ', value: stats.activityCount - stats.suspiciousCount, color: 'var(--rank-gold)' },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="stat-card" style={{ textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
                <Icon size={20} style={{ color: s.color, marginBottom: '0.4rem' }} />
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-sub">{s.label}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Features */}
      <div className="mobile-grid-1col" style={{ '--grid-min': '260px' } as React.CSSProperties}>
        {[
          { icon: Zap, title: 'Tự động đồng bộ', desc: 'Webhook Strava đẩy bài tập theo thời gian thực. Không cần nhập tay.', color: 'var(--color-primary)' },
          { icon: Shield, title: 'Kiểm duyệt minh bạch', desc: 'Tự động lọc pace/tốc độ. Admin đối soát và duyệt hoạt động nghi vấn.', color: 'var(--color-warning)' },
          { icon: Trophy, title: 'Bảng xếp hạng phong phú', desc: 'Theo cá nhân, phòng ban, từng môn thể thao. Cập nhật liên tục.', color: 'var(--rank-gold)' },
        ].map(f => {
          const Icon = f.icon
          return (
            <div key={f.title} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${f.color}15`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                <Icon size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
