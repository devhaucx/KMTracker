-- Fix individual leaderboard: support both overall (ALL) and per-sport ranking
-- Old MV grouped by sport_type only, so overall_rank was actually per-sport rank
-- New MV adds sport_type='ALL' rows with true overall ranking

DROP MATERIALIZED VIEW IF EXISTS public.mv_individual_leaderboard CASCADE;

CREATE MATERIALIZED VIEW public.mv_individual_leaderboard AS
WITH sport_totals AS (
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
        COUNT(a.id) AS activity_count
    FROM public.users u
    LEFT JOIN public.departments d ON u.department_id = d.id
    JOIN public.activities a ON a.user_id = u.id
    WHERE a.is_valid = TRUE
    GROUP BY u.id, u.full_name, u.avatar_url, u.department_id,
             d.name, d.code, d.avatar_color, a.competition_id, a.sport_type
),
combined AS (
    SELECT * FROM sport_totals
    UNION ALL
    SELECT
        user_id, full_name, avatar_url, department_id,
        department_name, department_code, department_color,
        competition_id, 'ALL' AS sport_type,
        SUM(total_converted_km) AS total_converted_km,
        SUM(total_actual_km) AS total_actual_km,
        SUM(activity_count) AS activity_count
    FROM sport_totals
    GROUP BY user_id, full_name, avatar_url, department_id,
             department_name, department_code, department_color, competition_id
)
SELECT
    *,
    RANK() OVER (
        PARTITION BY competition_id, sport_type
        ORDER BY total_converted_km DESC
    ) AS rank_by_sport,
    RANK() OVER (
        PARTITION BY competition_id
        ORDER BY CASE WHEN sport_type = 'ALL' THEN total_converted_km END DESC NULLS LAST
    ) AS overall_rank
FROM combined;

CREATE UNIQUE INDEX idx_mv_indiv_unique
    ON public.mv_individual_leaderboard (user_id, competition_id, sport_type);

GRANT SELECT ON public.mv_individual_leaderboard TO anon, authenticated;

COMMENT ON MATERIALIZED VIEW public.mv_individual_leaderboard IS 'Individual leaderboard with sport_type=ALL (overall) and per-sport rows. overall_rank only meaningful for ALL rows.';
