import type { SportType } from '@/lib/supabase/types'

/**
 * MOCK DATA — dùng để test UI mà không cần Supabase/Strava thật
 * Tất cả mock data tập trung ở đây để dễ thay thế khi production
 */

export const MOCK_USER = {
  id: 'mock-user-1',
  full_name: 'Nguyễn Văn Mạnh',
  avatar_url: null,
  role: 'user' as const,
  department_name: 'IT & Công Nghệ',
  department_code: 'IT',
  strava_athlete_id: 12345678,
}

export const MOCK_ADMIN = {
  id: 'mock-admin-1',
  full_name: 'Trần Minh Khoa',
  email: 'admin@company.com',
  role: 'admin' as const,
}

export const MOCK_COMPETITION = {
  id: 'comp-autumn-2026',
  name: 'Giải Thể Thao Mùa Thu 2026',
  invite_code: 'AUTUMN2026',
  start_date: '2026-09-10',
  end_date: '2026-09-30',
  participant_count: 500,
}

export const MOCK_DEPARTMENTS = [
  { id: 'd1', name: 'IT & Công Nghệ',  code: 'IT',    color: '#2563EB' },
  { id: 'd2', name: 'Marketing',        code: 'MKT',   color: '#7C3AED' },
  { id: 'd3', name: 'Kinh Doanh',       code: 'SALES', color: '#D97706' },
  { id: 'd4', name: 'Kế Toán & HR',     code: 'KTNS',  color: '#16A34A' },
  { id: 'd5', name: 'Ban Giám Đốc',     code: 'BGD',   color: '#DC2626' },
]

export const MOCK_INDIVIDUAL_LEADERBOARD = [
  { user_id: '1', full_name: 'Nguyễn Văn Mạnh',    avatar_url: null, department_id: 'd1', department_name: 'IT & Công Nghệ', department_code: 'IT',    department_color: '#2563EB', competition_id: 'c1', sport_type: 'Run'  as SportType, total_converted_km: 84.5, total_actual_km: 84.5,  activity_count: 12, rank_by_sport: 1, overall_rank: 1 },
  { user_id: '2', full_name: 'Trần Thị Thu Thảo',   avatar_url: null, department_id: 'd2', department_name: 'Marketing',       department_code: 'MKT',   department_color: '#7C3AED', competition_id: 'c1', sport_type: 'Run'  as SportType, total_converted_km: 72.0, total_actual_km: 72.0,  activity_count: 10, rank_by_sport: 2, overall_rank: 2 },
  { user_id: '3', full_name: 'Lê Hoàng Long',       avatar_url: null, department_id: 'd3', department_name: 'Kinh Doanh',      department_code: 'SALES', department_color: '#D97706', competition_id: 'c1', sport_type: 'Ride' as SportType, total_converted_km: 65.3, total_actual_km: 195.9, activity_count:  8, rank_by_sport: 1, overall_rank: 3 },
  { user_id: '4', full_name: 'Phạm Minh Đức',       avatar_url: null, department_id: 'd1', department_name: 'IT & Công Nghệ', department_code: 'IT',    department_color: '#2563EB', competition_id: 'c1', sport_type: 'Run'  as SportType, total_converted_km: 58.2, total_actual_km: 58.2,  activity_count:  9, rank_by_sport: 3, overall_rank: 4 },
  { user_id: '5', full_name: 'Đặng Bảo Ngọc',       avatar_url: null, department_id: 'd4', department_name: 'Kế Toán & HR',   department_code: 'KTNS',  department_color: '#16A34A', competition_id: 'c1', sport_type: 'Walk' as SportType, total_converted_km: 45.0, total_actual_km: 45.0,  activity_count: 14, rank_by_sport: 1, overall_rank: 5 },
  { user_id: '6', full_name: 'Vũ Thị Hà',           avatar_url: null, department_id: 'd2', department_name: 'Marketing',       department_code: 'MKT',   department_color: '#7C3AED', competition_id: 'c1', sport_type: 'Swim' as SportType, total_converted_km: 42.5, total_actual_km: 8.5,   activity_count:  6, rank_by_sport: 1, overall_rank: 6 },
  { user_id: '7', full_name: 'Hoàng Minh Tuấn',     avatar_url: null, department_id: 'd3', department_name: 'Kinh Doanh',      department_code: 'SALES', department_color: '#D97706', competition_id: 'c1', sport_type: 'Run'  as SportType, total_converted_km: 38.0, total_actual_km: 38.0,  activity_count:  7, rank_by_sport: 4, overall_rank: 7 },
  { user_id: '8', full_name: 'Bùi Khánh Linh',      avatar_url: null, department_id: 'd4', department_name: 'Kế Toán & HR',   department_code: 'KTNS',  department_color: '#16A34A', competition_id: 'c1', sport_type: 'Run'  as SportType, total_converted_km: 32.5, total_actual_km: 32.5,  activity_count:  5, rank_by_sport: 5, overall_rank: 8 },
  { user_id: '9', full_name: 'Đinh Quang Huy',       avatar_url: null, department_id: 'd5', department_name: 'Ban Giám Đốc',   department_code: 'BGD',   department_color: '#DC2626', competition_id: 'c1', sport_type: 'Ride' as SportType, total_converted_km: 28.0, total_actual_km: 84.0,  activity_count:  4, rank_by_sport: 2, overall_rank: 9 },
  { user_id:'10', full_name: 'Ngô Thị Lan Anh',     avatar_url: null, department_id: 'd2', department_name: 'Marketing',       department_code: 'MKT',   department_color: '#7C3AED', competition_id: 'c1', sport_type: 'Walk' as SportType, total_converted_km: 25.0, total_actual_km: 25.0,  activity_count:  8, rank_by_sport: 2, overall_rank:10 },
]

export const MOCK_DEPARTMENT_LEADERBOARD = [
  { department_id: 'd1', department_name: 'IT & Công Nghệ', department_code: 'IT',    department_color: '#2563EB', competition_id: 'c1', participant_count: 18, total_converted_km: 242.7, total_actual_km: 380.2, total_activities: 42, overall_rank: 1 },
  { department_id: 'd2', department_name: 'Marketing',       department_code: 'MKT',   department_color: '#7C3AED', competition_id: 'c1', participant_count: 14, total_converted_km: 198.4, total_actual_km: 260.1, total_activities: 35, overall_rank: 2 },
  { department_id: 'd3', department_name: 'Kinh Doanh',      department_code: 'SALES', department_color: '#D97706', competition_id: 'c1', participant_count: 12, total_converted_km: 165.0, total_actual_km: 410.5, total_activities: 28, overall_rank: 3 },
  { department_id: 'd4', department_name: 'Kế Toán & HR',    department_code: 'KTNS',  department_color: '#16A34A', competition_id: 'c1', participant_count: 10, total_converted_km: 120.3, total_actual_km: 150.0, total_activities: 22, overall_rank: 4 },
  { department_id: 'd5', department_name: 'Ban Giám Đốc',    department_code: 'BGD',   department_color: '#DC2626', competition_id: 'c1', participant_count:  6, total_converted_km:  56.0, total_actual_km: 140.0, total_activities: 10, overall_rank: 5 },
]

export const MOCK_MY_ACTIVITIES = [
  { id: 'a1', strava_activity_id: '9876543211', strava_url: 'https://www.strava.com/activities/9876543211', name: 'Chạy buổi sáng Tây Hồ',   sport: 'Run',  icon: '🏃', cls: 'badge-run',  actual: 10.2, conv: 10.2, pace: '5:24 min/km',    date: '05/08 06:15', valid: true,  reason: null },
  { id: 'a2', strava_activity_id: '9876543212', strava_url: 'https://www.strava.com/activities/9876543212', name: 'Đạp xe sông Hồng',         sport: 'Ride', icon: '🚴', cls: 'badge-ride', actual: 36.0, conv: 12.0, pace: '21.5 km/h',      date: '03/08 17:30', valid: true,  reason: null },
  { id: 'a3', strava_activity_id: '9876543213', strava_url: 'https://www.strava.com/activities/9876543213', name: 'Bơi sáng bể Mỹ Đình',     sport: 'Swim', icon: '🏊', cls: 'badge-swim', actual: 1.0,  conv: 5.0,  pace: '3:20 min/100m',  date: '01/08 06:30', valid: true,  reason: null },
  { id: 'a4', strava_activity_id: '9876543214', strava_url: 'https://www.strava.com/activities/9876543214', name: 'Sprint ngắn',              sport: 'Run',  icon: '🏃', cls: 'badge-run',  actual: 5.0,  conv: 0,    pace: '3:45 min/km',    date: '30/07 18:00', valid: false, reason: 'Pace vượt giới hạn tối thiểu (< 4:00 min/km)' },
  { id: 'a5', strava_activity_id: '9876543215', strava_url: 'https://www.strava.com/activities/9876543215', name: 'Đạp xe trong nhà',         sport: 'Ride', icon: '🚴', cls: 'badge-ride', actual: 15.0, conv: 5.0,  pace: '20.0 km/h',      date: '28/07 07:00', valid: true,  reason: null },
  { id: 'a6', strava_activity_id: '9876543216', strava_url: 'https://www.strava.com/activities/9876543216', name: 'Đi bộ buổi chiều',         sport: 'Walk', icon: '🚶', cls: 'badge-walk', actual: 6.2,  conv: 6.2,  pace: '10:15 min/km',   date: '27/07 17:30', valid: true,  reason: null },
  { id: 'a7', strava_activity_id: '9876543217', strava_url: 'https://www.strava.com/activities/9876543217', name: 'Chạy đêm Hồ Gươm',        sport: 'Run',  icon: '🏃', cls: 'badge-run',  actual: 8.0,  conv: 8.0,  pace: '5:50 min/km',    date: '26/07 20:00', valid: true,  reason: null },
]

export const MOCK_MY_STATS = {
  rank: 1,
  converted_km: 84.5,
  activity_count: 12,
  total_actual_km: 121.2,
}

export const MOCK_SUSPICIOUS_ACTIVITIES = [
  { name: 'Lê Hoàng Long', dept: 'Kinh Doanh',    sport: '🚴 Đạp xe',  actual: '45.0 km', pace: '28.5 km/h',    warning: 'Vượt tốc độ tối đa (25 km/h)', severity: 'error', strava_url: 'https://www.strava.com/activities/9876543218' },
  { name: 'Phạm Minh Đức', dept: 'IT & Công Nghệ', sport: '🏃 Chạy bộ', actual: '5.0 km',  pace: '3:45 min/km', warning: 'Pace quá nhanh (< 4:00 min/km)', severity: 'warning', strava_url: 'https://www.strava.com/activities/9876543214' },
]

export const MOCK_ADMIN_STATS = {
  participant_count: 500,
  department_count: 5,
  total_converted_km: 726.4,
  suspicious_count: 2,
}

export const MOCK_COMPETITIONS_LIST = [
  {
    id: 'comp-1',
    name: 'Giải Thể Thao Mùa Thu 2026',
    invite_code: 'AUTUMN2026',
    description: 'Giải chạy & đi bộ toàn công ty chào mừng mùa thu 2026',
    start_date: '2026-09-01',
    end_date: '2026-09-30',
    registration_deadline: '2026-08-31',
    status: 'active' as const,
    is_deleted: false,
    participant_count: 500,
    sports: ['Run', 'Walk', 'Ride', 'Swim'] as SportType[],
    created_at: '2026-08-01',
    scoring_rules: {
      Run: { enabled: true, ratio: 1.0, min_pace: '4:00', max_pace: '15:00' },
      Walk: { enabled: true, ratio: 1.0, min_pace: '9:00', max_pace: '20:00' },
      Ride: { enabled: true, ratio: 0.33, min_speed: '10', max_speed: '35' },
      Swim: { enabled: true, ratio: 5.0, min_pace: '1:30', max_pace: '6:00' },
    }
  },
  {
    id: 'comp-2',
    name: 'Giải Đi Bộ Sức Khỏe Mùa Hè 2026',
    invite_code: 'SUMMER2026',
    description: 'Chương trình rèn luyện sức khỏe mùa hè cho khối văn phòng',
    start_date: '2026-06-01',
    end_date: '2026-06-30',
    registration_deadline: '2026-05-31',
    status: 'ended' as const,
    participant_count: 320,
    sports: ['Walk', 'Run'] as SportType[],
    created_at: '2026-05-15',
    scoring_rules: {
      Run: { enabled: true, ratio: 1.0, min_pace: '4:30', max_pace: '14:00' },
      Walk: { enabled: true, ratio: 1.0, min_pace: '8:30', max_pace: '18:00' },
      Ride: { enabled: false, ratio: 0.33, min_speed: '10', max_speed: '30' },
      Swim: { enabled: false, ratio: 5.0, min_pace: '1:30', max_pace: '6:00' },
    }
  },
  {
    id: 'comp-3',
    name: 'Giải Bứt Phá Doanh Số Q4 2026',
    invite_code: 'SPRINTQ4',
    description: 'Giải chạy tăng tốc sức bật quý IV năm 2026',
    start_date: '2026-10-01',
    end_date: '2026-10-31',
    registration_deadline: '2026-09-25',
    status: 'registration' as const,
    participant_count: 142,
    sports: ['Run', 'Ride'] as SportType[],
    created_at: '2026-08-01',
    scoring_rules: {
      Run: { enabled: true, ratio: 1.0, min_pace: '4:00', max_pace: '15:00' },
      Walk: { enabled: false, ratio: 1.0, min_pace: '9:00', max_pace: '20:00' },
      Ride: { enabled: true, ratio: 0.33, min_speed: '12', max_speed: '40' },
      Swim: { enabled: false, ratio: 5.0, min_pace: '1:30', max_pace: '6:00' },
    }
  },
  {
    id: 'comp-4',
    name: 'Giải Thể Thao Khởi Động Mùa Xuân 2027',
    invite_code: 'SPRING2027',
    description: 'Dự kiến tổ chức vào đầu năm mới 2027',
    start_date: '2027-02-01',
    end_date: '2027-02-28',
    registration_deadline: '2027-01-25',
    status: 'draft' as const,
    participant_count: 0,
    sports: ['Run', 'Walk', 'Ride', 'Swim'] as SportType[],
    created_at: '2026-08-04',
    scoring_rules: {
      Run: { enabled: true, ratio: 1.0, min_pace: '4:00', max_pace: '15:00' },
      Walk: { enabled: true, ratio: 1.0, min_pace: '9:00', max_pace: '20:00' },
      Ride: { enabled: true, ratio: 0.33, min_speed: '10', max_speed: '35' },
      Swim: { enabled: true, ratio: 5.0, min_pace: '1:30', max_pace: '6:00' },
    }
  }
]

export const MOCK_USERS_LIST = [
  { id: '1', full_name: 'Nguyễn Văn Mạnh', email: 'manh.nv@company.com', avatar_url: null, department_id: 'd1', department_name: 'IT & Công Nghệ', role: 'user', strava_athlete_id: 12345678, created_at: '2026-01-10', total_km: 84.5, activity_count: 12 },
  { id: '2', full_name: 'Trần Thị Thu Thảo', email: 'thao.ttt@company.com', avatar_url: null, department_id: 'd2', department_name: 'Marketing', role: 'user', strava_athlete_id: 23456789, created_at: '2026-01-12', total_km: 72.0, activity_count: 10 },
  { id: '3', full_name: 'Lê Hoàng Long', email: 'long.lh@company.com', avatar_url: null, department_id: 'd3', department_name: 'Kinh Doanh', role: 'user', strava_athlete_id: 34567890, created_at: '2026-02-01', total_km: 65.3, activity_count: 8 },
  { id: '4', full_name: 'Phạm Minh Đức', email: 'duc.pm@company.com', avatar_url: null, department_id: 'd1', department_name: 'IT & Công Nghệ', role: 'user', strava_athlete_id: 45678901, created_at: '2026-02-05', total_km: 58.2, activity_count: 9 },
  { id: '5', full_name: 'Đặng Bảo Ngọc', email: 'ngoc.db@company.com', avatar_url: null, department_id: 'd4', department_name: 'Kế Toán & HR', role: 'user', strava_athlete_id: 56789012, created_at: '2026-02-10', total_km: 45.0, activity_count: 14 },
  { id: '6', full_name: 'Vũ Thị Hà', email: 'ha.vt@company.com', avatar_url: null, department_id: 'd2', department_name: 'Marketing', role: 'user', strava_athlete_id: 67890123, created_at: '2026-03-01', total_km: 42.5, activity_count: 6 },
  { id: '7', full_name: 'Hoàng Minh Tuấn', email: 'tuan.hm@company.com', avatar_url: null, department_id: 'd3', department_name: 'Kinh Doanh', role: 'user', strava_athlete_id: 78901234, created_at: '2026-03-15', total_km: 38.0, activity_count: 7 },
  { id: '8', full_name: 'Bùi Khánh Linh', email: 'linh.bk@company.com', avatar_url: null, department_id: 'd4', department_name: 'Kế Toán & HR', role: 'user', strava_athlete_id: 89012345, created_at: '2026-04-01', total_km: 32.5, activity_count: 5 },
  { id: '9', full_name: 'Đinh Quang Huy', email: 'huy.dq@company.com', avatar_url: null, department_id: 'd5', department_name: 'Ban Giám Đốc', role: 'admin', strava_athlete_id: 90123456, created_at: '2026-01-01', total_km: 28.0, activity_count: 4 },
  { id: '10', full_name: 'Ngô Thị Lan Anh', email: 'anh.ntl@company.com', avatar_url: null, department_id: 'd2', department_name: 'Marketing', role: 'user', strava_athlete_id: 10123456, created_at: '2026-04-10', total_km: 25.0, activity_count: 8 },
]

export const MOCK_DETAILED_ACTIVITIES = [
  { id: 'act-101', strava_activity_id: 9876543211, strava_url: 'https://www.strava.com/activities/9876543211', runner_name: 'Nguyễn Văn Mạnh', department_name: 'IT & Công Nghệ', activity_name: 'Chạy buổi sáng Tây Hồ', sport_type: 'Run' as SportType, distance_actual: 10.2, distance_converted: 10.2, pace_or_speed: '5:24 min/km', start_date: '2026-08-05 06:15', status: 'valid' as const, rejection_reason: null },
  { id: 'act-102', strava_activity_id: 9876543218, strava_url: 'https://www.strava.com/activities/9876543218', runner_name: 'Lê Hoàng Long', department_name: 'Kinh Doanh', activity_name: 'Đạp xe đường cao tốc', sport_type: 'Ride' as SportType, distance_actual: 45.0, distance_converted: 14.85, pace_or_speed: '28.5 km/h', start_date: '2026-08-05 07:00', status: 'suspicious' as const, rejection_reason: 'Vượt tốc độ tối đa quy định (25 km/h)' },
  { id: 'act-103', strava_activity_id: 9876543214, strava_url: 'https://www.strava.com/activities/9876543214', runner_name: 'Phạm Minh Đức', department_name: 'IT & Công Nghệ', activity_name: 'Sprint công viên', sport_type: 'Run' as SportType, distance_actual: 5.0, distance_converted: 0, pace_or_speed: '3:45 min/km', start_date: '2026-08-04 18:00', status: 'suspicious' as const, rejection_reason: 'Pace vượt giới hạn tối thiểu (< 4:00 min/km)' },
  { id: 'act-104', strava_activity_id: 9876543219, strava_url: 'https://www.strava.com/activities/9876543219', runner_name: 'Trần Thị Thu Thảo', department_name: 'Marketing', activity_name: 'Chạy quanh công viên Cầu Giấy', sport_type: 'Run' as SportType, distance_actual: 8.5, distance_converted: 8.5, pace_or_speed: '5:40 min/km', start_date: '2026-08-04 06:30', status: 'valid' as const, rejection_reason: null },
  { id: 'act-105', strava_activity_id: 9876543213, strava_url: 'https://www.strava.com/activities/9876543213', runner_name: 'Vũ Thị Hà', department_name: 'Marketing', activity_name: 'Bơi chiều bể Mỹ Đình', sport_type: 'Swim' as SportType, distance_actual: 1.2, distance_converted: 6.0, pace_or_speed: '3:10 min/100m', start_date: '2026-08-03 17:30', status: 'valid' as const, rejection_reason: null },
  { id: 'act-106', strava_activity_id: 9876543216, strava_url: 'https://www.strava.com/activities/9876543216', runner_name: 'Đặng Bảo Ngọc', department_name: 'Kế Toán & HR', activity_name: 'Đi bộ buổi tối Hồ Gươm', sport_type: 'Walk' as SportType, distance_actual: 6.5, distance_converted: 6.5, pace_or_speed: '10:45 min/km', start_date: '2026-08-03 20:00', status: 'valid' as const, rejection_reason: null },
  { id: 'act-107', strava_activity_id: 9876543220, strava_url: 'https://www.strava.com/activities/9876543220', runner_name: 'Hoàng Minh Tuấn', department_name: 'Kinh Doanh', activity_name: 'Chạy bộ nhẹ nhàng', sport_type: 'Run' as SportType, distance_actual: 6.0, distance_converted: 6.0, pace_or_speed: '6:15 min/km', start_date: '2026-08-02 18:30', status: 'valid' as const, rejection_reason: null },
  { id: 'act-108', strava_activity_id: 9876543221, strava_url: 'https://www.strava.com/activities/9876543221', runner_name: 'Bùi Khánh Linh', department_name: 'Kế Toán & HR', activity_name: 'Chạy đua ảo GPS lỗi', sport_type: 'Run' as SportType, distance_actual: 12.0, distance_converted: 0, pace_or_speed: '2:10 min/km', start_date: '2026-08-01 12:00', status: 'invalid' as const, rejection_reason: 'GPS nhảy bất thường / Pace không thực tế' },
]


