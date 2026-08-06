-- Fix department leaderboard to show ALL departments, even those without activities
-- This makes it easier to compare departments

-- Drop old view
DROP MATERIALIZED VIEW IF EXISTS public.mv_department_leaderboard;

-- Create new view with LEFT JOIN to include all departments
CREATE MATERIALIZED VIEW public.mv_department_leaderboard AS
SELECT
    d.id AS department_id,
    d.name AS department_name,
    d.code AS department_code,
    d.avatar_color AS department_color,
    c.id AS competition_id,
    COALESCE(COUNT(DISTINCT u.id) FILTER (WHERE a.id IS NOT NULL), 0) AS participant_count,
    COALESCE(SUM(a.distance_converted_km) FILTER (WHERE a.is_valid = TRUE), 0) AS total_converted_km,
    COALESCE(SUM(a.distance_actual_km) FILTER (WHERE a.is_valid = TRUE), 0) AS total_actual_km,
    COALESCE(COUNT(a.id) FILTER (WHERE a.is_valid = TRUE), 0) AS total_activities,
    RANK() OVER (
        PARTITION BY c.id
        ORDER BY COALESCE(SUM(a.distance_converted_km) FILTER (WHERE a.is_valid = TRUE), 0) DESC
    ) AS overall_rank
FROM public.departments d
CROSS JOIN public.competitions c
LEFT JOIN public.users u ON u.department_id = d.id
LEFT JOIN public.activities a ON a.user_id = u.id AND a.competition_id = c.id
WHERE c.status = 'active'
GROUP BY d.id, d.name, d.code, d.avatar_color, c.id;

-- Recreate unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dept_unique ON public.mv_department_leaderboard (department_id, competition_id);

-- Grant permissions
GRANT SELECT ON public.mv_department_leaderboard TO anon, authenticated;

-- Add comment
COMMENT ON MATERIALIZED VIEW public.mv_department_leaderboard IS 'Department leaderboard showing ALL departments, even those without activities (0 points)';
