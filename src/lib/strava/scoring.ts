import { SportType } from '../supabase/types'

export interface DynamicSportRule {
  enabled: boolean
  ratio: number
  minPaceOrSpeed: number // min value
  maxPaceOrSpeed: number // max value
  unit: 'min/km' | 'km/h' | 'min/100m'
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

  // Date window validation
  if (compStartDateIso && compEndDateIso) {
    const activityDate = new Date(startDateIso).getTime()
    const compStart = new Date(compStartDateIso).getTime()
    const compEnd = new Date(compEndDateIso).getTime()

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
    minPaceOrSpeed: category === 'Run' ? 4.0 : category === 'Walk' ? 9.0 : category === 'Ride' ? 10.0 : 2.0,
    maxPaceOrSpeed: category === 'Run' ? 9.0 : category === 'Walk' ? 14.0 : category === 'Ride' ? 25.0 : 6.0,
    unit: category === 'Ride' ? 'km/h' : category === 'Swim' ? 'min/100m' : 'min/km'
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

  // Calculate pace / speed based on category
  let paceOrSpeed = 0
  let isValid = false

  if (category === 'Run' || category === 'Walk') {
    const paceMinPerKm = (movingTimeSeconds / 60.0) / distanceKm
    paceOrSpeed = Math.round(paceMinPerKm * 100) / 100
    isValid = paceMinPerKm >= rule.minPaceOrSpeed && paceMinPerKm <= rule.maxPaceOrSpeed
  } else if (category === 'Ride') {
    const speedKmh = distanceKm / (movingTimeSeconds / 3600.0)
    paceOrSpeed = Math.round(speedKmh * 100) / 100
    isValid = speedKmh >= rule.minPaceOrSpeed && speedKmh <= rule.maxPaceOrSpeed
  } else if (category === 'Swim') {
    const paceMinPer100m = (movingTimeSeconds / 60.0) / (distanceKm * 10)
    paceOrSpeed = Math.round(paceMinPer100m * 100) / 100
    isValid = paceMinPer100m >= rule.minPaceOrSpeed && paceMinPer100m <= rule.maxPaceOrSpeed
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
      : `Chỉ số ${rule.unit} (${paceOrSpeed}) nằm ngoài phạm vi quy định (${rule.minPaceOrSpeed} - ${rule.maxPaceOrSpeed} ${rule.unit})`
  }
}
