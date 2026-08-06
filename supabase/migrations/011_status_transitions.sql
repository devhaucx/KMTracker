-- Automated competition status transitions cron job
-- Run every hour to check and update competition statuses

CREATE OR REPLACE FUNCTION update_competition_statuses()
RETURNS void AS $$
BEGIN
  -- Update 'draft' competitions to 'registration' if registration deadline is approaching
  UPDATE public.competitions
  SET status = 'registration'
  WHERE status = 'draft'
    AND is_deleted = false
    AND start_date > NOW()
    AND registration_deadline > NOW()
    AND registration_deadline <= NOW() + INTERVAL '7 days'; -- 7 days before start

  -- Update 'registration' competitions to 'active' when start date is reached
  UPDATE public.competitions
  SET status = 'active'
  WHERE status = 'registration'
    AND is_deleted = false
    AND start_date <= NOW();

  -- Update 'active' competitions to 'ended' when end date is passed
  UPDATE public.competitions
  SET status = 'ended'
  WHERE status = 'active'
    AND is_deleted = false
    AND end_date < NOW();

  -- Log status changes
  INSERT INTO public.competition_status_logs (competition_id, old_status, new_status, changed_at)
  SELECT
    id,
    CASE
      WHEN status = 'registration' THEN 'draft'
      WHEN status = 'active' THEN 'registration'
      WHEN status = 'ended' THEN 'active'
      ELSE status
    END,
    status,
    NOW()
  FROM public.competitions
  WHERE is_deleted = false
    AND status IN ('registration', 'active', 'ended')
    AND (
      (status = 'registration' AND id IN (
        SELECT id FROM public.competitions WHERE status = 'draft'
        AND is_deleted = false
        AND start_date > NOW()
        AND registration_deadline > NOW()
        AND registration_deadline <= NOW() + INTERVAL '7 days'
      ))
      OR
      (status = 'active' AND id IN (
        SELECT id FROM public.competitions WHERE status = 'registration'
        AND is_deleted = false
        AND start_date <= NOW()
      ))
      OR
      (status = 'ended' AND id IN (
        SELECT id FROM public.competitions WHERE status = 'active'
        AND is_deleted = false
        AND end_date < NOW()
      ))
    );
END;
$$ LANGUAGE plpgsql;

-- Schedule cron job to run every hour
SELECT cron.schedule(
  'update-competition-statuses',
  '0 * * * *', -- Every hour at minute 0
  'SELECT update_competition_statuses();'
);
