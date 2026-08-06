'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface Props {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: Props) {
  if (!items || items.length === 0) return null

  return (
    <nav style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          transition: 'color 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <Home size={14} />
        <span style={{ fontSize: '0.75rem' }}>Trang chủ</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ChevronRight size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          {item.href ? (
            <Link
              href={item.href}
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {item.label}
            </Link>
          ) : (
            <span
              style={{
                color: 'var(--text-primary)',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
