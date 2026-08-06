'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SportType, CompetitionStatus } from '@/lib/supabase/types'

interface SportRuleInput {
  enabled: boolean
  ratio: number
  minPaceOrSpeed: string
  maxPaceOrSpeed: string
}

export async function createCompetition(data: {
  name: string
  inviteCode: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  status: CompetitionStatus
  sportRules: Record<SportType, SportRuleInput>
}) {
  const admin = await requireAdmin()
  const supabase = createAdminClient()

  const { data: comp, error } = await supabase
    .from('competitions')
    .insert({
      name: data.name,
      invite_code: data.inviteCode.toUpperCase(),
      description: data.description || null,
      start_date: data.startDate,
      end_date: data.endDate,
      registration_deadline: data.registrationDeadline,
      status: data.status,
      created_by: admin.id,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  if (!comp) return { success: false, error: 'Không thể tạo cuộc thi' }

  const sportRows = Object.entries(data.sportRules)
    .filter(([, rule]) => rule.enabled)
    .map(([sportType, rule]) => {
      const isRide = sportType === 'Ride'
      const isSwim = sportType === 'Swim'
      return {
        competition_id: comp.id,
        sport_type: sportType as SportType,
        display_name: sportType,
        icon: isRide ? '🚴' : isSwim ? '🏊' : sportType === 'Run' ? '🏃' : '🚶',
        conversion_ratio: rule.ratio,
        min_pace_or_speed: parseFloat(rule.minPaceOrSpeed) || 0,
        max_pace_or_speed: parseFloat(rule.maxPaceOrSpeed) || 0,
        validation_unit: isRide ? 'km/h' : isSwim ? 'min/100m' : 'min/km',
        is_active: true,
      }
    })

  if (sportRows.length > 0) {
    const { error: sportError } = await supabase
      .from('competition_sports')
      .insert(sportRows)

    if (sportError) {
      console.error('Failed to insert sport rules:', sportError)
    }
  }

  revalidatePath('/admin/competitions')
  return { success: true, competitionId: comp.id }
}

export async function updateCompetition(
  id: string,
  data: {
    name: string
    inviteCode: string
    description: string
    startDate: string
    endDate: string
    registrationDeadline: string
    status: CompetitionStatus
  }
) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('competitions')
    .select('status')
    .eq('id', id)
    .single()

  const isLocked = existing?.status === 'active' || existing?.status === 'ended'

  const updateData: Record<string, any> = {
    status: data.status,
    description: data.description || null,
  }

  if (!isLocked) {
    updateData.name = data.name
    updateData.invite_code = data.inviteCode.toUpperCase()
    updateData.start_date = data.startDate
    updateData.end_date = data.endDate
    updateData.registration_deadline = data.registrationDeadline
  }

  const { error } = await supabase
    .from('competitions')
    .update(updateData)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/competitions')
  revalidatePath(`/admin/competitions/${id}`)
  return { success: true }
}

export async function updateCompetitionSports(
  competitionId: string,
  sportRules: Record<SportType, SportRuleInput>
) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('competitions')
    .select('status')
    .eq('id', competitionId)
    .single()

  if (existing?.status === 'active' || existing?.status === 'ended') {
    return { success: false, error: 'Không thể sửa quy tắc khi cuộc thi đang diễn ra hoặc đã kết thúc' }
  }

  await supabase
    .from('competition_sports')
    .delete()
    .eq('competition_id', competitionId)

  const sportRows = Object.entries(sportRules)
    .filter(([, rule]) => rule.enabled)
    .map(([sportType, rule]) => {
      const isRide = sportType === 'Ride'
      const isSwim = sportType === 'Swim'
      return {
        competition_id: competitionId,
        sport_type: sportType as SportType,
        display_name: sportType,
        icon: isRide ? '🚴' : isSwim ? '🏊' : sportType === 'Run' ? '🏃' : '🚶',
        conversion_ratio: rule.ratio,
        min_pace_or_speed: parseFloat(rule.minPaceOrSpeed) || 0,
        max_pace_or_speed: parseFloat(rule.maxPaceOrSpeed) || 0,
        validation_unit: isRide ? 'km/h' : isSwim ? 'min/100m' : 'min/km',
        is_active: true,
      }
    })

  if (sportRows.length > 0) {
    const { error } = await supabase
      .from('competition_sports')
      .insert(sportRows)

    if (error) return { success: false, error: error.message }
  }

  revalidatePath(`/admin/competitions/${competitionId}`)
  revalidatePath('/rules')
  return { success: true }
}

export async function deleteCompetition(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('competitions')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/competitions')
  return { success: true }
}

export async function toggleCompetitionStatus(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: comp } = await supabase
    .from('competitions')
    .select('status')
    .eq('id', id)
    .single()

  if (!comp) return { success: false, error: 'Không tìm thấy cuộc thi' }

  const newStatus: CompetitionStatus = comp.status === 'active' ? 'draft' : 'active'

  const { error } = await supabase
    .from('competitions')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/competitions')
  return { success: true }
}
