-- Auto-refresh materialized views on activity changes
-- This ensures leaderboard data is always up-to-date

-- Trigger function to refresh views when activity is inserted/updated
CREATE OR REPLACE FUNCTION public.refresh_leaderboard_views()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_individual_leaderboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_department_leaderboard;
END;
$$;

-- Trigger to refresh when activity is inserted
DROP TRIGGER IF EXISTS public trg_refresh_leaderboard_on_activity_insert;
CREATE TRIGGER trg_refresh_leaderboard_on_activity_insert
AFTER INSERT ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.refresh_leaderboard_views();

-- Trigger to refresh when activity is updated (validity/status change)
DROP TRIGGER IF EXISTS public.trg_refresh_leaderboard_on_activity_update;
CREATE TRIGGER trg_refresh_leaderboard_on_activity_update
AFTER UPDATE OF is_valid ON public.activities
FOR EACH ROW
WHEN (OLD.is_valid IS DISTINCT FROM NEW.is_valid)
EXECUTE FUNCTION public.refresh_leaderboard_views();

-- Trigger to refresh when activity is deleted
DROP TRIGGER IF EXISTS public.trg_refresh_leaderboard_on_activity_delete;
CREATE TRIGGER trg_refresh_leaderboard_on_activity_delete
AFTER DELETE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.refresh_leaderboard_views();

-- Trigger to refresh when user joins/leaves department
DROP TRIGGER IF EXISTS public.trg_refresh_leaderboard_on_user_department;
CREATE TRIGGER trg_refresh_leaderboard_on_user_department
AFTER UPDATE OF department_id ON public.users
FOR EACH ROW
WHEN (OLD.department_id IS DISTINCT FROM NEW.department_id)
EXECUTE FUNCTION public.refresh_leaderboard_views();

-- Comment for documentation
COMMENT ON FUNCTION public.refresh_leaderboard_views() IS 'Auto-refresh leaderboard materialized views when activities change';
