'use client'

import { useState } from 'react'
import {
  Building2,
  Plus,
  Search,
  Edit3,
  Trash2,
  Users,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'
import { createDepartment, updateDepartment, deleteDepartment } from '@/app/(admin)/admin/departments/actions'

export interface DepartmentItem {
  id: string
  name: string
  code: string
  color: string
  memberCount: number
}

const PRESET_COLORS = [
  '#2563EB',
  '#7C3AED',
  '#D97706',
  '#16A34A',
  '#DC2626',
  '#06B6D4',
  '#EC4899',
  '#64748B',
]

export default function AdminDepartmentsClient({ departments: initialDepartments }: { departments: DepartmentItem[] }) {
  const [departments, setDepartments] = useState<DepartmentItem[]>(initialDepartments)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null)
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formColor, setFormColor] = useState('#2563EB')

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const openCreateModal = () => {
    setEditingDept(null)
    setFormName('')
    setFormCode('')
    setFormColor('#2563EB')
    setModalOpen(true)
  }

  const openEditModal = (dept: DepartmentItem) => {
    setEditingDept(dept)
    setFormName(dept.name)
    setFormCode(dept.code)
    setFormColor(dept.color)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formCode.trim()) return

    if (editingDept) {
      const result = await updateDepartment(editingDept.id, formName, formCode, formColor)
      if (result?.success) {
        setDepartments((prev) =>
          prev.map((d) =>
            d.id === editingDept.id
              ? { ...d, name: formName.trim(), code: formCode.trim().toUpperCase(), color: formColor }
              : d
          )
        )
      }
    } else {
      const result = await createDepartment(formName, formCode, formColor)
      if (result?.success) {
        const newDept: DepartmentItem = {
          id: `d-${Date.now()}`,
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          color: formColor,
          memberCount: 0,
        }
        setDepartments((prev) => [...prev, newDept])
      }
    }

    setModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    const result = await deleteDepartment(id)
    if (result?.success) {
      setDepartments((prev) => prev.filter((d) => d.id !== id))
    }
    setDeleteConfirmId(null)
  }

  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container" style={{ padding: '1.25rem 1.25rem 4rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h1 className="hide-mobile" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Danh Sách Phòng Ban</h1>
          <p className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.15rem' }}>
            Quản lý tên phòng ban, mã đơn vị và màu sắc nhận diện trên bảng xếp hạng.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary btn-sm mobile-full-width" style={{ gap: '0.35rem' }}>
          <Plus size={15} /> Thêm phòng ban mới
        </button>
      </div>

      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          placeholder="Tìm phòng ban theo tên hoặc mã code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ border: 'none', background: 'transparent', padding: '0.25rem 0' }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="card"
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: dept.color,
              }}
            />

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: `${dept.color}15`,
                      border: `2px solid ${dept.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={16} style={{ color: dept.color }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {dept.name}
                    </h3>
                  </div>
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-base)',
                    color: dept.color,
                  }}
                >
                  {dept.code}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem',
                }}
              >
                <Users size={14} style={{ color: 'var(--text-tertiary)' }} />
                <span>
                  <strong>{dept.memberCount}</strong> thành viên
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                marginTop: '1.25rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <button
                onClick={() => openEditModal(dept)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.3rem' }}
              >
                <Edit3 size={13} /> Sửa
              </button>
              <button
                onClick={() => setDeleteConfirmId(dept.id)}
                className="btn btn-sm"
                style={{
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  borderColor: 'var(--color-danger-border)',
                  padding: '0.3rem 0.5rem',
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
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
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {editingDept ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-ghost btn-icon btn-sm"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Tên phòng ban <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: IT & Công Nghệ"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Mã viết tắt (Code) <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: IT"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="input"
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Màu đại diện
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: c,
                        border: formColor === c ? '2px solid var(--text-primary)' : 'none',
                        cursor: 'pointer',
                        transform: formColor === c ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    style={{ width: 36, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="input"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}>
                  <Check size={16} /> {editingDept ? 'Lưu cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          <div className="card" style={{ maxWidth: 400, width: '100%', padding: '1.75rem' }}>
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Xóa phòng ban?</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Hành động này sẽ xóa phòng ban khỏi hệ thống. Các nhân viên thuộc phòng này sẽ cần gán phòng mới.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary">
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn"
                style={{ background: 'var(--color-danger)', color: '#fff' }}
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
