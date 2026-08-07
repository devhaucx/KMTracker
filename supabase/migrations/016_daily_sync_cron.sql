-- Daily sync: backfill activities for all users in active competitions
-- Catches activities missed by webhook (Strava downtime, Worker killed mid-process, etc)
-- Runs at 2:00 AM UTC daily
SELECT cron.schedule(
  'daily-activity-sync',
  '0 2 * * *',
  $$
    SELECT
      net.http_post(
        url := 'https://kmtracker.dev-haucx.workers.dev/api/cron/daily-sync',
        headers := jsonb_build_object('Content-Type', 'application/json')::jsonb,
        body := jsonb_build_object('cron_key', 'FbcY6dE#WBh#Afj')::jsonb
      );
  $$
);
