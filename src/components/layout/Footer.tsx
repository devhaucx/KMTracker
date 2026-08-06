'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-base)',
      background: 'var(--bg-subtle)',
    }}>
      <div className="container" style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.8rem' }}>
          <span style={{
            width: 22, height: 22, borderRadius: '6px',
            background: 'var(--color-primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '0.6rem', fontWeight: 800, flexShrink: 0,
          }}>KT</span>
          <span style={{ color: 'var(--text-secondary)' }}>© {new Date().getFullYear()} TM Tracker</span>
        </div>

        <Link href="/admin/login" className="hide-mobile" style={{ color: 'var(--color-warning)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.8rem' }}>
          <Shield size={13} /> Quản trị
        </Link>
      </div>
    </footer>
  )
}
