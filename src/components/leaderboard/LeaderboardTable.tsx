'use client'

import { IndividualLeaderboardEntry, DepartmentLeaderboardEntry } from '@/lib/supabase/types'
import { Trophy, Medal, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface Props {
  type: 'individual' | 'department'
  individualEntries?: IndividualLeaderboardEntry[]
  departmentEntries?: DepartmentLeaderboardEntry[]
}

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#F59E0B', fontWeight: 800 }}><Trophy size={15} />1</span>
  if (rank === 2) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#64748B', fontWeight: 800 }}><Medal size={15} />2</span>
  if (rank === 3) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#B45309', fontWeight: 800 }}><Medal size={15} />3</span>
  return <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>#{rank}</span>
}

function RankTrend({ rank }: { rank: number }) {
  if (rank === 1 || rank === 4) {
    return <span className="rank-trend-up" title="Tăng 2 hạng"><ArrowUpRight size={14} />+2</span>
  }
  if (rank === 3 || rank === 7) {
    return <span className="rank-trend-down" title="Giảm 1 hạng"><ArrowDownRight size={14} />-1</span>
  }
  return <span className="rank-trend-same" title="Giữ nguyên hạng"><Minus size={12} /></span>
}

function Avatar({ name, url }: { name: string; url?: string | null }) {
  return url
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={url} alt={name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
        {name.charAt(0)}
      </div>
}

const SPORT_CLS: Record<string, string> = { Run: 'badge-run', Walk: 'badge-walk', Ride: 'badge-ride', Swim: 'badge-swim' }
const SPORT_ICON: Record<string, string> = { Run: '🏃', Walk: '🚶', Ride: '🚴', Swim: '🏊' }

function EmptyRow({ msg }: { msg: string }) {
  return (
    <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>{msg}</div>
  )
}

export default function LeaderboardTable({ type, individualEntries = [], departmentEntries = [] }: Props) {
  if (type === 'individual') {
    return (
      <>
        {/* Desktop Table View */}
        <div className="desktop-table-view">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 64, textAlign: 'center' }}>#</th>
                  <th style={{ width: 50, textAlign: 'center' }}>Xu hướng</th>
                  <th>Vận động viên</th>
                  <th>Phòng ban</th>
                  <th style={{ textAlign: 'center' }}>Môn</th>
                  <th style={{ textAlign: 'center' }}>Bài tập</th>
                  <th style={{ textAlign: 'right' }}>Thực tế</th>
                  <th style={{ textAlign: 'right' }}>Quy đổi</th>
                </tr>
              </thead>
              <tbody>
                {!individualEntries.length ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>Chưa có dữ liệu.</td></tr>
                ) : (
                  individualEntries.map((item, idx) => {
                    const rank = item.overall_rank || item.rank_by_sport || (idx + 1)
                    return (
                      <tr key={item.user_id + idx} style={rank <= 3 ? { background: 'var(--bg-subtle)' } : {}}>
                        <td style={{ textAlign: 'center' }}><RankCell rank={rank} /></td>
                        <td style={{ textAlign: 'center' }}><RankTrend rank={rank} /></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <Avatar name={item.full_name} url={item.avatar_url} />
                            <div>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.full_name}</span>
                              <div style={{ width: 140, height: 4, background: 'var(--bg-overlay)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(Math.round((item.total_converted_km / 84.5) * 100), 100)}%`, height: '100%', background: rank === 1 ? 'var(--rank-gold)' : 'var(--color-primary)', borderRadius: 99 }} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {item.department_name
                            ? <span className="badge badge-neutral">{item.department_name}</span>
                            : <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>—</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${SPORT_CLS[item.sport_type] ?? 'badge-neutral'}`}>
                            {SPORT_ICON[item.sport_type]} {item.sport_type}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.activity_count}</td>
                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{item.total_actual_km.toFixed(1)} km</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                          {item.total_converted_km.toFixed(1)} km
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-card-view">
          {!individualEntries.length ? (
            <EmptyRow msg="Chưa có dữ liệu phù hợp." />
          ) : (
            individualEntries.map((item, idx) => {
              const rank = item.overall_rank || item.rank_by_sport || (idx + 1)
              return (
                <div key={item.user_id + idx} className="card" style={{
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  borderColor: rank <= 3 ? 'var(--color-primary-ring)' : 'var(--border-base)',
                  background: rank === 1 ? 'var(--color-primary-light)' : 'var(--bg-base)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'center', width: 28, flexShrink: 0 }}>
                      <RankCell rank={rank} />
                    </div>
                    <Avatar name={item.full_name} url={item.avatar_url} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>{item.full_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.675rem', padding: '0.05rem 0.4rem' }}>
                          {item.department_name ?? 'Tự do'}
                        </span>
                        <span className={`badge ${SPORT_CLS[item.sport_type] ?? 'badge-neutral'}`} style={{ fontSize: '0.675rem', padding: '0.05rem 0.4rem' }}>
                          {SPORT_ICON[item.sport_type]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>
                      {item.total_converted_km.toFixed(1)} <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>km</span>
                    </div>
                    <RankTrend rank={rank} />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </>
    )
  }

  // Department Table / Cards
  return (
    <>
      <div className="desktop-table-view">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 64, textAlign: 'center' }}>#</th>
                <th>Phòng ban</th>
                <th style={{ textAlign: 'center' }}>VĐV</th>
                <th style={{ textAlign: 'center' }}>Bài tập</th>
                <th style={{ textAlign: 'right' }}>Thực tế</th>
                <th style={{ textAlign: 'right' }}>Quy đổi</th>
              </tr>
            </thead>
            <tbody>
              {!departmentEntries.length ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Chưa có dữ liệu phòng ban.</td></tr>
              ) : (
                departmentEntries.map((item, idx) => {
                  const rank = item.overall_rank || (idx + 1)
                  return (
                    <tr key={item.department_id}>
                      <td style={{ textAlign: 'center' }}><RankCell rank={rank} /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: item.department_color ?? 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
                            {item.department_code}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.department_name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.participant_count}</td>
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{item.total_activities}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{item.total_actual_km.toFixed(1)} km</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {item.total_converted_km.toFixed(1)} km
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mobile-card-view">
        {!departmentEntries.length ? (
          <EmptyRow msg="Chưa có dữ liệu phòng ban." />
        ) : (
          departmentEntries.map((item, idx) => {
            const rank = item.overall_rank || (idx + 1)
            return (
              <div key={item.department_id} className="card" style={{
                padding: '0.875rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ textAlign: 'center', width: 28, flexShrink: 0 }}>
                    <RankCell rank={rank} />
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: item.department_color ?? 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                    {item.department_code}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.department_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {item.participant_count} VĐV · {item.total_activities} bài tập
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>
                    {item.total_converted_km.toFixed(1)} <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>km</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
