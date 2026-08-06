'use client'

import { useState } from 'react'
import {
  Activity,
  Search,
  CheckCircle2,
  XCircle,
  Check,
  Ban,
  History,
  Lock,
  RefreshCw,
  Plus,
  Link2,
} from 'lucide-react'
import type { SportType } from '@/lib/supabase/types'
import { approveActivity as approveActivityAction, rejectActivity as rejectActivityAction, bulkApprove as bulkApproveAction, bulkReject as bulkRejectAction, manualSync as manualSyncAction } from '@/app/(admin)/admin/activities/actions'

type ActivityStatus = 'valid' | 'invalid' | 'suspicious'

export interface ActivityItem {
  id: string
  runner_name: string
  department_name: string
  activity_name: string
  sport_type: SportType
  distance_actual: number
  distance_converted: number
  pace_or_speed: string
  start_date: string
  status: ActivityStatus
  rejection_reason: string | null
  strava_activity_id: number
}

interface AuditLog {
  timestamp: string
  admin_name: string
  activity_id: string
  runner_name: string
  action: 'APPROVED' | 'REJECTED' | 'MANUAL_SYNC'
  reason: string
}

interface AdminActivitiesClientProps {
  activities: ActivityItem[]
  competitionId: string | null
}

export default function AdminActivitiesClient({
  activities: initialActivities,
  competitionId,
}: AdminActivitiesClientProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [stravaActivityIdInput, setStravaActivityIdInput] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState('')

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.runner_name.toLowerCase().includes(search.toLowerCase()) ||
      act.activity_name.toLowerCase().includes(search.toLowerCase()) ||
      act.department_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || act.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const allFilteredSelected =
    filteredActivities.length > 0 &&
    filteredActivities.every((act) => selectedIds.includes(act.id))

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredActivities.map((act) => act.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const bulkApprove = async () => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    await bulkApproveAction(selectedIds)
    setActivities((prev) =>
      prev.map((act) =>
        selectedIds.includes(act.id)
          ? { ...act, status: 'valid' as const, rejection_reason: null }
          : act
      )
    )
    const newLogs: AuditLog[] = selectedIds.map((id) => {
      const act = activities.find((a) => a.id === id)
      return { timestamp: now, admin_name: 'Admin', activity_id: id, runner_name: act?.runner_name || '', action: 'APPROVED' as const, reason: 'Phê duyệt hàng loạt bởi Admin' }
    })
    setAuditLogs((prev) => [...newLogs, ...prev])
    setSelectedIds([])
  }

  const bulkReject = async () => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    await bulkRejectAction(selectedIds, 'Từ chối bởi Quản trị viên (Hàng loạt)')
    setActivities((prev) =>
      prev.map((act) =>
        selectedIds.includes(act.id)
          ? { ...act, status: 'invalid' as const, rejection_reason: 'Từ chối bởi Quản trị viên (Hàng loạt)' }
          : act
      )
    )
    const newLogs: AuditLog[] = selectedIds.map((id) => {
      const act = activities.find((a) => a.id === id)
      return { timestamp: now, admin_name: 'Admin', activity_id: id, runner_name: act?.runner_name || '', action: 'REJECTED' as const, reason: 'Từ chối hàng loạt bởi Admin' }
    })
    setAuditLogs((prev) => [...newLogs, ...prev])
    setSelectedIds([])
  }

  const approveSingle = async (id: string) => {
    const target = activities.find((a) => a.id === id)
    if (!target) return

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    await approveActivityAction(id)
    setActivities((prev) =>
      prev.map((act) =>
        act.id === id ? { ...act, status: 'valid' as const, rejection_reason: null } : act
      )
    )
    setAuditLogs((prev) => [
      {
        timestamp: now,
        admin_name: 'Admin',
        activity_id: id,
        runner_name: target.runner_name,
        action: 'APPROVED' as const,
        reason: 'Xác nhận kết quả bài tập hợp lệ',
      },
      ...prev,
    ])
  }

  const openRejectModal = (id: string) => {
    setRejectingId(id)
    setRejectReason('Pace không hợp lệ / GPS nhiễu')
  }

  const confirmSingleReject = async () => {
    if (!rejectingId) return
    const target = activities.find((a) => a.id === rejectingId)
    const reasonText = rejectReason || 'Không đáp ứng thể lệ cuộc thi'
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)

    await rejectActivityAction(rejectingId, reasonText)
    setActivities((prev) =>
      prev.map((act) =>
        act.id === rejectingId
          ? { ...act, status: 'invalid' as const, rejection_reason: reasonText }
          : act
      )
    )

    if (target) {
      setAuditLogs((prev) => [
        {
          timestamp: now,
          admin_name: 'Admin',
          activity_id: rejectingId,
          runner_name: target.runner_name,
          action: 'REJECTED',
          reason: reasonText,
        },
        ...prev,
      ])
    }

    setRejectingId(null)
  }

  const handleManualSyncByStravaId = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stravaActivityIdInput.trim()) return

    setSyncing(true)
    setSyncSuccess('')

    try {
      const stravaId = parseInt(stravaActivityIdInput.replace(/[^0-9]/g, ''), 10)
      if (!stravaId) {
        setSyncSuccess('ID Strava không hợp lệ')
        setSyncing(false)
        return
      }

      const result = await manualSyncAction(stravaId)
      if (result.success) {
        setSyncSuccess(`Đã đồng bộ thành công bài tập Strava #${stravaId}!`)
        setTimeout(() => {
          setShowSyncModal(false)
          setSyncSuccess('')
          setStravaActivityIdInput('')
        }, 1500)
      } else {
        setSyncSuccess(result.error || 'Đồng bộ thất bại')
      }
    } catch {
      setSyncSuccess('Có lỗi xảy ra khi đồng bộ')
    }
    setSyncing(false)
  }

  const getSportBadge = (sport: SportType) => {
    switch (sport) {
      case 'Run':
        return <span className="badge badge-run">🏃 Run</span>
      case 'Walk':
        return <span className="badge badge-walk">🚶 Walk</span>
      case 'Ride':
        return <span className="badge badge-ride">🚴 Ride</span>
      case 'Swim':
        return <span className="badge badge-swim">🏊 Swim</span>
      default:
        return <span className="badge badge-neutral">{sport}</span>
    }
  }

  const getStatusPill = (status: ActivityStatus) => {
    switch (status) {
      case 'valid':
        return <span className="badge status-ok">✓ Hợp lệ</span>
      case 'suspicious':
        return <span className="badge badge-warning" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)', borderColor: 'var(--color-warning-border)' }}>⚠ Nghi vấn</span>
      case 'invalid':
        return <span className="badge status-err">✕ Từ chối</span>
      default:
        return null
    }
  }

  const counts = {
    all: activities.length,
    valid: activities.filter((a) => a.status === 'valid').length,
    suspicious: activities.filter((a) => a.status === 'suspicious').length,
    invalid: activities.filter((a) => a.status === 'invalid').length,
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem' }}>
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.3rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Activity size={14} /> Kiểm duyệt dữ liệu
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700 }}>Kiểm Duyệt & Đối Soát Khiếu Nại</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Rà soát cảnh báo vi phạm pace và hỗ trợ đối soát kéo bài tập bị thiếu qua Strava Activity ID.
          </p>
        </div>

        <button
          onClick={() => setShowSyncModal(true)}
          className="btn btn-primary"
          style={{ gap: '0.4rem' }}
        >
          <Plus size={16} /> Đồng bộ thủ công theo Strava ID
        </button>
      </div>

      {/* Audit Banner */}
      <div
        className="card admin-hide-mobile"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          background: 'var(--bg-subtle)',
          borderColor: 'var(--border-base)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
        }}
      >
        <Lock size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Quy trình xử lý khiếu nại mất bài tập:</strong> Nếu Webhook Strava bị sót bài, Admin nhập mã <em>Strava Activity ID</em> để hệ thống gọi Strava API kéo lại bài tập gốc, tính lại điểm và lưu Audit Log.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Tìm VĐV, bài tập, phòng ban..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ border: 'none', background: 'transparent', padding: '0.2rem 0', width: '100%', fontSize: '0.875rem' }}
          />
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.15rem', scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: `Tất cả (${counts.all})` },
            { id: 'suspicious', label: `Nghi vấn (${counts.suspicious})` },
            { id: 'valid', label: `Hợp lệ (${counts.valid})` },
            { id: 'invalid', label: `Từ chối (${counts.invalid})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`filter-pill ${statusFilter === tab.id ? 'active' : ''}`}
              style={{ fontSize: '0.775rem', padding: '0.3rem 0.75rem', whiteSpace: 'nowrap' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div
          className="card animate-fade-up"
          style={{
            padding: '0.85rem 1.25rem',
            marginBottom: '1rem',
            background: 'var(--color-primary-light)',
            borderColor: 'var(--color-primary-ring)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
            Đã chọn <strong>{selectedIds.length}</strong> bài tập
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={bulkApprove} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
              <CheckCircle2 size={15} /> Phê duyệt hàng loạt
            </button>
            <button
              onClick={bulkReject}
              className="btn btn-sm"
              style={{
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                borderColor: 'var(--color-danger-border)',
                gap: '0.35rem',
              }}
            >
              <XCircle size={15} /> Từ chối hàng loạt
            </button>
          </div>
        </div>
      )}

      {/* Activities Table */}
      <div className="table-wrapper" style={{ marginBottom: '2.5rem' }}>
        <div className="desktop-table-view">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
              </th>
              <th>Vận động viên</th>
              <th>Tên bài tập & Môn</th>
              <th style={{ textAlign: 'right' }}>Thực tế</th>
              <th style={{ textAlign: 'right' }}>Quy đổi</th>
              <th style={{ textAlign: 'center' }}>Pace / Speed</th>
              <th style={{ textAlign: 'center' }}>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)' }}>
                  Không tìm thấy bài tập nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredActivities.map((act) => {
                const isSelected = selectedIds.includes(act.id)
                return (
                  <tr
                    key={act.id}
                    style={{
                      background: isSelected ? 'var(--color-primary-light)' : undefined,
                    }}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(act.id)}
                        style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                      />
                    </td>

                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.runner_name}</div>
                        <span className="badge badge-neutral" style={{ fontSize: '0.75rem', marginTop: '0.1rem' }}>
                          {act.department_name}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <a
                          href={`https://www.strava.com/activities/${act.strava_activity_id || act.id.replace('act-', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Xem chi tiết trên ứng dụng Strava"
                        >
                          {act.activity_name} ↗
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                          {getSportBadge(act.sport_type)}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{act.start_date}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                      {act.distance_actual.toFixed(1)} km
                    </td>

                    <td
                      style={{
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                      }}
                    >
                      {act.distance_converted.toFixed(1)} km
                    </td>

                    <td style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>
                      {act.pace_or_speed}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                        {getStatusPill(act.status)}
                        {act.rejection_reason && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-danger)',
                              maxWidth: 180,
                              whiteSpace: 'normal',
                              textAlign: 'center',
                            }}
                          >
                            {act.rejection_reason}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        {act.status !== 'valid' && (
                          <button
                            onClick={() => approveSingle(act.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--color-success)', gap: '0.25rem' }}
                            title="Duyệt bài này"
                          >
                            <Check size={14} /> <span className="hide-mobile">Duyệt</span>
                          </button>
                        )}

                        {act.status !== 'invalid' && (
                          <button
                            onClick={() => openRejectModal(act.id)}
                            className="btn btn-sm"
                            style={{
                              background: 'var(--color-danger-bg)',
                              color: 'var(--color-danger)',
                              borderColor: 'var(--color-danger-border)',
                              gap: '0.25rem',
                            }}
                            title="Từ chối bài này"
                          >
                            <Ban size={14} /> <span className="hide-mobile">Từ chối</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-card-view">
          {filteredActivities.length === 0 ? (
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
              Không tìm thấy bài tập nào phù hợp.
            </div>
          ) : (
            filteredActivities.map((act) => {
              const isSelected = selectedIds.includes(act.id)
              const sportBorderMap: Record<SportType, string> = {
                Run: 'var(--sport-run)',
                Ride: 'var(--sport-ride)',
                Swim: 'var(--sport-swim)',
                Walk: 'var(--sport-walk)',
              }
              return (
                <div
                  key={act.id}
                  className="card"
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderLeft: `3px solid ${sportBorderMap[act.sport_type] || 'var(--border-base)'}`,
                    background: isSelected ? 'var(--color-primary-light)' : 'var(--bg-elevated)',
                    marginBottom: '0.35rem',
                  }}
                >
                  {/* Top row: Checkbox + Runner + Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(act.id)}
                        style={{ width: 14, height: 14, accentColor: 'var(--color-primary)', cursor: 'pointer', flexShrink: 0 }}
                      />
                      <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.runner_name}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '0.05rem 0.3rem', flexShrink: 0 }}>{act.department_name}</span>
                    </div>
                    {getStatusPill(act.status)}
                  </div>

                  {/* Activity info & Metrics */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                      {act.activity_name}
                    </span>
                    <span>
                      <strong style={{ color: 'var(--color-primary)' }}>{act.distance_converted.toFixed(1)} km</strong> · Pace: {act.pace_or_speed}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <a
                      href={`https://www.strava.com/activities/${act.strava_activity_id || act.id.replace('act-', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.2rem', padding: '0.2rem 0.4rem', fontSize: '0.725rem', flex: 1, justifyContent: 'center' }}
                    >
                      Strava ↗
                    </a>
                    {act.status !== 'valid' && (
                      <button
                        onClick={() => approveSingle(act.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-success)', gap: '0.2rem', padding: '0.2rem 0.4rem', fontSize: '0.725rem', flex: 1, justifyContent: 'center' }}
                      >
                        <Check size={12} /> Duyệt
                      </button>
                    )}
                    {act.status !== 'invalid' && (
                      <button
                        onClick={() => openRejectModal(act.id)}
                        className="btn btn-sm"
                        style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)', gap: '0.2rem', padding: '0.2rem 0.4rem', fontSize: '0.725rem', flex: 1, justifyContent: 'center' }}
                      >
                        <Ban size={12} /> Từ chối
                      </button>
                    )}
                  </div>

                  {/* Rejection reason */}
                  {act.rejection_reason && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-danger)',
                        padding: '0.4rem 0.5rem',
                        background: 'var(--color-danger-bg)',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '3px solid var(--color-danger)',
                      }}
                    >
                      {act.rejection_reason}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Audit Trail Log History */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <History size={18} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Nhật Ký Thao Tác (Audit Trail)</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {auditLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className={`badge ${log.action === 'APPROVED' ? 'status-ok' : log.action === 'MANUAL_SYNC' ? 'badge-blue' : 'status-err'}`}>
                  {log.action}
                </span>
                <div>
                  <strong>{log.runner_name}</strong> (ID: {log.activity_id})
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                    Nội dung: {log.reason}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                Thực hiện bởi: {log.admin_name} · {log.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Sync Modal */}
      {showSyncModal && (
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
          <div className="card" style={{ maxWidth: 460, width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Link2 size={18} style={{ color: 'var(--color-primary)' }} /> Kéo bài tập bị sót từ Strava ID
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Nhập mã bài tập Strava (ID hoặc Link bài tập trên ứng dụng Strava) của VĐV gửi khiếu nại để kéo dữ liệu về đối soát:
            </p>

            <form onSubmit={handleManualSyncByStravaId} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Strava Activity ID / Link bài tập
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: 9876543210 hoặc https://www.strava.com/activities/9876543210"
                  value={stravaActivityIdInput}
                  onChange={(e) => setStravaActivityIdInput(e.target.value)}
                  className="input"
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                  Hệ thống sẽ tự động xác định vận động viên từ Strava Activity ID.
                </p>
              </div>

              {syncSuccess && (
                <div style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ {syncSuccess}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowSyncModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" disabled={syncing} className="btn btn-primary" style={{ gap: '0.4rem' }}>
                  <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Đang kéo Strava...' : 'Lấy bài tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingId && (
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Từ chối bài tập</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Vui lòng cung cấp lý do hủy kết quả bài tập này để lưu vào nhật ký audit và thông báo cho vận động viên:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input"
              style={{ marginBottom: '1.25rem', resize: 'vertical' }}
              placeholder="VD: Pace quá nhanh không hợp lệ..."
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectingId(null)} className="btn btn-secondary">
                Hủy
              </button>
              <button
                onClick={confirmSingleReject}
                className="btn"
                style={{ background: 'var(--color-danger)', color: '#fff' }}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
