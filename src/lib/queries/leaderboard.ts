import { createClient } from '@/lib/supabase/server'
import type { IndividualLeaderboardEntry, DepartmentLeaderboardEntry } from '@/lib/supabase/types'

export async function getIndividualLeaderboard(competitionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mv_individual_leaderboard')
    .select('*')
    .eq('competition_id', competitionId)
    .eq('sport_type', 'ALL')
    .order('overall_rank')

  if (error) return []
  return (data || []) as IndividualLeaderboardEntry[]
}

export async function getFullIndividualLeaderboard(competitionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mv_individual_leaderboard')
    .select('*')
    .eq('competition_id', competitionId)
    .order('sport_type')
    .order('rank_by_sport')

  if (error) return []
  return (data || []) as IndividualLeaderboardEntry[]
}

export async function getDepartmentLeaderboard(competitionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mv_department_leaderboard')
    .select('*')
    .eq('competition_id', competitionId)
    .order('overall_rank')

  if (error) return []
  return (data || []) as DepartmentLeaderboardEntry[]
}
