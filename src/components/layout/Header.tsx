'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { Trophy, LayoutDashboard, User, Shield, Menu, X, Activity, Home, Zap } from 'lucide-react'

interface HeaderProps {
  user?: { full_name?: string; avatar_url?: string | null; role?: string } | null
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Check if current route is inside a competition/authenticated context
  const isAuthContext = ['/dashboard', '/leaderboard', '/rules', '/profile', '/competitions'].some(r => pathname.startsWith(r))
  const isAdminContext = pathname.startsWith('/admin')

  // Mock logged-in state (in mock mode, user is considered logged in when inside /dashboard, /leaderboard, etc.)
  const isLoggedIn = Boolean(user) || isAuthContext

  const navLinks = [
    { href: '/leaderboard', label: 'Bảng xếp hạng', icon: <Trophy size={15} /> },
    { href: '/dashboard',   label: 'Dashboard',      icon: <LayoutDashboard size={15} /> },
    { href: '/rules',       label: 'Thể lệ',         icon: <Activity size={15} /> },
    { href: '/profile',     label: 'Cá nhân',        icon: <User size={15} /> },
  ]

  const mobileTabs = [
    { href: '/leaderboard', label: 'BXH',        icon: <Trophy size={18} /> },
    { href: '/dashboard',   label: 'Dashboard',  icon: <LayoutDashboard size={18} /> },
    { href: '/rules',       label: 'Thể lệ',     icon: <Activity size={18} /> },
    { href: '/profile',     label: 'Cá nhân',    icon: <User size={18} /> },
  ]

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-base)',
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center',
          height: '56px', gap: '1.5rem',
        }}>
          {/* Logo */}
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontWeight: 700, fontSize: '0.975rem', letterSpacing: '-0.01em',
            color: 'var(--text-primary)', flexShrink: 0,
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: '7px',
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.75rem', fontWeight: 800,
            }}>KT</span>
            KM Tracker
          </Link>

          {/* Desktop Nav - Only shown when user is logged in / inside competition context */}
          {isLoggedIn && !isAdminContext && (
            <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', flex: 1 }}>
              {navLinks.map(l => {
                const active = pathname === l.href
                return (
                  <Link key={l.href} href={l.href} className="btn btn-ghost btn-sm"
                    style={{
                      color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 700 : 500,
                      display: 'flex', gap: '0.35rem',
                    }}>
                    {l.icon} {l.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <ThemeToggle />

            {!isAdminContext && (
              <Link href="/admin/login" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-warning)', gap: '0.35rem' }}>
                <Shield size={14} /> <span className="hide-mobile">Admin</span>
              </Link>
            )}

            {isLoggedIn ? (
              <Link href="/profile" style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.3rem 0.6rem 0.3rem 0.3rem',
                borderRadius: '999px',
                border: '1px solid var(--border-base)',
                background: 'var(--bg-subtle)',
                fontSize: '0.85rem', fontWeight: 500,
                color: 'var(--text-primary)',
              }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                  N
                </span>
                <span className="hide-mobile" style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Nguyễn Văn Mạnh
                </span>
              </Link>
            ) : (
              <Link href="/api/auth/strava" className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
                <Zap size={14} /> Tham gia bằng Strava
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button className="btn btn-ghost btn-icon btn-sm show-mobile"
              onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div style={{
            background: 'var(--bg-base)',
            borderTop: '1px solid var(--border-base)',
            padding: '0.75rem 1.25rem 1rem',
            display: 'flex', flexDirection: 'column', gap: '0.25rem',
          }}>
            <Link href="/" onClick={() => setOpen(false)} className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
              <Home size={16} /> Trang chủ
            </Link>
            {!isLoggedIn && (
              <Link href="/api/auth/strava" onClick={() => setOpen(false)} className="btn btn-primary btn-sm" style={{ justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Zap size={16} /> Tham gia cuộc thi ngay
              </Link>
            )}
            <Link href="/admin/login" onClick={() => setOpen(false)} className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '0.5rem', color: 'var(--color-warning)' }}>
              <Shield size={16} /> Đăng nhập Admin
            </Link>
          </div>
        )}
      </header>

      {/* Persistent Mobile Bottom Bar - Only shown inside authenticated competition context */}
      {isLoggedIn && !isAdminContext && (
        <nav className="mobile-bottom-nav">
          {mobileTabs.map(tab => {
            const active = pathname === tab.href
            return (
              <Link key={tab.href} href={tab.href} className={`mobile-nav-item${active ? ' active' : ''}`}>
                {tab.icon}
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
