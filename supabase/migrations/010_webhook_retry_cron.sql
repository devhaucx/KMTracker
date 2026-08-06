-- Cron job to retry failed webhook events every 5 minutes
SELECT cron.schedule(
  'retry-failed-webhooks',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url := format('%s/api/cron/retry-webhooks', current_setting('app.base_url')),
      headers := jsonb_build_object('Content-Type', 'application/json')::jsonb,
      body := jsonb_build_object('cron_key', current_setting('app.cron_secret'))::jsonb
    );
  $$
);
