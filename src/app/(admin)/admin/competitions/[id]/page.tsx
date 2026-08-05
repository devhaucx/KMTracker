'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Trophy,
  Save,
  Check,
  Flame,
  Copy,
  Trash2,
  AlertCircle,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import { MOCK_COMPETITIONS_LIST } from '@/lib/mock/data'
import type { SportType, CompetitionStatus } from '@/lib/supabase/types'

interface SportRuleState {
  enabled: boolean
  ratio: number
  minPaceOrSpeed: string
  maxPaceOrSpeed: string
}

export default function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const compId = resolvedParams.id
  const router = useRouter()

  const existingComp = MOCK_COMPETITIONS_LIST.find((c) => c.id === compId) || MOCK_COMPETITIONS_LIST[0]

  const [name, setName] = useState(existingComp.name)
  const [inviteCode, setInviteCode] = useState(existingComp.invite_code)
  const [description, setDescription] = useState(existingComp.description || '')
  const [startDate, setStartDate] = useState(existingComp.start_date)
  const [endDate, setEndDate] = useState(existingComp.end_date)
  const [registrationDeadline, setRegistrationDeadline] = useState(existingComp.registration_deadline)
  const [status, setStatus] = useState<CompetitionStatus>(existingComp.status)

  const isLocked = status === 'active' || status === 'ended'

  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [sportRules, setSportRules] = useState<Record<SportType, SportRuleState>>({
    Run: {
      enabled: existingComp.sports.includes('Run'),
      ratio: (existingComp.scoring_rules as any)?.Run?.ratio ?? 1.0,
      minPaceOrSpeed: (existingComp.scoring_rules as any)?.Run?.min_pace ?? '4:00',
      maxPaceOrSpeed: (existingComp.scoring_rules as any)?.Run?.max_pace ?? '15:00',
    },
    Walk: {
      enabled: existingComp.sports.includes('Walk'),
      ratio: (existingComp.scoring_rules as any)?.Walk?.ratio ?? 1.0,
      minPaceOrSpeed: (existingComp.scoring_rules as any)?.Walk?.min_pace ?? '9:00',
      maxPaceOrSpeed: (existingComp.scoring_rules as any)?.Walk?.max_pace ?? '20:00',
    },
    Ride: {
      enabled: existingComp.sports.includes('Ride'),
      ratio: (existingComp.scoring_rules as any)?.Ride?.ratio ?? 0.33,
      minPaceOrSpeed: (existingComp.scoring_rules as any)?.Ride?.min_speed ?? '10',
      maxPaceOrSpeed: (existingComp.scoring_rules as any)?.Ride?.max_speed ?? '35',
    },
    Swim: {
      enabled: existingComp.sports.includes('Swim'),
      ratio: (existingComp.scoring_rules as any)?.Swim?.ratio ?? 5.0,
      minPaceOrSpeed: (existingComp.scoring_rules as any)?.Swim?.min_pace ?? '1:30',
      maxPaceOrSpeed: (existingComp.scoring_rules as any)?.Swim?.max_pace ?? '6:00',
    },
  })

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleSport = (sport: SportType) => {
    if (isLocked) return
    setSportRules((prev) => ({
      ...prev,
      [sport]: { ...prev[sport], enabled: !prev[sport].enabled },
    }))
  }

  const updateRuleField = (sport: SportType, field: keyof SportRuleState, value: any) => {
    if (isLocked) return
    setSportRules((prev) => ({
      ...prev,
      [sport]: { ...prev[sport], [field]: value },
    }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    }, 500)
  }

  const handleDelete = () => {
    router.push('/admin/competitions')
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
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <Link
            href="/admin/competitions"
            className="btn btn-ghost btn-sm"
            style={{ paddingLeft: 0, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Danh sách cuộc thi
          </Link>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700 }}>Chỉnh Sửa Cuộc Thi</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{compId}</code>
          </p>
        </div>

        {!isLocked && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-sm"
            style={{
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderColor: 'var(--color-danger-border)',
            }}
          >
            <Trash2 size={15} /> Xóa cuộc thi
          </button>
        )}
      </div>

      {/* Security Immutability Alert */}
      {isLocked ? (
        <div
          className="card"
          style={{
            background: 'var(--color-warning-bg)',
            borderColor: 'var(--color-warning-border)',
            color: 'var(--color-warning)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Lock size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
              BẢO MẬT & CHỐNG THAO TÚNG: QUY TẮC ĐÃ BỊ KHÓA
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
              Cuộc thi đang ở trạng thái <strong>{status.toUpperCase()}</strong>. Toàn bộ quy tắc tính điểm, hệ số quy đổi, giới hạn pace và thời gian thi đấu đã được khóa tự động để đảm bảo tính công bằng tuyệt đối cho tất cả vận động viên.
            </div>
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            background: 'var(--color-info-bg)',
            borderColor: 'var(--color-info-border)',
            color: 'var(--color-info)',
            padding: '0.875rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.85rem',
          }}
        >
          <ShieldCheck size={18} /> Giải đấu ở giai đoạn Bản nháp / Đăng ký. Admin có thể tùy chỉnh quy tắc trước khi giải đấu chính thức khởi chạy.
        </div>
      )}

      {savedSuccess && (
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
          <Check size={18} /> Thay đổi đã được lưu thành công!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Basic Info */}
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
            <Trophy size={18} style={{ color: 'var(--color-primary)' }} /> Thông tin chung
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                Tên cuộc thi
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLocked}
                className="input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  Mã mời (Invite Code)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    disabled={isLocked}
                    className="input"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase' }}
                  />
                  <button type="button" onClick={copyCode} className="btn btn-secondary btn-icon" title="Copy mã">
                    {copied ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  Trạng thái cuộc thi
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CompetitionStatus)}
                  className="input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="active">Đang diễn ra (Active - Khóa chỉnh sửa)</option>
                  <option value="registration">Mở nhận đăng ký (Registration)</option>
                  <option value="draft">Bản nháp (Draft)</option>
                  <option value="ended">Đã kết thúc (Ended - Khóa chỉnh sửa)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                Mô tả
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                style={{ resize: 'vertical' }}
              />
            </div>

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
                  disabled={isLocked}
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
                  disabled={isLocked}
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
                  disabled={isLocked}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sport Rules */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Flame size={18} style={{ color: 'var(--color-warning)' }} /> Cấu hình môn & Giới hạn Pace
            </h2>
            {isLocked && (
              <span className="badge status-err" style={{ gap: '0.25rem' }}>
                <Lock size={12} /> Khóa quy tắc
              </span>
            )}
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
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleSport(sport.type)}
                        disabled={isLocked}
                        style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: isLocked ? 'not-allowed' : 'pointer' }}
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
                            disabled={isLocked}
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
                          disabled={isLocked}
                          className="input"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
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
                          disabled={isLocked}
                          className="input"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Link href="/admin/competitions" className="btn btn-secondary">
            Quay lại
          </Link>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </form>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: 420, width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Xác nhận xóa cuộc thi?</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Hành động này sẽ xóa dữ liệu cuộc thi này. Không thể khôi phục.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Hủy bỏ
              </button>
              <button onClick={handleDelete} className="btn" style={{ background: 'var(--color-danger)', color: '#fff' }}>
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
