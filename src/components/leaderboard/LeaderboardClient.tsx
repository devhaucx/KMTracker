'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, TrendingUp, Search, Flame, Target, Trophy, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import Podium from '@/components/leaderboard/Podium'
import SportFilter from '@/components/leaderboard/SportFilter'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'
import type { IndividualLeaderboardEntry, DepartmentLeaderboardEntry } from '@/lib/supabase/types'

const PAGE_SIZE = 5

interface Props {
  individual: IndividualLeaderboardEntry[]
  department: DepartmentLeaderboardEntry[]
  totalKm: number
  currentUserId?: string
  competitionName?: string
}

export default function LeaderboardClient({ individual, department, totalKm, currentUserId, competitionName }: Props) {
  const [tab, setTab]         = useState<'individual' | 'department'>('individual')
  const [sport, setSport]     = useState('ALL')
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [spinning, setSpinning] = useState(false)

  const filteredIndividual = useMemo(() => {
    return individual.filter(item => {
      const matchSport = sport === 'ALL' || item.sport_type === sport
      const matchSearch = search.trim() === '' ||
        item.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (item.department_name && item.department_name.toLowerCase().includes(search.toLowerCase()))
      return matchSport && matchSearch
    })
  }, [individual, sport, search])

  const filteredDepartment = useMemo(() => {
    return department.filter(item => {
      return search.trim() === '' ||
        item.department_name.toLowerCase().includes(search.toLowerCase()) ||
        item.department_code.toLowerCase().includes(search.toLowerCase())
    })
  }, [department, search])

  const totalEntries = tab === 'individual' ? filteredIndividual.length : filteredDepartment.length
  const totalPages   = Math.ceil(totalEntries / PAGE_SIZE) || 1

  const paginatedIndividual = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredIndividual.slice(start, start + PAGE_SIZE)
  }, [filteredIndividual, page])

  const paginatedDepartment = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredDepartment.slice(start, start + PAGE_SIZE)
  }, [filteredDepartment, page])

  const myEntry = useMemo(() => {
    if (!currentUserId) return null
    // Aggregate across all sports for the user's overall rank
    const myEntries = individual.filter(i => i.user_id === currentUserId)
    if (myEntries.length === 0) return null
    return myEntries.reduce((best, e) => e.overall_rank < best.overall_rank ? e : best)
  }, [individual, currentUserId])

  const totalParticipants = useMemo(() => {
    return new Set(individual.map(i => i.user_id)).size
  }, [individual])

  const refresh = () => { setSpinning(true); setTimeout(() => { setSpinning(false); window.location.reload() }, 600) }

  const handleSportChange = (s: string) => { setSport(s); setPage(1) }
  const handleTabChange = (t: 'individual' | 'department') => { setTab(t); setPage(1) }

  return (
    <div className="container" style={{ padding: '0.75rem 0.75rem 4rem' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Live Ranking</span>
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>{competitionName || 'Bảng Xếp Hạng'}</h1>
          <p className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
            Cập nhật tự động 60s/lần · Đấu cá nhân &amp; Thi đua phòng ban
          </p>
        </div>
        <button onClick={refresh} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
          <RefreshCw size={14} className={spinning ? 'animate-spin' : ''} /> <span className="hide-mobile">Làm mới</span>
        </button>
      </div>

      <div className="card" style={{
        padding: '1.25rem', marginBottom: '1.25rem',
        background: 'linear-gradient(135deg, var(--bg-base) 0%, var(--color-primary-light) 100%)',
        borderColor: 'var(--color-primary-ring)', boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Target size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              {totalKm.toFixed(1)} KM Quy Đổi
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {totalParticipants} vận động viên
            </div>
          </div>
        </div>
      </div>

      {myEntry && tab === 'individual' && (
        <div style={{
          background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-ring)',
          borderRadius: 'var(--radius-xl)', padding: '0.875rem 1.25rem', marginBottom: '1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem'
            }}>
              #{myEntry.overall_rank}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Hạng của bạn hiện tại
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {myEntry.full_name} ({myEntry.department_name})
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Đóng góp</div>
              <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                {myEntry.total_converted_km.toFixed(1)} km
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'individual' && sport === 'ALL' && !search && individual.length >= 3 && (
        <Podium topThree={individual.slice(0, 3)} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="mobile-stack" style={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <SportFilter activeSport={sport} onSportChange={handleSportChange} activeTab={tab} onTabChange={handleTabChange} />
          <div className="mobile-full-width" style={{ position: 'relative', minWidth: 220, flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder={tab === 'individual' ? "Tìm VĐV, phòng ban..." : "Tìm phòng ban..."}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input"
              style={{ paddingLeft: '2.1rem', paddingRight: '0.75rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      <LeaderboardTable type={tab} individualEntries={paginatedIndividual} departmentEntries={paginatedDepartment} />

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)' }}>
            Trang {page} / {totalPages} (Tổng {totalEntries} kết quả)
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="btn btn-secondary btn-sm" style={{ opacity: page === 1 ? 0.5 : 1 }}>
              <ChevronLeft size={15} /> Trước
            </button>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="btn btn-secondary btn-sm" style={{ opacity: page === totalPages ? 0.5 : 1 }}>
              Sau <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
