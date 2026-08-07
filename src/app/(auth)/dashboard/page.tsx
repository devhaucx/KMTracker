import { requireNonAdmin } from '@/lib/auth/session'
import { getMyActivities, getMyCompetitions } from '@/lib/queries/user'
import { getActiveCompetition } from '@/lib/queries/competition'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const user = await requireNonAdmin() // Blocks admin users

  const activeComp = await getActiveCompetition()
  const [competitions, activities] = await Promise.all([
    getMyCompetitions(),
    getMyActivities(),
  ])

  const allComps = activeComp && !competitions.find(c => c.id === activeComp.id)
    ? [activeComp, ...competitions]
    : competitions

  return (
    <DashboardClient
      user={user}
      competitions={allComps}
      activeCompetition={activeComp}
      activities={activities}
    />
  )
}
