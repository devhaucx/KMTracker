import { getCompetitions } from '@/lib/queries/competition'
import { getCurrentUser } from '@/lib/auth/session'
import CompetitionsClient from '@/components/competitions/CompetitionsClient'

export default async function CompetitionsPage() {
  const competitions = await getCompetitions()
  const user = await getCurrentUser()

  return <CompetitionsClient competitions={competitions} currentUser={user} />
}
