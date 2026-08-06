'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32
  }

  const iconSize = sizeMap[size]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '2rem',
      width: '100%'
    }}>
      <div
        style={{
          width: iconSize,
          height: iconSize,
          border: '3px solid var(--border-base)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          {text}
        </p>
      )}
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    href?: string
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '3rem 2rem',
        textAlign: 'center',
        width: '100%'
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: '3rem',
            color: 'var(--text-tertiary)',
            marginBottom: '0.5rem'
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          margin: 0,
          maxWidth: 400
        }}
      >
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary btn-sm"
          style={{ gap: '0.35rem' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  title: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorState({ title, message, onRetry, onDismiss }: ErrorStateProps) {
  return (
    <div
      className="card"
      style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'var(--color-danger-bg)',
        borderColor: 'var(--color-danger-border)',
        maxWidth: 500,
        margin: '2rem auto'
      }}
    >
      <div
        style={{
          fontSize: '2.5rem',
          marginBottom: '1rem'
        }}
      >
        ⚠️
      </div>
      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--color-danger)',
          marginBottom: '0.5rem'
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          marginBottom: '1.5rem'
        }}
      >
        {message}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            Thử lại
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="btn btn-secondary btn-sm"
          >
            Đóng
          </button>
        )}
      </div>
    </div>
  )
}
