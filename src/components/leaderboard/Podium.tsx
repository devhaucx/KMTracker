'use client'

import { IndividualLeaderboardEntry } from '@/lib/supabase/types'
import { Trophy, Crown, Medal } from 'lucide-react'

interface Props { topThree: IndividualLeaderboardEntry[] }

const PLACES = [
  { rank: 2, label: '2nd', medalColor: '#94A3B8', borderGlow: 'var(--rank-silver-glow)', bg: 'var(--bg-subtle)',          scale: 1,    order: 1, height: '140px' },
  { rank: 1, label: '1st', medalColor: '#F59E0B', borderGlow: 'var(--shadow-gold)',       bg: 'var(--color-primary-light)', scale: 1.05, order: 2, height: '175px' },
  { rank: 3, label: '3rd', medalColor: '#B45309', borderGlow: 'var(--rank-bronze-glow)', bg: 'var(--bg-subtle)',          scale: 1,    order: 3, height: '125px' },
]

function Avatar({ name, url, size = 56, border, isFirst }: { name: string; url?: string | null; size?: number; border?: string; isFirst?: boolean }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {isFirst && (
        <Crown size={22} style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', color: '#F59E0B', filter: 'drop-shadow(0 2px 4px rgba(245,158,11,0.5))' }} />
      )}
      {url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', border: border ?? 'none', objectFit: 'cover' }} />
        : <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 800, border: border ?? 'none', flexShrink: 0 }}>
            {name.charAt(0)}
          </div>}
    </div>
  )
}

export default function Podium({ topThree }: Props) {
  if (!topThree?.length) return null

  const byRank = (r: number) => topThree.find(u => u.overall_rank === r || u.rank_by_sport === r) ?? topThree[r - 1]

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '0.75rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      alignItems: 'flex-end',
      paddingTop: '1rem',
    }}>
      {PLACES.map(({ rank, medalColor, borderGlow, bg, scale, order, height }) => {
        const item = byRank(rank)
        if (!item) return null
        const isFirst = rank === 1
        return (
          <div key={rank} className="card" style={{
            order,
            flex: '1 1 180px',
            maxWidth: isFirst ? 240 : 210,
            textAlign: 'center',
            padding: isFirst ? '1.5rem 1.25rem' : '1.25rem 1rem',
            transform: `scale(${scale})`,
            transformOrigin: 'bottom center',
            borderColor: isFirst ? 'var(--color-primary)' : 'var(--border-base)',
            boxShadow: isFirst ? '0 8px 30px rgba(37,99,235,0.18)' : 'var(--shadow-sm)',
            background: bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.45rem',
            position: 'relative',
          }}>
            {/* Rank badge */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: medalColor, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 800, flexShrink: 0,
              boxShadow: `0 2px 8px ${medalColor}66`
            }}>
              {rank}
            </div>

            <Avatar
              name={item.full_name}
              url={item.avatar_url}
              size={isFirst ? 64 : 52}
              border={`3px solid ${medalColor}`}
              isFirst={isFirst}
            />

            <div>
              <div style={{ fontWeight: 700, fontSize: isFirst ? '1rem' : '0.875rem', lineHeight: 1.2, marginBottom: '0.15rem' }}>
                {item.full_name}
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem' }}>
                {item.department_name ?? 'Tự do'}
              </span>
            </div>

            <div style={{
              fontSize: isFirst ? '1.5rem' : '1.25rem',
              fontWeight: 800,
              color: isFirst ? 'var(--color-primary)' : 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginTop: '0.2rem',
            }}>
              {item.total_converted_km.toFixed(1)}
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)', marginLeft: '0.25rem' }}>km</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
