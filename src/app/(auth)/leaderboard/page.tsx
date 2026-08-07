import { getFullIndividualLeaderboard, getDepartmentLeaderboard } from '@/lib/queries/leaderboard'
import { getActiveCompetition } from '@/lib/queries/competition'
import { requireNonAdmin } from '@/lib/auth/session'
import { getAdminStats } from '@/lib/queries/admin'
import LeaderboardClient from '@/components/leaderboard/LeaderboardClient'

export default async function LeaderboardPage() {
  const currentUser = await requireNonAdmin()

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

  const [individual, department, stats] = await Promise.all([
    getFullIndividualLeaderboard(competition.id),
    getDepartmentLeaderboard(competition.id),
    getAdminStats(competition.id),
  ])

  return (
    <LeaderboardClient
      individual={individual}
      department={department}
      totalKm={stats.totalKm}
      currentUserId={currentUser?.id}
      competitionName={competition.name}
    />
  )
}
