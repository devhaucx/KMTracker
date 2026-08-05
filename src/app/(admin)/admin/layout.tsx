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
  Menu,
  X,
  LogOut,
  ExternalLink,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/competitions', label: 'Cuộc thi', icon: Trophy, exact: false },
  { href: '/admin/departments', label: 'Phòng ban', icon: Building2, exact: false },
  { href: '/admin/users', label: 'Người dùng', icon: Users, exact: false },
  { href: '/admin/activities', label: 'Hoạt động', icon: Activity, exact: false },
  { href: '/admin/reports', label: 'Báo cáo', icon: FileText, exact: false },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const isActive = (item: typeof NAV_ITEMS[number]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', background: 'var(--bg-subtle)' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
          className="show-mobile"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: 260,
          flexShrink: 0,
          background: 'var(--bg-base)',
          borderRight: '1px solid var(--border-base)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'transform var(--transition-base)',
          zIndex: 45,
        }}
        className={`hide-mobile ${sidebarOpen ? 'show-mobile' : ''}`}
      >
        <div>
          {/* Header section in sidebar */}
          <div
            style={{
              padding: '1.25rem 1.25rem 1rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                <Shield size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Admin Portal
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Quản trị hệ thống</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn btn-ghost btn-icon btn-sm show-mobile"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav Items */}
          <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                    background: active ? 'var(--color-primary-light)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={18} style={{ color: active ? 'var(--color-primary)' : 'var(--text-tertiary)' }} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: '1rem 0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <Link
            href="/leaderboard"
            className="btn btn-ghost btn-sm"
            style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)', gap: '0.5rem' }}
          >
            <ExternalLink size={15} /> Xem trang Leaderboard
          </Link>
          <Link
            href="/admin/login"
            className="btn btn-ghost btn-sm"
            style={{ justifyContent: 'flex-start', color: 'var(--color-danger)', gap: '0.5rem' }}
          >
            <LogOut size={15} /> Đăng xuất
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Header Bar */}
        <div
          className="show-mobile"
          style={{
            height: 48,
            padding: '0 1rem',
            background: 'var(--bg-base)',
            borderBottom: '1px solid var(--border-base)',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Quản trị KM Tracker
          </span>

          <div style={{ width: 32 }} />
        </div>

        {/* Dynamic Page Children */}
        <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  )
}
