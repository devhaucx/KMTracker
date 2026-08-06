import { getCurrentUser } from '@/lib/auth/session'
import { getDepartments } from '@/lib/queries/competition'
import ProfileClient from '@/components/profile/ProfileClient'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) return null

  const departments = await getDepartments()

  return <ProfileClient user={user} departments={departments} />
}
