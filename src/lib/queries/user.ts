import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import type { Activity, IndividualLeaderboardEntry, Competition } from '@/lib/supabase/types'

export async function getMyActivities(competitionId?: string) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  if (competitionId) {
    query = query.eq('competition_id', competitionId)
  }

  const { data, error } = await query
  if (error) return []
  return (data || []) as Activity[]
}

export async function getMyStats(competitionId: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('mv_individual_leaderboard')
    .select('*')
    .eq('user_id', user.id)
    .eq('competition_id', competitionId)

  return (data || []) as IndividualLeaderboardEntry[]
}

export async function getMyCompetitions() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('competition_participants')
    .select(`
      competition_id,
      competitions (*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (!data) return []
  return data.map(d => d.competitions).filter(Boolean) as unknown as Competition[]
}
