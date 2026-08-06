-- Create competition status logs table
CREATE TABLE IF NOT EXISTS public.competition_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying status history
CREATE INDEX IF NOT EXISTS idx_status_logs_competition
ON public.competition_status_logs(competition_id, changed_at);

-- Index for recent status changes
CREATE INDEX IF NOT EXISTS idx_status_logs_recent
ON public.competition_status_logs(changed_at DESC);
