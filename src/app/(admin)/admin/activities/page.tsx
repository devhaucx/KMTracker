import { getRecentActivities } from '@/lib/queries/admin'
import { getActiveCompetition } from '@/lib/queries/competition'
import AdminActivitiesClient, { type ActivityItem } from '@/components/admin/AdminActivitiesClient'
import type { SportType } from '@/lib/supabase/types'
import { requireAdmin } from '@/lib/auth/session'

function formatPaceOrSpeed(sportType: SportType, paceOrSpeed: number): string {
  switch (sportType) {
    case 'Run':
    case 'Walk': {
      const mins = Math.floor(paceOrSpeed / 60)
      const secs = Math.round(paceOrSpeed % 60)
      return `${mins}:${String(secs).padStart(2, '0')} min/km`
    }
    case 'Ride': {
      return `${paceOrSpeed.toFixed(1)} km/h`
    }
    case 'Swim': {
      const mins = Math.floor(paceOrSpeed / 60)
      const secs = Math.round(paceOrSpeed % 60)
      return `${mins}:${String(secs).padStart(2, '0')} min/100m`
    }
    default:
      return String(paceOrSpeed)
  }
}

function mapStatus(isValid: boolean, rejectionReason: string | null): 'valid' | 'invalid' | 'suspicious' {
  if (isValid) return 'valid'
  if (!isValid && rejectionReason) return 'invalid'
  return 'suspicious'
}

function formatDate(startDate: string): string {
  const d = new Date(startDate)
  if (isNaN(d.getTime())) return startDate
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminActivitiesPage() {
  await requireAdmin()
  const [competition, recentActivities] = await Promise.all([
    getActiveCompetition(),
    getRecentActivities(100),
  ])

  const mapped: ActivityItem[] = (recentActivities as any[]).map((row) => {
    const sportType = row.sport_type as SportType
    const status = mapStatus(row.is_valid, row.rejection_reason)
    const paceOrSpeedStr = formatPaceOrSpeed(sportType, row.pace_or_speed)
    const startDateStr = formatDate(row.start_date)
    const runnerName = row.users?.full_name ?? 'Unknown'
    const deptName = row.users?.departments?.name ?? 'N/A'

    return {
      id: row.id,
      runner_name: runnerName,
      department_name: deptName,
      activity_name: row.activity_name,
      sport_type: sportType,
      distance_actual: row.distance_actual_km,
      distance_converted: row.distance_converted_km,
      pace_or_speed: paceOrSpeedStr,
      start_date: startDateStr,
      status,
      rejection_reason: row.rejection_reason,
      strava_activity_id: row.strava_activity_id ?? 0,
    }
  })

  return (
    <AdminActivitiesClient
      activities={mapped}
      competitionId={competition?.id ?? null}
    />
  )
}
