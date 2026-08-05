import Link from 'next/link'
import { Trophy, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container" style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      textAlign: 'center',
    }}>
      <div className="card" style={{ maxWidth: 460, width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '16px',
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 800,
          margin: '0 auto 1.25rem auto'
        }}>
          404
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Trang không tồn tại
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          Đường dẫn bạn truy cập có thể đã bị thay đổi, xóa bỏ hoặc không khả dụng.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">
            <Home size={16} /> Trang chủ
          </Link>
          <Link href="/leaderboard" className="btn btn-secondary">
            <Trophy size={16} /> Bảng xếp hạng
          </Link>
        </div>
      </div>
    </div>
  )
}
