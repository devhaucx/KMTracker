import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Competition, CompetitionSport, Department } from '@/lib/supabase/types'

export async function getActiveCompetition() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('competitions')
    .select('*')
    .eq('status', 'active')
    .eq('is_deleted', false)
    .single()
  return (data || null) as Competition | null
}

export async function getCompetitionByInviteCode(code: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('competitions')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .eq('is_deleted', false)
    .single()
  return (data || null) as Competition | null
}

export async function getCompetitions(includeDeleted = false) {
  const supabase = await createClient()
  let query = supabase.from('competitions').select('*')
  if (!includeDeleted) {
    query = query.eq('is_deleted', false)
  }
  const { data } = await query.order('created_at', { ascending: false })
  return (data || []) as Competition[]
}

export async function getCompetitionById(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single()
  return (data || null) as Competition | null
}

export async function getCompetitionSports(competitionId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('competition_sports')
    .select('*')
    .eq('competition_id', competitionId)
    .eq('is_active', true)
    .order('sport_type')
  return (data || []) as CompetitionSport[]
}

export async function getDepartments() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('departments')
    .select('*')
    .order('name')
  return (data || []) as Department[]
}

// Admin mutations using service role
export async function adminUpsertCompetition(data: Partial<Competition>) {
  const admin = createAdminClient()
  const { data: result, error } = await admin
    .from('competitions')
    .upsert(data)
    .select()
    .single()
  return { data: result as Competition | null, error }
}

export async function adminUpsertCompetitionSport(data: Partial<CompetitionSport>) {
  const admin = createAdminClient()
  const { data: result, error } = await admin
    .from('competition_sports')
    .upsert(data)
    .select()
    .single()
  return { data: result as CompetitionSport | null, error }
}

export async function adminUpsertDepartment(data: Partial<Department>) {
  const admin = createAdminClient()
  const { data: result, error } = await admin
    .from('departments')
    .upsert(data)
    .select()
    .single()
  return { data: result as Department | null, error }
}
