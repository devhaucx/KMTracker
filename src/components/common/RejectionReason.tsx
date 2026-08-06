'use client'

import { useState } from 'react'
import { AlertCircle, Info, X } from 'lucide-react'

interface Props {
  reason: string | null
  compact?: boolean
}

export default function RejectionReason({ reason, compact = false }: Props) {
  const [showFull, setShowFull] = useState(false)

  if (!reason) return null

  // Shorten common rejection reasons
  const getShortReason = (fullReason: string) => {
    if (fullReason.includes('nằm ngoài thời gian')) return 'Ngoài thời gian thi đấu'
    if (fullReason.includes('nằm ngoài phạm vi quy định')) return 'Pace/tốc độ không hợp lệ'
    if (fullReason.includes('không thuộc danh mục tính điểm')) return 'Môn thể thao không được tính điểm'
    if (fullReason.includes('không hợp lệ')) return 'Dữ liệu không hợp lệ'
    return 'Không hợp lệ'
  }

  const getCategoryColor = (reason: string) => {
    if (reason.includes('thời gian')) return 'var(--color-warning)'
    if (reason.includes('phạm vi') || reason.includes('pace') || reason.includes('tốc độ')) return 'var(--color-info)'
    if (reason.includes('danh mục')) return 'var(--color-danger)'
    return 'var(--color-text-tertiary)'
  }

  const shortReason = getShortReason(reason)
  const categoryColor = getCategoryColor(reason)

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        <AlertCircle size={12} style={{ color: categoryColor, flexShrink: 0 }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
          {shortReason}
        </span>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowFull(!showFull)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.25rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          background: `${categoryColor}15`,
          color: categoryColor,
          fontSize: '0.75rem',
          fontWeight: 500,
          cursor: 'pointer',
          border: `1px solid ${categoryColor}30`,
          transition: 'all 0.15s ease'
      }}
        onMouseEnter={() => setShowFull(true)}
        onMouseLeave={() => setShowFull(false)}
      >
        <AlertCircle size={12} />
        <span>{shortReason}</span>
        <Info size={10} style={{ opacity: 0.7 }} />
      </button>

      {/* Tooltip/Popover for full reason */}
      {showFull && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          marginBottom: '0.5rem',
          padding: '0.75rem',
          background: 'var(--bg-base)',
          border: '1px solid var(--border-base)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          minWidth: 200,
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          whiteSpace: 'normal',
          lineHeight: 1.4
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Info size={14} style={{ color: categoryColor, flexShrink: 0, marginTop: '0.1rem' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Chi tiết:</span>
          </div>
          <p style={{ margin: 0 }}>{reason}</p>
        </div>
      )}
    </div>
  )
}
