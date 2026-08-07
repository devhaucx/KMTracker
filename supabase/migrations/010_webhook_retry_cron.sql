-- Cron job to retry failed webhook events every 5 minutes
SELECT cron.schedule(
  'retry-failed-webhooks',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://kmtracker.dev-haucx.workers.dev/api/cron/retry-webhooks',
      headers := jsonb_build_object('Content-Type', 'application/json')::jsonb,
      body := jsonb_build_object('cron_key', 'FbcY6dE#WBh#Afj')::jsonb
    );
  $$
);
