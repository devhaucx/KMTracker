import { SportType } from '../supabase/types'

function formatPaceValue(sec: number, unit: string): string {
  if (unit === 'km/h') return sec.toFixed(1) + ' km/h'
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  const label = unit === 'sec/100m' ? 'phút/100m' : 'phút/km'
  return `${m}:${String(s).padStart(2, '0')} ${label}`
}

export interface DynamicSportRule {
  enabled: boolean
  ratio: number
  minPaceOrSpeed: number // min value
  maxPaceOrSpeed: number // max value
  unit: 'sec/km' | 'km/h' | 'sec/100m'
}

export type CompetitionRulesConfig = Partial<Record<SportType, DynamicSportRule>>

export interface ScoringResult {
  isValid: boolean
  categorySport: SportType | 'Other'
  rawStravaType: string
  distanceActualKm: number
  distanceConvertedKm: number
  paceOrSpeed: number
  validationUnit: string
  rejectionReason: string | null
}

// Strava API v3 sport_type / type mapping to core categories
export function mapStravaSportCategory(stravaType: string): SportType | 'Other' {
  const normalized = (stravaType || '').trim()

  // Run category
  if (['Run', 'TrailRun', 'VirtualRun', 'Elliptical', 'StairStepper'].includes(normalized)) {
    return 'Run'
  }

  // Walk category
  if (['Walk', 'Hike', 'Hiking', 'Snowshoe'].includes(normalized)) {
    return 'Walk'
  }

  // Ride category
  if (['Ride', 'EBikeRide', 'VirtualRide', 'GravelRide', 'MountainBikeRide', 'Handcycle', 'Velomobile'].includes(normalized)) {
    return 'Ride'
  }

  // Swim category
  if (['Swim'].includes(normalized)) {
    return 'Swim'
  }

  return 'Other'
}

/**
 * Calculates activity score against competition rules
 * All dates are handled as UTC timestamps to avoid timezone issues
 */
export function calculateActivityScore(
  rawStravaType: string,
  distanceMeters: number,
  movingTimeSeconds: number,
  startDateIso: string,
  compStartDateIso?: string,
  compEndDateIso?: string,
  customRules?: CompetitionRulesConfig
): ScoringResult {
  const distanceKm = distanceMeters / 1000.0
  const category = mapStravaSportCategory(rawStravaType)

  if (distanceKm <= 0 || movingTimeSeconds <= 0) {
    return {
      isValid: false,
      categorySport: category,
      rawStravaType,
      distanceActualKm: 0,
      distanceConvertedKm: 0,
      paceOrSpeed: 0,
      validationUnit: 'invalid',
      rejectionReason: 'Quãng đường hoặc thời gian tập luyện không hợp lệ (<= 0)'
    }
  }

  // Date window validation - handle as UTC timestamps to avoid timezone issues
  // Strava dates are always UTC, competition dates should be stored as UTC
  if (compStartDateIso && compEndDateIso) {
    const activityDate = new Date(startDateIso).getTime()
    // Add 1 second buffer to end date to include full final day (23:59:59)
    const compStart = new Date(compStartDateIso).getTime()
    const compEnd = new Date(compEndDateIso).getTime() + 86399000 // +23:59:59 in ms

    if (activityDate < compStart || activityDate > compEnd) {
      return {
        isValid: false,
        categorySport: category,
        rawStravaType,
        distanceActualKm: distanceKm,
        distanceConvertedKm: 0,
        paceOrSpeed: 0,
        validationUnit: 'date',
        rejectionReason: 'Hoạt động nằm ngoài thời gian thi đấu chính thức'
      }
    }
  }

  // Default rules if custom rules not provided
  const rule: DynamicSportRule = (category !== 'Other' && customRules?.[category]) || {
    enabled: true,
    ratio: category === 'Ride' ? 0.3333 : category === 'Swim' ? 5.0 : 1.0,
    minPaceOrSpeed: category === 'Run' ? 240 : category === 'Walk' ? 540 : category === 'Ride' ? 10.0 : 90,
    maxPaceOrSpeed: category === 'Run' ? 900 : category === 'Walk' ? 1200 : category === 'Ride' ? 35.0 : 360,
    unit: category === 'Ride' ? 'km/h' : category === 'Swim' ? 'sec/100m' : 'sec/km'
  }

  if (category === 'Other' || !rule.enabled) {
    return {
      isValid: false,
      categorySport: category,
      rawStravaType,
      distanceActualKm: distanceKm,
      distanceConvertedKm: 0,
      paceOrSpeed: 0,
      validationUnit: 'unsupported',
      rejectionReason: `Bộ môn "${rawStravaType}" không thuộc danh mục tính điểm của giải đấu này`
    }
  }

  // Calculate pace (sec/km, sec/100m) or speed (km/h) based on category
  let paceOrSpeed = 0
  let isValid = false

  if (category === 'Run' || category === 'Walk') {
    // Pace in seconds per km
    const paceSecPerKm = movingTimeSeconds / distanceKm
    paceOrSpeed = Math.round(paceSecPerKm * 100) / 100
    isValid = paceSecPerKm >= rule.minPaceOrSpeed && paceSecPerKm <= rule.maxPaceOrSpeed
  } else if (category === 'Ride') {
    // Speed in km/h
    const speedKmh = distanceKm / (movingTimeSeconds / 3600.0)
    paceOrSpeed = Math.round(speedKmh * 100) / 100
    isValid = speedKmh >= rule.minPaceOrSpeed && speedKmh <= rule.maxPaceOrSpeed
  } else if (category === 'Swim') {
    // Pace in seconds per 100m
    const paceSecPer100m = movingTimeSeconds / (distanceKm * 10)
    paceOrSpeed = Math.round(paceSecPer100m * 100) / 100
    isValid = paceSecPer100m >= rule.minPaceOrSpeed && paceSecPer100m <= rule.maxPaceOrSpeed
  }

  const convertedKm = isValid ? Math.round(distanceKm * rule.ratio * 100) / 100 : 0

  return {
    isValid,
    categorySport: category,
    rawStravaType,
    distanceActualKm: distanceKm,
    distanceConvertedKm: convertedKm,
    paceOrSpeed,
    validationUnit: rule.unit,
    rejectionReason: isValid
      ? null
      : `Tốc độ ${formatPaceValue(paceOrSpeed, rule.unit)} nằm ngoài phạm vi quy định (${formatPaceValue(rule.minPaceOrSpeed, rule.unit)} - ${formatPaceValue(rule.maxPaceOrSpeed, rule.unit)})`
  }
}
