'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, TrendingUp, Search, Flame, Target, Trophy, ChevronLeft, ChevronRight, Award, Zap } from 'lucide-react'
import Podium from '@/components/leaderboard/Podium'
import SportFilter from '@/components/leaderboard/SportFilter'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'
import {
  MOCK_INDIVIDUAL_LEADERBOARD,
  MOCK_DEPARTMENT_LEADERBOARD,
  MOCK_USER,
  MOCK_ADMIN_STATS,
} from '@/lib/mock/data'

const PAGE_SIZE = 5
const TARGET_TOTAL_KM = 1000 // Target goal for tournament

export default function LeaderboardPage() {
  const [tab, setTab]         = useState<'individual' | 'department'>('individual')
  const [sport, setSport]     = useState('ALL')
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [spinning, setSpinning] = useState(false)

  // Filter individual entries by sport and search query
  const filteredIndividual = useMemo(() => {
    return MOCK_INDIVIDUAL_LEADERBOARD.filter(item => {
      const matchSport = sport === 'ALL' || item.sport_type === sport
      const matchSearch = search.trim() === '' ||
        item.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (item.department_name && item.department_name.toLowerCase().includes(search.toLowerCase()))
      return matchSport && matchSearch
    })
  }, [sport, search])

  // Filter department entries by search query
  const filteredDepartment = useMemo(() => {
    return MOCK_DEPARTMENT_LEADERBOARD.filter(item => {
      return search.trim() === '' ||
        item.department_name.toLowerCase().includes(search.toLowerCase()) ||
        item.department_code.toLowerCase().includes(search.toLowerCase())
    })
  }, [search])

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

  // Find current user's rank
  const myEntry = useMemo(() => {
    return MOCK_INDIVIDUAL_LEADERBOARD.find(i => i.user_id === '1' || i.full_name === MOCK_USER.full_name)
  }, [])

  // Overall Goal Completion Percentage
  const totalKmSum = MOCK_ADMIN_STATS.total_converted_km
  const goalProgressPct = Math.min(Math.round((totalKmSum / TARGET_TOTAL_KM) * 100), 100)

  const refresh = () => { setSpinning(true); setTimeout(() => setSpinning(false), 600) }

  const handleSportChange = (s: string) => {
    setSport(s)
    setPage(1)
  }

  const handleTabChange = (t: 'individual' | 'department') => {
    setTab(t)
    setPage(1)
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Live Ranking</span>
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700 }}>Đua Top Thể Thao Mùa Thu 2026</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Cập nhật tự động 60s/lần · Đấu cá nhân &amp; Thi đua phòng ban
          </p>
        </div>
        <button onClick={refresh} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} className={spinning ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Gamified Tournament Target Goal Progress Banner */}
      <div className="card" style={{
        padding: '1.5rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, var(--bg-base) 0%, var(--color-primary-light) 100%)',
        borderColor: 'var(--color-primary-ring)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Mục tiêu chung toàn giải: {TARGET_TOTAL_KM.toLocaleString()} KM Quy Đổi
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Toàn công ty đã tích lũy <strong>{totalKmSum.toFixed(1)} km</strong> ({goalProgressPct}%)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-warning)', background: 'var(--color-warning-bg)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-warning-border)' }}>
            <Flame size={15} /> Bứt phá hôm nay: Nguyễn Văn Mạnh (+10.2 km)
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '10px', background: 'var(--bg-overlay)', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            width: `${goalProgressPct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--blue-500) 0%, #10B981 100%)',
            borderRadius: '99px',
            transition: 'width 0.6s var(--ease-out)',
          }} />
        </div>
      </div>

      {/* My Rank Highlight Banner */}
      {myEntry && tab === 'individual' && (
        <div style={{
          background: 'var(--color-primary-light)',
          border: '1px solid var(--color-primary-ring)',
          borderRadius: 'var(--radius-xl)',
          padding: '0.875rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.95rem'
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
            <span className="badge badge-blue">🔥 Top 1 Run</span>
          </div>
        </div>
      )}

      {/* Podium (Top 3) */}
      {tab === 'individual' && sport === 'ALL' && !search && (
        <Podium topThree={MOCK_INDIVIDUAL_LEADERBOARD.slice(0, 3)} />
      )}

      {/* Filters & Search Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <SportFilter
            activeSport={sport}
            onSportChange={handleSportChange}
            activeTab={tab}
            onTabChange={handleTabChange}
          />

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 220 }}>
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

      {/* Table & Cards */}
      <LeaderboardTable
        type={tab}
        individualEntries={paginatedIndividual}
        departmentEntries={paginatedDepartment}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)' }}>
            Trang {page} / {totalPages} (Tổng {totalEntries} kết quả)
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
              style={{ opacity: page === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={15} /> Trước
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="btn btn-secondary btn-sm"
              style={{ opacity: page === totalPages ? 0.5 : 1 }}
            >
              Sau <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
