'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { Trophy, LayoutDashboard, User, Shield, Activity, Zap } from 'lucide-react'

interface HeaderProps {
  user?: { full_name?: string; avatar_url?: string | null; role?: string } | null
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()

  const isAuthContext = ['/dashboard', '/leaderboard', '/rules', '/profile', '/competitions'].some(r => pathname.startsWith(r))
  const isAdminContext = pathname.startsWith('/admin')

  const isLoggedIn = Boolean(user?.full_name) || isAuthContext

  const userInitial = (user?.full_name || '?').charAt(0).toUpperCase()
  const displayName = user?.full_name || 'Người dùng'

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
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-base)',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '60px', padding: '0 1.25rem',
        }}>
          {/* Logo */}
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em',
            color: 'var(--text-primary)', flexShrink: 0,
          }}>
            <img src="/icon.svg" alt="TM Tracker" width={32} height={32} style={{ borderRadius: '8px', flexShrink: 0, boxShadow: '0 2px 8px rgba(37,99,235,0.2)' }} />
            <span>TM Tracker</span>
          </Link>

          {/* Desktop Nav */}
          {isLoggedIn && !isAdminContext && (
            <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', margin: '0 auto' }}>
              {navLinks.map(l => {
                const active = pathname === l.href
                return (
                  <Link key={l.href} href={l.href} className="btn btn-ghost btn-sm"
                    style={{
                      color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 700 : 500,
                      background: active ? 'var(--color-primary-light)' : 'transparent',
                      display: 'flex', gap: '0.4rem', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.85rem',
                    }}>
                    {l.icon} {l.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: isLoggedIn ? undefined : 'auto' }}>
            <ThemeToggle />

            {!isAdminContext && (
              <Link href="/admin/login" className="btn btn-secondary btn-sm" style={{ color: 'var(--color-warning)', gap: '0.35rem' }}>
                <Shield size={14} /> <span className="hide-mobile">Admin</span>
              </Link>
            )}

            {isLoggedIn ? (
              <Link href="/profile" style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.3rem 0.65rem 0.3rem 0.3rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-base)',
                background: 'var(--bg-subtle)',
                fontSize: '0.85rem', fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={displayName} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                    {userInitial}
                  </span>
                )}
                <span className="hide-mobile" style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </span>
              </Link>
            ) : (
              <a href="/api/auth/strava" className="btn btn-primary btn-sm" style={{ gap: '0.35rem', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
                <Zap size={14} /> <span className="hide-mobile">Tham gia</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Persistent Mobile Bottom Bar */}
      {isLoggedIn && !isAdminContext && (
        <nav className="mobile-bottom-nav">
          {mobileTabs.map(tab => {
            const active = pathname === tab.href
            return (
              <Link key={tab.href} href={tab.href} className={`mobile-nav-item${active ? ' active' : ''}`}>
                <div className="mobile-nav-item-icon">
                  {tab.icon}
                </div>
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
