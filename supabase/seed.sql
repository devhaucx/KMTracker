-- 1. Default Departments
INSERT INTO public.departments (name, code, avatar_color) VALUES
    ('Phòng Ban Giám Đốc', 'BGD', '#FC4C02'),
    ('Phòng IT & Công Nghệ', 'IT', '#3B82F6'),
    ('Phòng Marketing', 'MKT', '#8B5CF6'),
    ('Phòng Kế Toán & Nhân Sự', 'KTNS', '#10B981'),
    ('Phòng Kinh Doanh', 'SALES', '#F59E0B')
ON CONFLICT (code) DO NOTHING;

-- 2. Sample Competition (10/09/2026 - 30/09/2026)
INSERT INTO public.competitions (id, name, invite_code, description, start_date, end_date, registration_deadline, status) VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Giải Thể Thao Mùa Thu 2026',
        'AUTUMN2026',
        'Giải đấu thi đua thể thao giữa các cá nhân và phòng ban mừng thu 2026!',
        '2026-09-10 00:00:00+00',
        '2026-09-30 23:59:59+00',
        '2026-09-09 23:59:59+00',
        'active'
    )
ON CONFLICT (invite_code) DO NOTHING;

-- 3. Default Competition Sports
INSERT INTO public.competition_sports (competition_id, sport_type, display_name, icon, conversion_ratio, min_pace_or_speed, max_pace_or_speed, validation_unit) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Run', 'Chạy bộ', '🏃', 1.0, 4.0, 9.0, 'phút/km'),
    ('11111111-1111-1111-1111-111111111111', 'Walk', 'Đi bộ', '🚶', 1.0, 9.0, 14.0, 'phút/km'),
    ('11111111-1111-1111-1111-111111111111', 'Ride', 'Đạp xe', '🚴', 0.333333, 10.0, 25.0, 'km/h'),
    ('11111111-1111-1111-1111-111111111111', 'Swim', 'Bơi lội', '🏊', 5.0, 2.0, 6.0, 'phút/100m')
ON CONFLICT (competition_id, sport_type) DO NOTHING;
