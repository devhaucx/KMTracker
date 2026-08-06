-- Fix unique constraint for activities to support multiple competitions
-- Drop old constraint and create new composite one

-- First drop the old unique constraint on strava_activity_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'activities_strava_activity_id_key'
  ) THEN
    ALTER TABLE public.activities DROP CONSTRAINT activities_strava_activity_id_key;
  END IF;
END $$;

-- Create new composite unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'activities_user_comp_strava_unique'
  ) THEN
    ALTER TABLE public.activities
    ADD CONSTRAINT activities_user_comp_strava_unique
    UNIQUE (user_id, competition_id, strava_activity_id);
  END IF;
END $$;

-- Add index for better webhook performance
CREATE INDEX IF NOT EXISTS idx_activities_webhook_lookup
ON public.activities(user_id, competition_id, strava_activity_id);

-- Add index for participant lookups
CREATE INDEX IF NOT EXISTS idx_participants_user_comp_status
ON public.competition_participants(user_id, competition_id, status);

-- Add index for active competitions query
CREATE INDEX IF NOT EXISTS idx_competitions_active
ON public.competitions(status, is_deleted) WHERE status = 'active' AND is_deleted = false;
