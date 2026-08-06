import { getAllUsers } from '@/lib/queries/admin'
import { getDepartments } from '@/lib/queries/competition'
import AdminUsersClient, { type AdminUserItem, type AdminDepartment } from '@/components/admin/AdminUsersClient'
import { requireAdmin } from '@/lib/auth/session'

export default async function AdminUsersPage() {
  await requireAdmin()
  const [dbUsers, dbDepartments] = await Promise.all([getAllUsers(), getDepartments()])

  const departments: AdminDepartment[] = dbDepartments.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    color: d.avatar_color,
  }))

  const users: AdminUserItem[] = dbUsers.map((u) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    avatar_url: u.avatar_url,
    department_id: u.department_id,
    department_name: u.departments?.name ?? null,
    department_color: u.departments?.avatar_color ?? null,
    role: u.role,
    strava_athlete_id: u.strava_athlete_id,
    created_at: u.created_at,
    total_km: 0,
    activity_count: 0,
    status: 'active' as const,
  }))

  return <AdminUsersClient users={users} departments={departments} />
}
