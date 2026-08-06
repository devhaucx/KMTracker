import { getCompetitions } from '@/lib/queries/competition'
import { requireNonAdmin } from '@/lib/auth/session'
import CompetitionsClient from '@/components/competitions/CompetitionsClient'

export default async function CompetitionsPage() {
  const user = await requireNonAdmin() // Blocks admin users
  const competitions = await getCompetitions()

  return <CompetitionsClient competitions={competitions} currentUser={user} />
}
