-- Enable pg_cron and pg_net extension if supported in Supabase environment
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule leaderboard refresh every 1 minute
SELECT cron.schedule(
    'refresh-leaderboard-job',
    '* * * * *',
    'SELECT public.refresh_leaderboard_views()'
);
