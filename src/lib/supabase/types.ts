export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin' | 'super_admin'
export type SportType = 'Run' | 'Walk' | 'Ride' | 'Swim'
export type CompetitionStatus = 'draft' | 'registration' | 'active' | 'ended'

export interface Department {
  id: string
  name: string
  code: string
  avatar_color: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  department_id: string | null
  strava_athlete_id: number | null
  strava_access_token: string | null
  strava_refresh_token: string | null
  token_expires_at: string | null
  role: UserRole
  is_profile_complete: boolean
  created_at: string
}

export interface Competition {
  id: string
  name: string
  invite_code: string
  description: string | null
  start_date: string
  end_date: string
  registration_deadline: string
  scoring_rules: Json
  status: CompetitionStatus
  created_by: string | null
  created_at: string
  is_deleted?: boolean
  deleted_at?: string | null
}

export interface CompetitionSport {
  id: string
  competition_id: string
  sport_type: SportType
  display_name: string
  icon: string
  conversion_ratio: number
  min_pace_or_speed: number
  max_pace_or_speed: number
  validation_unit: string
  is_active: boolean
}

export interface CompetitionParticipant {
  id: string
  user_id: string
  competition_id: string
  joined_at: string
  status: 'active' | 'withdrawn'
}

export interface Activity {
  id: string
  user_id: string
  competition_id: string | null
  competition_sport_id: string | null
  strava_activity_id: number
  sport_type: SportType
  activity_name: string
  distance_actual_km: number
  distance_converted_km: number
  moving_time_seconds: number
  pace_or_speed: number
  start_date: string
  is_valid: boolean
  rejection_reason: string | null
  sync_status: 'pending' | 'processed' | 'failed'
  synced_at: string
}

export interface IndividualLeaderboardEntry {
  user_id: string
  full_name: string
  avatar_url: string | null
  department_id: string | null
  department_name: string | null
  department_code: string | null
  department_color: string | null
  competition_id: string
  sport_type: SportType
  total_converted_km: number
  total_actual_km: number
  activity_count: number
  rank_by_sport: number
  overall_rank: number
}

export interface DepartmentLeaderboardEntry {
  department_id: string
  department_name: string
  department_code: string
  department_color: string
  competition_id: string
  participant_count: number
  total_converted_km: number
  total_actual_km: number
  total_activities: number
  overall_rank: number
}
