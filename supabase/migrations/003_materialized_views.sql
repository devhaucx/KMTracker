-- 1. Individual Leaderboard Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_individual_leaderboard AS
SELECT 
    u.id AS user_id,
    u.full_name,
    u.avatar_url,
    u.department_id,
    d.name AS department_name,
    d.code AS department_code,
    d.avatar_color AS department_color,
    a.competition_id,
    a.sport_type,
    SUM(a.distance_converted_km) AS total_converted_km,
    SUM(a.distance_actual_km) AS total_actual_km,
    COUNT(a.id) AS activity_count,
    RANK() OVER (
        PARTITION BY a.competition_id, a.sport_type 
        ORDER BY SUM(a.distance_converted_km) DESC
    ) AS rank_by_sport,
    RANK() OVER (
        PARTITION BY a.competition_id
        ORDER BY SUM(a.distance_converted_km) DESC
    ) AS overall_rank
FROM public.users u
LEFT JOIN public.departments d ON u.department_id = d.id
JOIN public.activities a ON a.user_id = u.id
WHERE a.is_valid = TRUE
GROUP BY u.id, u.full_name, u.avatar_url, u.department_id, d.name, d.code, d.avatar_color, a.competition_id, a.sport_type;

-- Unique Index required for CONCURRENTLY refreshing
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_indiv_unique ON public.mv_individual_leaderboard (user_id, competition_id, sport_type);

-- 2. Department Leaderboard Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_department_leaderboard AS
SELECT 
    d.id AS department_id,
    d.name AS department_name,
    d.code AS department_code,
    d.avatar_color AS department_color,
    a.competition_id,
    COUNT(DISTINCT u.id) AS participant_count,
    SUM(a.distance_converted_km) AS total_converted_km,
    SUM(a.distance_actual_km) AS total_actual_km,
    COUNT(a.id) AS total_activities,
    RANK() OVER (
        PARTITION BY a.competition_id 
        ORDER BY SUM(a.distance_converted_km) DESC
    ) AS overall_rank
FROM public.departments d
JOIN public.users u ON u.department_id = d.id
JOIN public.activities a ON a.user_id = u.id
WHERE a.is_valid = TRUE
GROUP BY d.id, d.name, d.code, d.avatar_color, a.competition_id;

-- Unique Index for Department View
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dept_unique ON public.mv_department_leaderboard (department_id, competition_id);
