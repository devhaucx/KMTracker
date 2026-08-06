'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Trophy,
  Plus,
  Search,
  Copy,
  Check,
  Edit3,
  Trash2,
  Power,
  Calendar,
  Users,
  AlertCircle,
} from 'lucide-react'
import type { Competition, CompetitionStatus } from '@/lib/supabase/types'
import { toggleCompetitionStatus, deleteCompetition as deleteCompetitionAction } from '@/app/(admin)/admin/competitions/actions'

interface CompetitionItem {
  id: string
  name: string
  invite_code: string
  description: string | null
  start_date: string
  end_date: string
  registration_deadline: string
  status: CompetitionStatus
  participant_count: number
  sports: string[]
  created_at: string
  is_deleted?: boolean
  deleted_at?: string | null
}

export default function AdminCompetitionsClient({ competitions }: { competitions: Competition[] }) {
  const [compItems, setCompItems] = useState<CompetitionItem[]>(
    competitions.map((c) => ({
      id: c.id,
      name: c.name,
      invite_code: c.invite_code,
      description: c.description,
      start_date: c.start_date,
      end_date: c.end_date,
      registration_deadline: c.registration_deadline,
      status: c.status,
      participant_count: 0,
      sports: [],
      created_at: c.created_at,
      is_deleted: c.is_deleted,
      deleted_at: c.deleted_at,
    }))
  )
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | CompetitionStatus>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleStatus = async (id: string) => {
    const result = await toggleCompetitionStatus(id)
    if (result?.success) {
      setCompItems((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const newStatus: CompetitionStatus = c.status === 'active' ? 'draft' : 'active'
            return { ...c, status: newStatus }
          }
          return c
        })
      )
    }
  }

  const deleteCompetition = async (id: string) => {
    const result = await deleteCompetitionAction(id)
    if (result?.success) {
      setCompItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_deleted: true, deleted_at: new Date().toISOString() } : c))
      )
    }
    setDeleteConfirmId(null)
  }

  const filteredCompetitions = compItems.filter((comp) => {
    if (comp.is_deleted) return false
    const matchesSearch =
      comp.name.toLowerCase().includes(search.toLowerCase()) ||
      comp.invite_code.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: CompetitionStatus) => {
    switch (status) {
      case 'active':
        return <span className="badge status-ok">● Đang diễn ra</span>
      case 'registration':
        return <span className="badge badge-blue">● Đang nhận ĐK</span>
      case 'draft':
        return <span className="badge badge-neutral">● Bản nháp</span>
      case 'ended':
        return <span className="badge status-err">● Đã kết thúc</span>
      default:
        return <span className="badge badge-neutral">{status}</span>
    }
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
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
            <Trophy size={14} /> Quản lý giải đấu
          </div>
          <h1 className="hide-mobile" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Danh Sách Cuộc Thi</h1>
          <p className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.15rem' }}>
            Tạo mới, thiết lập quy tắc tính điểm và theo dõi trạng thái các cuộc thi trong doanh nghiệp.
          </p>
        </div>

        <Link href="/admin/competitions/new" className="btn btn-primary btn-sm mobile-full-width" style={{ gap: '0.35rem' }}>
          <Plus size={15} /> Tạo cuộc thi mới
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card mobile-stack"
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
            placeholder="Tìm theo tên cuộc thi hoặc mã mời..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ border: 'none', background: 'transparent', padding: '0.25rem 0' }}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'active', label: 'Đang diễn ra' },
            { id: 'registration', label: 'Mở đăng ký' },
            { id: 'draft', label: 'Bản nháp' },
            { id: 'ended', label: 'Đã kết thúc' },
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
      </div>

      {/* Competitions Table */}
      <div className="table-wrapper">
        <div className="desktop-table-view">
        <table className="table">
          <thead>
            <tr>
              <th>Tên cuộc thi</th>
              <th style={{ textAlign: 'center' }}>Mã mời (Invite Code)</th>
              <th style={{ textAlign: 'center' }}>Trạng thái</th>
              <th>Thời gian</th>
              <th style={{ textAlign: 'center' }}>Vận động viên</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompetitions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)' }}>
                  Không tìm thấy cuộc thi nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredCompetitions.map((comp) => (
                <tr key={comp.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {comp.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                        {comp.description}
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-base)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                      }}
                    >
                      {comp.invite_code}
                      <button
                        onClick={() => copyCode(comp.id, comp.invite_code)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}
                        title="Copy mã mời"
                      >
                        {copiedId === comp.id ? (
                          <Check size={13} style={{ color: 'var(--color-success)' }} />
                        ) : (
                          <Copy size={13} style={{ color: 'var(--text-tertiary)' }} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{getStatusBadge(comp.status)}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} style={{ color: 'var(--text-tertiary)' }} />
                      <span>
                        {comp.start_date} → {comp.end_date}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      <Users size={14} style={{ color: 'var(--text-tertiary)' }} />
                      {comp.participant_count}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        onClick={() => toggleStatus(comp.id)}
                        className={`btn btn-sm ${comp.status === 'active' ? 'btn-ghost' : 'btn-secondary'}`}
                        title={comp.status === 'active' ? 'Tắt cuộc thi' : 'Bật kích hoạt cuộc thi'}
                        style={{
                          color: comp.status === 'active' ? 'var(--color-success)' : 'var(--text-secondary)',
                        }}
                      >
                        <Power size={14} />
                        <span className="hide-mobile">{comp.status === 'active' ? 'Hoạt động' : 'Tối màu'}</span>
                      </button>

                      <Link href={`/admin/competitions/${comp.id}`} className="btn btn-secondary btn-sm" title="Chỉnh sửa">
                        <Edit3 size={14} />
                        <span className="hide-mobile">Sửa</span>
                      </Link>

                      <button
                        onClick={() => setDeleteConfirmId(comp.id)}
                        className="btn btn-sm"
                        style={{
                          background: 'var(--color-danger-bg)',
                          color: 'var(--color-danger)',
                          borderColor: 'var(--color-danger-border)',
                        }}
                        title="Xóa cuộc thi"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-card-view">
          {filteredCompetitions.length === 0 ? (
            <div className="card" style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              Không tìm thấy cuộc thi nào phù hợp.
            </div>
          ) : (
            filteredCompetitions.map((comp) => (
              <div key={comp.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                {/* Row 1: Name + Status badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{comp.name}</div>
                    {comp.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>{comp.description}</div>
                    )}
                  </div>
                  {getStatusBadge(comp.status)}
                </div>

                {/* Row 2: Invite code with copy button */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-base)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                    }}
                  >
                    {comp.invite_code}
                    <button
                      onClick={() => copyCode(comp.id, comp.invite_code)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}
                      title="Copy mã mời"
                    >
                      {copiedId === comp.id ? (
                        <Check size={13} style={{ color: 'var(--color-success)' }} />
                      ) : (
                        <Copy size={13} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Row 3: Date range with Calendar icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <Calendar size={13} style={{ color: 'var(--text-tertiary)' }} />
                  <span>{comp.start_date} → {comp.end_date}</span>
                </div>

                {/* Row 4: Participant count with Users icon */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  <Users size={14} style={{ color: 'var(--text-tertiary)' }} />
                  {comp.participant_count}
                </div>

                {/* Row 5: Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={() => toggleStatus(comp.id)}
                    className={`btn btn-sm ${comp.status === 'active' ? 'btn-ghost' : 'btn-secondary'}`}
                    title={comp.status === 'active' ? 'Tắt cuộc thi' : 'Bật kích hoạt cuộc thi'}
                    style={{
                      color: comp.status === 'active' ? 'var(--color-success)' : 'var(--text-secondary)',
                    }}
                  >
                    <Power size={14} />
                    <span>{comp.status === 'active' ? 'Hoạt động' : 'Tối màu'}</span>
                  </button>

                  <Link href={`/admin/competitions/${comp.id}`} className="btn btn-secondary btn-sm" title="Chỉnh sửa">
                    <Edit3 size={14} />
                    <span>Sửa</span>
                  </Link>

                  <button
                    onClick={() => setDeleteConfirmId(comp.id)}
                    className="btn btn-sm"
                    style={{
                      background: 'var(--color-danger-bg)',
                      color: 'var(--color-danger)',
                      borderColor: 'var(--color-danger-border)',
                    }}
                    title="Xóa cuộc thi"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
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
                  Cuộc thi sẽ bị ẩn khỏi giao diện. <strong>Dữ liệu vẫn được lưu trữ an toàn trong Database (`is_deleted = true`)</strong> để chống thất thoát bài tập và đối soát khi tài khoản Admin bị thao túng.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary">
                Hủy bỏ
              </button>
              <button
                onClick={() => deleteCompetition(deleteConfirmId)}
                className="btn"
                style={{ background: 'var(--color-danger)', color: '#fff' }}
              >
                Xác nhận Ẩn (Soft Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
