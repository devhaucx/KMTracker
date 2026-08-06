import AdminReportsClient from '@/components/admin/AdminReportsClient'
import { getActiveCompetition } from '@/lib/queries/competition'
import { getIndividualLeaderboard, getDepartmentLeaderboard } from '@/lib/queries/leaderboard'
import { getAdminStats } from '@/lib/queries/admin'
import { requireAdmin } from '@/lib/auth/session'

export default async function AdminReportsPage() {
  await requireAdmin()
  const competition = await getActiveCompetition()
  if (!competition) {
    return (
      <AdminReportsClient
        competition={null}
        stats={null}
        individualLeaderboard={[]}
        departmentLeaderboard={[]}
      />
    )
  }

  const [stats, individualLeaderboard, departmentLeaderboard] = await Promise.all([
    getAdminStats(competition.id),
    getIndividualLeaderboard(competition.id),
    getDepartmentLeaderboard(competition.id),
  ])

  return (
    <AdminReportsClient
      competition={competition}
      stats={stats}
      individualLeaderboard={individualLeaderboard}
      departmentLeaderboard={departmentLeaderboard}
    />
  )
}
