import { createClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/lib/supabase/types'

export async function getAdminStats(competitionId?: string) {
  const supabase = await createClient()

  const compFilter = competitionId ? { competition_id: competitionId } : {}

  const [participants, activities, suspicious, totalKm] = await Promise.all([
    supabase.from('competition_participants').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('activities').select('*', { count: 'exact', head: true }).match(compFilter),
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('is_valid', false).match(compFilter),
    supabase.from('mv_individual_leaderboard').select('total_converted_km').match(compFilter),
  ])

  const totalConverted = (totalKm.data || []).reduce((sum: number, r: any) => sum + (r.total_converted_km || 0), 0)

  return {
    participantCount: participants.count || 0,
    activityCount: activities.count || 0,
    suspiciousCount: suspicious.count || 0,
    totalKm: Math.round(totalConverted * 100) / 100,
  }
}

export async function getAllUsers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('public_user_profiles')
    .select(`
      *,
      departments (name, code, avatar_color)
    `)
    .order('created_at', { ascending: false })
  return (data || []) as (UserProfile & { departments: { name: string; code: string; avatar_color: string } | null })[]
}

export async function getSuspiciousActivities(limit = 10) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('activities')
    .select(`
      *,
      users (full_name, avatar_url, strava_athlete_id)
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
      users (full_name, avatar_url, strava_athlete_id),
      departments!inner (name, code, avatar_color)
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
    .order('overall_rank')
    .limit(limit)
  return data || []
}
