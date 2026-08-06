import NewCompetitionClient from '@/components/admin/NewCompetitionClient'
import { requireAdmin } from '@/lib/auth/session'

export default async function NewCompetitionPage() {
  await requireAdmin()
  return <NewCompetitionClient />
}
