'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight } from 'lucide-react'

export default function InviteCodeInput() {
  const router = useRouter()
  const [code, setCode] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const raw = code.trim()
    if (!raw) return
    const parsed = raw.includes('/join/')
      ? raw.split('/join/')[1].split('/')[0].split('?')[0]
      : raw
    router.push(`/join/${parsed.toUpperCase()}`)
  }

  return (
    <form onSubmit={submit} className="mobile-stack" style={{ gap: '0.5rem', maxWidth: 420, margin: '0 auto' }}>
      <input
        type="text"
        required
        placeholder="Nhập mã mời cuộc thi..."
        value={code}
        onChange={e => setCode(e.target.value)}
        className="input mobile-full-width"
        style={{ fontSize: '0.9rem', textAlign: 'center', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase' }}
      />
      <button type="submit" className="btn btn-primary btn-lg mobile-full-width" style={{ gap: '0.4rem', whiteSpace: 'nowrap' }}>
        <Zap size={18} /> Tham gia ngay <ArrowRight size={16} />
      </button>
    </form>
  )
}
