import AdminCompetitionsClient from '@/components/admin/AdminCompetitionsClient'
import { getCompetitions } from '@/lib/queries/competition'
import type { Competition } from '@/lib/supabase/types'
import { requireAdmin } from '@/lib/auth/session'

export default async function AdminCompetitionsPage() {
  await requireAdmin()
  const competitions: Competition[] = await getCompetitions()

  return <AdminCompetitionsClient competitions={competitions} />
}
