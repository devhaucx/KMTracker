import { getActiveCompetition, getDepartments } from '@/lib/queries/competition'
import { getAdminStats, getSuspiciousActivities, getTopAthletes } from '@/lib/queries/admin'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'
import { requireAdmin } from '@/lib/auth/session'

export default async function AdminPage() {
  await requireAdmin()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kmtracker.dev-haucx.workers.dev'

  const competition = await getActiveCompetition()
  if (!competition) {
    return (
      <AdminDashboardClient
        competition={null}
        stats={null}
        suspiciousActivities={[]}
        topAthletes={[]}
        appUrl={appUrl}
      />
    )
  }

  const [stats, departments, suspiciousRaw, topAthletes] = await Promise.all([
    getAdminStats(competition.id),
    getDepartments(),
    getSuspiciousActivities(5),
    getTopAthletes(competition.id, 10),
  ])

  const deptCount = new Set(departments.map(d => d.id)).size || departments.length

  const mergedStats = {
    participant_count: stats.participantCount,
    department_count: deptCount,
    total_converted_km: stats.totalKm,
    suspicious_count: stats.suspiciousCount,
  }

  const suspiciousActivities = suspiciousRaw.map((a: any) => {
    const isRun = a.sport_type === 'Run' || a.sport_type === 'Walk'
    const isRide = a.sport_type === 'Ride'
    const isSwim = a.sport_type === 'Swim'
    let paceDisplay = ''
    if (isRide) {
      paceDisplay = `${a.pace_or_speed?.toFixed(1) ?? '—'} km/h`
    } else if (isSwim) {
      const totalSec = a.pace_or_speed ?? 0
      const min = Math.floor(totalSec / 60)
      const sec = Math.round(totalSec % 60)
      paceDisplay = `${min}:${sec.toString().padStart(2, '0')} min/100m`
    } else {
      const totalSec = a.pace_or_speed ?? 0
      const min = Math.floor(totalSec / 60)
      const sec = Math.round(totalSec % 60)
      paceDisplay = `${min}:${sec.toString().padStart(2, '0')} min/km`
    }

    const sportIcons: Record<string, string> = { Run: '🏃 Chạy bộ', Walk: '🚶 Đi bộ', Ride: '🚴 Đạp xe', Swim: '🏊 Bơi' }

    return {
      name: a.users?.full_name || 'Không rõ',
      dept: a.departments?.name || '—',
      sport: sportIcons[a.sport_type] || a.sport_type,
      actual: `${a.distance_actual_km?.toFixed(1) ?? '0'} km`,
      pace: paceDisplay,
      warning: a.rejection_reason || 'Cần kiểm duyệt',
      severity: a.rejection_reason ? 'error' : 'warning',
      strava_url: `https://www.strava.com/activities/${a.strava_activity_id}`,
    }
  })

  return (
    <AdminDashboardClient
      competition={competition}
      stats={mergedStats}
      suspiciousActivities={suspiciousActivities}
      topAthletes={topAthletes}
      appUrl={appUrl}
    />
  )
}
