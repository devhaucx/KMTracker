import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getAdminStats(competitionId?: string) {
  const supabase = await createClient()

  const compFilter = competitionId ? { competition_id: competitionId } : {}

  const [participants, activities, suspicious, totalKm] = await Promise.all([
    supabase.from('competition_participants').select('*', { count: 'exact', head: true }).eq('status', 'active').match(compFilter),
    supabase.from('activities').select('*', { count: 'exact', head: true }).match(compFilter),
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('is_valid', false).match(compFilter),
    supabase.from('mv_individual_leaderboard').select('total_converted_km').match({ ...compFilter, sport_type: 'ALL' }),
  ])

  const totalConverted = (totalKm.data || []).reduce((sum: number, r: any) => sum + (r.total_converted_km || 0), 0)

  return {
    participantCount: participants.count || 0,
    activityCount: activities.count || 0,
    suspiciousCount: suspicious.count || 0,
    totalKm: Math.round(totalConverted * 100) / 100,
  }
}

export async function getParticipantsWithStats(competitionId?: string) {
  const admin = createAdminClient()

  const { data: users } = await admin
    .from('users')
    .select(`
      id, email, full_name, avatar_url, role, strava_athlete_id,
      department_id, created_at,
      departments (name, code, avatar_color)
    `)
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  const userRows = (users || []) as any[]

  const [participants, leaderboard] = await Promise.all([
    competitionId
      ? admin.from('competition_participants').select('user_id, status').eq('competition_id', competitionId)
      : admin.from('competition_participants').select('user_id, status'),
    competitionId
      ? admin.from('mv_individual_leaderboard').select('user_id, total_converted_km, activity_count').eq('competition_id', competitionId).eq('sport_type', 'ALL')
      : admin.from('mv_individual_leaderboard').select('user_id, total_converted_km, activity_count').eq('sport_type', 'ALL'),
  ])

  const statusMap = new Map<string, string>()
  for (const p of (participants.data || []) as any[]) {
    statusMap.set(p.user_id, p.status)
  }

  const kmMap = new Map<string, { total_km: number; activity_count: number }>()
  for (const r of (leaderboard.data || []) as any[]) {
    kmMap.set(r.user_id, { total_km: r.total_converted_km || 0, activity_count: r.activity_count || 0 })
  }

  return userRows.map((u) => {
    const rawStatus = statusMap.get(u.id)
    const km = kmMap.get(u.id)
    return {
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
      total_km: km?.total_km ?? 0,
      activity_count: km?.activity_count ?? 0,
      status: (rawStatus === 'withdrawn' ? 'withdrawn' : 'active') as 'active' | 'withdrawn',
      has_participant: !!rawStatus,
    }
  })
}

export async function getSuspiciousActivities(limit = 10) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('activities')
    .select(`
      *,
      users (full_name, avatar_url, strava_athlete_id, departments (name, code, avatar_color))
    `)
    .eq('is_valid', false)
    .order('start_date', { ascending: false })
    .limit(limit)
  return data || []
}

export async function getRecentActivities(limit = 50) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('activities')
    .select(`
      *,
      users (full_name, avatar_url, strava_athlete_id, departments (name, code, avatar_color))
    `)
    .order('start_date', { ascending: false })
    .limit(limit)
  return data || []
}

export async function getTopAthletes(competitionId: string, limit = 10) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mv_individual_leaderboard')
    .select('*')
    .eq('competition_id', competitionId)
    .eq('sport_type', 'ALL')
    .order('overall_rank')
    .limit(limit)
  return data || []
}
