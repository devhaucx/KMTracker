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
        padding: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
          <span style={{
            width: 22, height: 22, borderRadius: '6px',
            background: 'var(--color-primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '0.6rem', fontWeight: 800,
          }}>KT</span>
          <span style={{ color: 'var(--text-secondary)' }}>KM Tracker — Hệ Thống Tích Lũy &amp; Thi Đua KM Thể Thao Doanh Nghiệp</span>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', fontSize: '0.825rem' }}>
          <Link href="/admin/login" style={{ color: 'var(--color-warning)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
            <Shield size={13} /> Trang Quản trị Admin
          </Link>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} KM Tracker.
          </span>
        </div>
      </div>
    </footer>
  )
}
