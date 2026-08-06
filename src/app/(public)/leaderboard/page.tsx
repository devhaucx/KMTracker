import { getIndividualLeaderboard, getDepartmentLeaderboard } from '@/lib/queries/leaderboard'
import { getActiveCompetition } from '@/lib/queries/competition'
import { getCurrentUser } from '@/lib/auth/session'
import { getAdminStats } from '@/lib/queries/admin'
import LeaderboardClient from '@/components/leaderboard/LeaderboardClient'
import type { IndividualLeaderboardEntry } from '@/lib/supabase/types'

export default async function LeaderboardPage() {
  const competition = await getActiveCompetition()
  if (!competition) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Chưa có cuộc thi đang diễn ra</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Vui lòng quay lại sau khi Ban tổ chức khởi tạo cuộc thi.
          </p>
        </div>
      </div>
    )
  }

  const [individual, department, stats, currentUser] = await Promise.all([
    getIndividualLeaderboard(competition.id),
    getDepartmentLeaderboard(competition.id),
    getAdminStats(competition.id),
    getCurrentUser(),
  ])

  // Aggregate individual entries to unique users for overall ranking
  const uniqueIndividual = individual.reduce((acc: IndividualLeaderboardEntry[], entry) => {
    const existing = acc.find(a => a.user_id === entry.user_id)
    if (!existing) {
      acc.push(entry)
    } else if (entry.overall_rank < existing.overall_rank) {
      const idx = acc.indexOf(existing)
      acc[idx] = entry
    }
    return acc
  }, []).sort((a, b) => a.overall_rank - b.overall_rank)

  return (
    <LeaderboardClient
      individual={uniqueIndividual}
      department={department}
      totalKm={stats.totalKm}
      currentUserId={currentUser?.id}
      competitionName={competition.name}
    />
  )
}
