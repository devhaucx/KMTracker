'use client'

import { useState } from 'react'
import {
  Users,
  Search,
  Filter,
  Building2,
  CheckCircle2,
  X,
  Check,
  UserCheck,
  Mail,
  ExternalLink,
  UserX,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import { assignDepartment, withdrawUser, restoreUser } from '@/app/(admin)/admin/users/actions'

export interface AdminUserItem {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  department_id: string | null
  department_name: string | null
  department_color?: string | null
  role: string
  strava_athlete_id: number | null
  created_at: string
  total_km: number
  activity_count: number
  status: 'active' | 'withdrawn'
}

export interface AdminDepartment {
  id: string
  name: string
  code: string
  color: string
}

interface Props {
  users: AdminUserItem[]
  departments: AdminDepartment[]
}

export default function AdminUsersClient({ users: initialUsers, departments }: Props) {
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'withdrawn'>('all')

  const [toastMsg, setToastMsg] = useState('')

  const [assignUser, setAssignUser] = useState<AdminUserItem | null>(null)
  const [newDeptId, setNewDeptId] = useState<string>('')
  const [assignSuccess, setAssignSuccess] = useState(false)

  const [removeUserTarget, setRemoveUserTarget] = useState<AdminUserItem | null>(null)

  const openAssignModal = (user: AdminUserItem) => {
    setAssignUser(user)
    setNewDeptId(user.department_id || '')
    setAssignSuccess(false)
  }

  const handleAssignSave = async () => {
    if (!assignUser) return
    const deptObj = departments.find((d) => d.id === newDeptId)

    const result = await assignDepartment(assignUser.id, newDeptId)
    if (result?.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === assignUser.id
            ? {
                ...u,
                department_id: newDeptId || null,
                department_name: deptObj ? deptObj.name : null,
              }
            : u
        )
      )
    }

    setAssignSuccess(true)
    setTimeout(() => {
      setAssignSuccess(false)
      setAssignUser(null)
    }, 1000)
  }

  const handleConfirmRemoveUser = async () => {
    if (!removeUserTarget) return
    const result = await withdrawUser(removeUserTarget.id)
    if (result?.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === removeUserTarget.id ? { ...u, status: 'withdrawn' } : u))
      )
      setToastMsg(`Đã tạm gỡ VĐV ${removeUserTarget.full_name} khỏi giải đấu.`)
      setTimeout(() => setToastMsg(''), 4000)
    }
    setRemoveUserTarget(null)
  }

  const handleRestoreUser = async (user: AdminUserItem) => {
    const result = await restoreUser(user.id)
    if (result?.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: 'active' } : u))
      )
      setToastMsg(
        `↺ Đã khôi phục tài khoản ${user.full_name}! Toàn bộ dữ liệu bài tập và KM từ Strava đã được tự động tính toán & trả lại cho VĐV.`
      )
      setTimeout(() => setToastMsg(''), 5000)
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.strava_athlete_id && String(u.strava_athlete_id).includes(search))
    const matchesDept = selectedDeptFilter === 'all' || u.department_id === selectedDeptFilter
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter
    return matchesSearch && matchesDept && matchesStatus
  })

  const activeUsersCount = users.filter((u) => u.status === 'active').length
  const withdrawnUsersCount = users.filter((u) => u.status === 'withdrawn').length
  const stravaConnectedCount = users.filter((u) => u.strava_athlete_id).length

  return (
    <div className="container" style={{ padding: '1.25rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <div>
          <h1 className="hide-mobile" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Danh Sách Người Dùng & VĐV</h1>
          <p className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.15rem' }}>
            Quản lý thông tin VĐV, gán phòng ban, đối soát Strava ID và xử lý khiếu nại.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            background: 'var(--color-primary-light)',
            borderColor: 'var(--color-primary-ring)',
            color: 'var(--color-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      <div
        className="stats-grid-mobile"
        style={{ marginBottom: '1.25rem' }}
      >
        <div className="stat-card">
          <div className="stat-label">VĐV đang thi đấu</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {activeUsersCount}
          </div>
          <div className="stat-sub">hợp lệ trên bảng xếp hạng</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">VĐV đã gỡ / Tạm hoãn</div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>
            {withdrawnUsersCount}
          </div>
          <div className="stat-sub">chờ đối soát khiếu nại</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Đã kết nối Strava ID</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {stravaConnectedCount}
          </div>
          <div className="stat-sub">sẵn sàng đối soát thông tin</div>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 240 }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc mã Strava ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ border: 'none', background: 'transparent', padding: '0.25rem 0' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'active', label: `Đang tham gia (${activeUsersCount})` },
            { id: 'withdrawn', label: `Đã loại / Khiếu nại (${withdrawnUsersCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`filter-pill ${statusFilter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} style={{ color: 'var(--text-tertiary)' }} />
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="input"
            style={{ width: 'auto', minWidth: 160, cursor: 'pointer' }}
          >
            <option value="all">Tất cả phòng ban</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="desktop-table-view">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Họ và Tên &amp; Email</th>
                <th>Phòng ban</th>
                <th style={{ textAlign: 'center' }}>Strava Athlete Profile</th>
                <th style={{ textAlign: 'center' }}>Trạng thái giải</th>
                <th style={{ textAlign: 'right' }}>KM quy đổi</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)' }}>
                    Không tìm thấy vận động viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const dept = departments.find((d) => d.id === u.department_id)
                  const isWithdrawn = u.status === 'withdrawn'
                  return (
                    <tr key={u.id} style={isWithdrawn ? { opacity: 0.6, background: 'var(--bg-subtle)' } : {}}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: isWithdrawn ? 'var(--text-tertiary)' : 'var(--color-primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              flexShrink: 0,
                            }}
                          >
                            {u.full_name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: isWithdrawn ? 'line-through' : 'none' }}>
                              {u.full_name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Mail size={12} /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        {dept ? (
                          <span
                            className="badge"
                            style={{
                              background: `${dept.color}15`,
                              color: dept.color,
                              borderColor: `${dept.color}40`,
                            }}
                          >
                            <Building2 size={12} /> {dept.name}
                          </span>
                        ) : (
                          <span className="badge badge-neutral" style={{ fontStyle: 'italic' }}>
                            Chưa gán
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {u.strava_athlete_id ? (
                          <a
                            href={`https://www.strava.com/athletes/${u.strava_athlete_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="badge status-ok"
                            style={{ gap: '0.3rem', padding: '0.3rem 0.6rem', textDecoration: 'none' }}
                            title="Bấm để mở trực tiếp hồ sơ Strava để đối chiếu"
                          >
                            <CheckCircle2 size={13} /> Strava ID #{u.strava_athlete_id} <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="badge badge-neutral">Chưa nối Strava</span>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {isWithdrawn ? (
                          <span className="badge status-err">⚠ Đã loại / Khiếu nại</span>
                        ) : (
                          <span className="badge status-ok">✓ Đang tham gia</span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 700, color: isWithdrawn ? 'var(--text-tertiary)' : 'var(--color-primary)' }}>
                        {u.total_km.toFixed(1)} km
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            onClick={() => openAssignModal(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: '0.25rem' }}
                            title="Phân gán phòng ban đại diện"
                          >
                            <UserCheck size={14} /> <span className="hide-mobile">Phòng ban</span>
                          </button>

                          {isWithdrawn ? (
                            <button
                              onClick={() => handleRestoreUser(u)}
                              className="btn btn-primary btn-sm"
                              style={{ gap: '0.25rem', background: '#10B981', borderColor: '#10B981' }}
                              title="Khôi phục VĐV vào lại giải đấu & tự đồng bộ lại bài tập"
                            >
                              <RotateCcw size={14} /> <span className="hide-mobile">Khôi phục</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setRemoveUserTarget(u)}
                              className="btn btn-sm"
                              style={{
                                background: 'var(--color-danger-bg)',
                                color: 'var(--color-danger)',
                                borderColor: 'var(--color-danger-border)',
                                gap: '0.25rem',
                              }}
                              title="Loại VĐV này khỏi cuộc thi"
                            >
                              <UserX size={14} /> <span className="hide-mobile">Loại khỏi giải</span>
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
      </div>

      {/* Mobile card view */}
      <div className="mobile-card-view">
        {filteredUsers.length === 0 ? (
          <div className="card" style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Không tìm thấy vận động viên nào phù hợp.
          </div>
        ) : (
          filteredUsers.map((u) => {
            const dept = departments.find((d) => d.id === u.department_id)
            const isWithdrawn = u.status === 'withdrawn'
            return (
              <div key={u.id} className="card" style={{ padding: '1rem 1.25rem', opacity: isWithdrawn ? 0.7 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: isWithdrawn ? 'var(--text-tertiary)' : 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                    {u.full_name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: isWithdrawn ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  </div>
                  {isWithdrawn
                    ? <span className="badge status-err" style={{ fontSize: '0.7rem', flexShrink: 0 }}>Đã loại</span>
                    : <span className="badge status-ok" style={{ fontSize: '0.7rem', flexShrink: 0 }}>Tham gia</span>}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {dept ? (
                    <span className="badge" style={{ background: `${dept.color}15`, color: dept.color, borderColor: `${dept.color}40`, fontSize: '0.7rem' }}>
                      <Building2 size={11} /> {dept.name}
                    </span>
                  ) : (
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem', fontStyle: 'italic' }}>Chưa gán</span>
                  )}
                  {u.strava_athlete_id ? (
                    <a href={`https://www.strava.com/athletes/${u.strava_athlete_id}`} target="_blank" rel="noopener noreferrer" className="badge status-ok" style={{ gap: '0.25rem', fontSize: '0.7rem', textDecoration: 'none' }}>
                      <CheckCircle2 size={11} /> #{u.strava_athlete_id}
                    </a>
                  ) : null}
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isWithdrawn ? 'var(--text-tertiary)' : 'var(--color-primary)', marginLeft: 'auto' }}>
                    {u.total_km.toFixed(1)} km
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openAssignModal(u)} className="btn btn-secondary btn-sm" style={{ gap: '0.25rem', flex: 1 }}>
                    <UserCheck size={14} /> Phòng ban
                  </button>
                  {isWithdrawn ? (
                    <button onClick={() => handleRestoreUser(u)} className="btn btn-sm" style={{ gap: '0.25rem', flex: 1, background: '#10B981', color: '#fff', borderColor: '#10B981' }}>
                      <RotateCcw size={14} /> Khôi phục
                    </button>
                  ) : (
                    <button onClick={() => setRemoveUserTarget(u)} className="btn btn-sm" style={{ gap: '0.25rem', flex: 1, background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)' }}>
                      <UserX size={14} /> Loại
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {removeUserTarget && (
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Loại VĐV khỏi cuộc thi?</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Tài khoản <strong>{removeUserTarget.full_name}</strong> (Strava ID: #{removeUserTarget.strava_athlete_id}) sẽ bị tạm ẩn khỏi bảng xếp hạng. Bạn có thể <strong>khôi phục lại bất kỳ lúc nào</strong> nếu khiếu nại đúng.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setRemoveUserTarget(null)} className="btn btn-secondary">
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRemoveUser}
                className="btn"
                style={{ background: 'var(--color-danger)', color: '#fff' }}
              >
                Loại khỏi giải
              </button>
            </div>
          </div>
        </div>
      )}

      {assignUser && (
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
          <div className="card" style={{ maxWidth: 440, width: '100%', padding: '1.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Gán Phòng Ban Cho VĐV</h3>
              <button
                onClick={() => setAssignUser(null)}
                className="btn btn-ghost btn-icon btn-sm"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-subtle)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{assignUser.full_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{assignUser.email}</div>
            </div>

            {assignSuccess ? (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                }}
              >
                <Check size={18} /> Đã cập nhật phòng ban thành công!
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  Chọn phòng ban làm việc:
                </label>
                <select
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                  className="input"
                  style={{ marginBottom: '1.5rem', cursor: 'pointer' }}
                >
                  <option value="">-- Chưa gán phòng ban --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setAssignUser(null)} className="btn btn-secondary">
                    Hủy bỏ
                  </button>
                  <button onClick={handleAssignSave} className="btn btn-primary" style={{ gap: '0.35rem' }}>
                    <Check size={16} /> Lưu phòng ban
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
