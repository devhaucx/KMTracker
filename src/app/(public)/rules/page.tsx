import { getCompetitions, getCompetitionSports } from '@/lib/queries/competition'
import RulesClient from '@/components/rules/RulesClient'

export default async function RulesPage() {
  const competitions = await getCompetitions()

  const competitionsWithSports = await Promise.all(
    competitions.map(async c => ({
      competition: c,
      sports: await getCompetitionSports(c.id),
    }))
  )

  return <RulesClient competitions={competitionsWithSports} />
}
