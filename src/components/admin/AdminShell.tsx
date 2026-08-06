'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Trophy,
  Building2,
  Users,
  Activity,
  FileText,
  Shield,
  X,
  LogOut,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/competitions', label: 'Cuộc thi', icon: Trophy, exact: false },
  { href: '/admin/activities', label: 'Hoạt động', icon: Activity, exact: false },
  { href: '/admin/users', label: 'Người dùng', icon: Users, exact: false },
  { href: '/admin/departments', label: 'Phòng ban', icon: Building2, exact: false },
  { href: '/admin/reports', label: 'Báo cáo', icon: FileText, exact: false },
]

const MOBILE_PRIMARY = NAV_ITEMS.slice(0, 4)
const MOBILE_SECONDARY = NAV_ITEMS.slice(4)

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [moreSheetOpen, setMoreSheetOpen] = useState(false)

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const isActive = (item: typeof NAV_ITEMS[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const isMoreActive = MOBILE_SECONDARY.some(item => isActive(item))

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', background: 'var(--bg-subtle)' }}>
      {/* Desktop sidebar */}
      <aside
        style={{
          width: 250, flexShrink: 0, background: 'var(--bg-base)', borderRight: '1px solid var(--border-base)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'sticky', top: 56, height: 'calc(100vh - 56px)',
        }}
        className="hide-mobile"
      >
        <div>
          <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                <Shield size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Admin Portal</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Quản trị hệ thống</div>
              </div>
            </div>
          </div>

          <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.href} href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: active ? 600 : 500,
                    color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                    background: active ? 'var(--color-primary-light)' : 'transparent', transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={18} style={{ color: active ? 'var(--color-primary)' : 'var(--text-tertiary)' }} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/leaderboard" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)', gap: '0.5rem' }}>
            <ExternalLink size={15} /> Xem trang Leaderboard
          </Link>
          <a href="/api/auth/logout" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', color: 'var(--color-danger)', gap: '0.5rem' }}>
            <LogOut size={15} /> Đăng xuất
          </a>
        </div>
      </aside>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        <div className="admin-content" style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>

      {/* Material 3 Android Bottom Navigation Bar */}
      <nav className="admin-bottom-nav">
        {MOBILE_PRIMARY.map((item) => {
          const active = isActive(item)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className={`admin-nav-item${active ? ' active' : ''}`}>
              <div className="admin-nav-item-icon">
                <Icon size={18} />
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          className={`admin-nav-item${moreSheetOpen || isMoreActive ? ' active' : ''}`}
          onClick={() => setMoreSheetOpen(!moreSheetOpen)}
        >
          <div className="admin-nav-item-icon">
            {moreSheetOpen ? <X size={18} /> : <MoreHorizontal size={18} />}
          </div>
          <span>Khác</span>
        </button>
      </nav>

      {/* Mobile "More" bottom sheet */}
      {moreSheetOpen && (
        <>
          <div className="admin-bottom-sheet-backdrop open" onClick={() => setMoreSheetOpen(false)} />
          <div className="admin-bottom-sheet open">
            <div style={{ padding: '0.5rem 0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {MOBILE_SECONDARY.map((item) => {
                const active = isActive(item)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href} href={item.href} onClick={() => setMoreSheetOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: active ? 600 : 500,
                      color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                      background: active ? 'var(--color-primary-light)' : 'transparent',
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0.35rem 0' }} />
              <Link
                href="/leaderboard" onClick={() => setMoreSheetOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500,
                  color: 'var(--text-secondary)',
                }}
              >
                <ExternalLink size={18} />
                <span>Xem trang Leaderboard</span>
              </Link>
              <a
                href="/api/auth/logout"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500,
                  color: 'var(--color-danger)',
                }}
              >
                <LogOut size={18} />
                <span>Đăng xuất Quản trị</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
