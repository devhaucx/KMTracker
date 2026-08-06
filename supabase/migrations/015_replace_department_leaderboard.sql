-- Replace department leaderboard view to show ALL departments
-- Migration 014 was created but this is the clean version that will auto-apply
-- This shows ALL departments for easy comparison, even those with 0 points

-- Step 1: Drop old view and index
DROP MATERIALIZED VIEW IF EXISTS public.mv_department_leaderboard CASCADE;
DROP INDEX IF EXISTS public.idx_mv_dept_unique;

-- Step 2: Create new view with CROSS JOIN to include ALL departments
-- This ensures every department appears in leaderboard, even without activities
CREATE MATERIALIZED VIEW public.mv_department_leaderboard AS
SELECT
    d.id AS department_id,
    d.name AS department_name,
    d.code AS department_code,
    d.avatar_color AS department_color,
    c.id AS competition_id,
    -- Count participants who actually have activities
    COALESCE(COUNT(DISTINCT u.id) FILTER (WHERE a.id IS NOT NULL), 0) AS participant_count,
    -- Sum distances only for valid activities
    COALESCE(SUM(a.distance_converted_km) FILTER (WHERE a.is_valid = TRUE), 0) AS total_converted_km,
    COALESCE(SUM(a.distance_actual_km) FILTER (WHERE a.is_valid = TRUE), 0) AS total_actual_km,
    -- Count only valid activities
    COALESCE(COUNT(a.id) FILTER (WHERE a.is_valid = TRUE), 0) AS total_activities,
    -- Rank all departments, even those with 0 points
    RANK() OVER (
        PARTITION BY c.id
        ORDER BY COALESCE(SUM(a.distance_converted_km) FILTER (WHERE a.is_valid = TRUE), 0) DESC
    ) AS overall_rank
FROM public.departments d
-- Cross join ensures all departments appear for each competition
CROSS JOIN public.competitions c
-- Left joins allow departments without users/activities to still appear
LEFT JOIN public.users u ON u.department_id = d.id
LEFT JOIN public.activities a ON a.user_id = u.id AND a.competition_id = c.id
WHERE c.status = 'active'
GROUP BY d.id, d.name, d.code, d.avatar_color, c.id;

-- Step 3: Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_mv_dept_unique ON public.mv_department_leaderboard (department_id, competition_id);

-- Step 4: Grant permissions
GRANT SELECT ON public.mv_department_leaderboard TO anon, authenticated;

-- Step 5: Add documentation
COMMENT ON MATERIALIZED VIEW public.mv_department_leaderboard IS 'Department leaderboard showing ALL departments for comparison. Departments without activities display 0 points. Updated by migration 015.';

-- Step 6: Verify the view
DO $$
BEGIN
    RAISE NOTICE 'Department leaderboard view recreated successfully';
    RAISE NOTICE 'All departments now visible, including those with 0 points';
END $$;
