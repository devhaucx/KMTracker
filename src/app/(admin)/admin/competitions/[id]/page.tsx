import EditCompetitionClient from '@/components/admin/EditCompetitionClient'
import { getCompetitionById, getCompetitionSports } from '@/lib/queries/competition'
import type { Competition, CompetitionSport } from '@/lib/supabase/types'
import { requireAdmin } from '@/lib/auth/session'

export default async function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params

  const [competition, sports]: [Competition | null, CompetitionSport[]] = await Promise.all([getCompetitionById(id), getCompetitionSports(id)])

  return <EditCompetitionClient competition={competition} sports={sports} />
}
