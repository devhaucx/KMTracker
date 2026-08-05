'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRouter as useNextRouter } from 'next/navigation'
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Key,
  Flame,
  Check,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import type { SportType } from '@/lib/supabase/types'

interface SportRuleState {
  enabled: boolean
  ratio: number
  minPaceOrSpeed: string
  maxPaceOrSpeed: string
}

export default function NewCompetitionPage() {
  const router = useNextRouter()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Basic Info
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('AUTUMN2026')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('2026-09-01')
  const [endDate, setEndDate] = useState('2026-09-30')
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-08-31')
  const [status, setStatus] = useState<'draft' | 'registration' | 'active'>('registration')

  // Sport Rules
  const [sportRules, setSportRules] = useState<Record<SportType, SportRuleState>>({
    Run: { enabled: true, ratio: 1.0, minPaceOrSpeed: '4:00', maxPaceOrSpeed: '15:00' },
    Walk: { enabled: true, ratio: 1.0, minPaceOrSpeed: '9:00', maxPaceOrSpeed: '20:00' },
    Ride: { enabled: true, ratio: 0.33, minPaceOrSpeed: '10', maxPaceOrSpeed: '35' },
    Swim: { enabled: true, ratio: 5.0, minPaceOrSpeed: '1:30', maxPaceOrSpeed: '6:00' },
  })

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'COMP'
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setInviteCode(code)
  }

  const toggleSport = (sport: SportType) => {
    setSportRules((prev) => ({
      ...prev,
      [sport]: { ...prev[sport], enabled: !prev[sport].enabled },
    }))
  }

  const updateRuleField = (sport: SportType, field: keyof SportRuleState, value: any) => {
    setSportRules((prev) => ({
      ...prev,
      [sport]: { ...prev[sport], [field]: value },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    setTimeout(() => {
      setSubmitting(false)
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/competitions')
      }, 1200)
    }, 600)
  }

  const SPORTS_CONFIG: { type: SportType; title: string; icon: string; badgeCls: string; unit: string }[] = [
    { type: 'Run', title: 'Chạy bộ (Run)', icon: '🏃', badgeCls: 'badge-run', unit: 'min/km' },
    { type: 'Walk', title: 'Đi bộ (Walk)', icon: '🚶', badgeCls: 'badge-walk', unit: 'min/km' },
    { type: 'Ride', title: 'Đạp xe (Ride)', icon: '🚴', badgeCls: 'badge-ride', unit: 'km/h' },
    { type: 'Swim', title: 'Bơi lội (Swim)', icon: '🏊', badgeCls: 'badge-swim', unit: 'min/100m' },
  ]

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href="/admin/competitions"
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Quản lý cuộc thi
        </Link>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700 }}>Tạo Cuộc Thi Mới</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Điền các thông số cơ bản và quy tắc quy đổi thành tích môn thể thao cho cuộc thi.
        </p>
      </div>

      {success && (
        <div
          className="card"
          style={{
            background: 'var(--color-success-bg)',
            borderColor: 'var(--color-success-border)',
            color: 'var(--color-success)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <Check size={18} /> Đã tạo cuộc thi mới thành công! Đang chuyển hướng...
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Information */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Trophy size={18} style={{ color: 'var(--color-primary)' }} /> Thông tin chung cuộc thi
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                Tên cuộc thi <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Giải Thể Thao Mùa Thu 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  Mã mời (Invite Code) <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    required
                    placeholder="AUTUMN2026"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="input"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={generateInviteCode}
                    className="btn btn-secondary btn-icon"
                    title="Tạo ngẫu nhiên"
                  >
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  Trạng thái ban đầu
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="registration">Mở đăng ký (Registration)</option>
                  <option value="draft">Bản nháp (Draft)</option>
                  <option value="active">Đang diễn ra (Active)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                Mô tả cuộc thi
              </label>
              <textarea
                rows={3}
                placeholder="Nhập thông tin động viên cán bộ nhân viên tham gia..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Dates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  Hạn chót đăng ký
                </label>
                <input
                  type="date"
                  required
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Sports & Rules */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Flame size={18} style={{ color: 'var(--color-warning)' }} /> Cấu hình các môn thể thao & Quy tắc Pace
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Bật/Tắt môn thể thao allowed, hệ số quy đổi KM và giới hạn tốc độ/pace hợp lệ để lọc vi phạm.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {SPORTS_CONFIG.map((sport) => {
              const rule = sportRules[sport.type]
              return (
                <div
                  key={sport.type}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-base)',
                    background: rule.enabled ? 'var(--bg-base)' : 'var(--bg-subtle)',
                    opacity: rule.enabled ? 1 : 0.65,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: rule.enabled ? '1rem' : 0,
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleSport(sport.type)}
                        style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                      />
                      <span>
                        {sport.icon} {sport.title}
                      </span>
                    </label>

                    <span className={`badge ${rule.enabled ? sport.badgeCls : 'badge-neutral'}`}>
                      {rule.enabled ? 'Được phép tính điểm' : 'Tắt'}
                    </span>
                  </div>

                  {rule.enabled && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          Hệ số quy đổi (1 km =)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={rule.ratio}
                            onChange={(e) => updateRuleField(sport.type, 'ratio', parseFloat(e.target.value) || 0)}
                            className="input"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>km quy đổi</span>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          Giới hạn nhỏ nhất ({sport.unit})
                        </label>
                        <input
                          type="text"
                          value={rule.minPaceOrSpeed}
                          onChange={(e) => updateRuleField(sport.type, 'minPaceOrSpeed', e.target.value)}
                          className="input"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
                          placeholder={`Min (${sport.unit})`}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          Giới hạn lớn nhất ({sport.unit})
                        </label>
                        <input
                          type="text"
                          value={rule.maxPaceOrSpeed}
                          onChange={(e) => updateRuleField(sport.type, 'maxPaceOrSpeed', e.target.value)}
                          className="input"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
                          placeholder={`Max (${sport.unit})`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Link href="/admin/competitions" className="btn btn-secondary">
            Hủy bỏ
          </Link>
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <Save size={16} /> {submitting ? 'Đang khởi tạo...' : 'Tạo cuộc thi'}
          </button>
        </div>
      </form>
    </div>
  )
}
