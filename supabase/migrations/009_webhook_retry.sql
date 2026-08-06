-- Create failed_webhook_events table for retry mechanism
CREATE TABLE IF NOT EXISTS public.failed_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id BIGINT NOT NULL,
    athlete_id BIGINT NOT NULL,
    aspect_type VARCHAR(50) NOT NULL,
    updates JSONB DEFAULT '{}',
    retry_count INT DEFAULT 0,
    last_error TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for retry processing
CREATE INDEX IF NOT EXISTS idx_failed_webhook_status_retry
ON public.failed_webhook_events(status, retry_count, created_at);

CREATE INDEX IF NOT EXISTS idx_failed_webhook_activity
ON public.failed_webhook_events(activity_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_failed_webhook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_failed_webhook_events_updated_at ON public.failed_webhook_events;
CREATE TRIGGER update_failed_webhook_events_updated_at
BEFORE UPDATE ON public.failed_webhook_events
FOR EACH ROW
EXECUTE FUNCTION update_failed_webhook_updated_at();
