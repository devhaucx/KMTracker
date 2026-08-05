import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'KM Tracker — Hệ Thống Tích Lũy & Thi Đua KM Thể Thao Doanh Nghiệp',
  description: 'Bảng xếp hạng KM thể thao thời gian thực cho các giải thi đua nội bộ doanh nghiệp. Tự động quy đổi quãng đường tích lũy.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
