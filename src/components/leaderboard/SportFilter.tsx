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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Individual / Department toggle */}
      <div className="segment" style={{ alignSelf: 'flex-start', width: '100%' }}>
        {TABS.map(t => (
          <button key={t.id} className={`segment-btn${activeTab === t.id ? ' active' : ''}`}
            style={{ flex: 1, textAlign: 'center', padding: 'clamp(0.35rem, 2vw, 0.4rem) clamp(0.6rem, 2.5vw, 0.85rem)', fontSize: 'clamp(0.75rem, 2.5vw, 0.825rem)' }}
            onClick={() => onTabChange(t.id as 'individual' | 'department')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Sport pills — only visible on individual tab */}
      {activeTab === 'individual' && (
        <div className="mobile-stack" style={{
          gap: '0.4rem',
          alignItems: 'stretch',
          justifyContent: 'flex-start'
        }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
            {SPORTS.map(s => (
              <button key={s.id} className={`filter-pill${activeSport === s.id ? ' active' : ''}`}
                style={{
                  fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
                  padding: 'clamp(0.25rem, 1.5vw, 0.35rem) clamp(0.6rem, 2vw, 0.8rem)',
                  flex: s.id === 'ALL' ? '0 0 auto' : '1 1 auto',
                  minWidth: s.id === 'ALL' ? 'auto' : 'clamp(50px, 15vw, 60px)'
                }}
                onClick={() => onSportChange(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
