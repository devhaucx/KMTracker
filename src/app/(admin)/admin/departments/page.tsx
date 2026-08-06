import { getDepartments } from '@/lib/queries/competition'
import AdminDepartmentsClient, { type DepartmentItem } from '@/components/admin/AdminDepartmentsClient'
import { requireAdmin } from '@/lib/auth/session'

export default async function AdminDepartmentsPage() {
  await requireAdmin()
  const depts = await getDepartments()
  const departments: DepartmentItem[] = depts.map((dept) => ({
    id: dept.id,
    name: dept.name,
    code: dept.code,
    color: dept.avatar_color,
    memberCount: 0,
  }))

  return <AdminDepartmentsClient departments={departments} />
}
