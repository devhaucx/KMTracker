'use client'

interface Props {
  activeSport: string
  onSportChange: (s: string) => void
  activeTab: 'individual' | 'department'
  onTabChange: (t: 'individual' | 'department') => void
}

const TABS   = [{ id: 'individual', label: '👤 Cá nhân' }, { id: 'department', label: '🏢 Phòng ban' }] as const
const SPORTS = [
  { id: 'ALL',  label: 'Tất cả' },
  { id: 'Run',  label: '🏃 Chạy bộ' },
  { id: 'Walk', label: '🚶 Đi bộ' },
  { id: 'Ride', label: '🚴 Đạp xe' },
  { id: 'Swim', label: '🏊 Bơi lội' },
]

export default function SportFilter({ activeSport, onSportChange, activeTab, onTabChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>

      {/* Individual / Department toggle */}
      <div className="segment" style={{ alignSelf: 'flex-start' }}>
        {TABS.map(t => (
          <button key={t.id} className={`segment-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => onTabChange(t.id as 'individual' | 'department')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Sport pills — only visible on individual tab */}
      {activeTab === 'individual' && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {SPORTS.map(s => (
            <button key={s.id} className={`filter-pill${activeSport === s.id ? ' active' : ''}`}
              onClick={() => onSportChange(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
