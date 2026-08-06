import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getCurrentUser } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'TM Tracker — Thi Đua Thể Thao Thái Minh',
  description: 'Bảng xếp hạng KM thể thao thời gian thực cho các giải thi đua nội bộ Công ty Thái Minh. Tự động quy đổi quãng đường tích lũy.',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <html lang="vi">
      <body>
        <Header user={user} />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer user={user} />
      </body>
    </html>
  )
}
