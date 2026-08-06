-- =====================================================
-- Migration 006: Security Fixes & Schema Completion
-- =====================================================

-- 1. Soft-delete columns on competitions (types already reference these)
ALTER TABLE public.competitions
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Public user profiles view (excludes Strava tokens)
--    Frontend reads this instead of the raw users table.
CREATE OR REPLACE VIEW public.public_user_profiles AS
SELECT
    id,
    email,
    full_name,
    avatar_url,
    department_id,
    strava_athlete_id,
    role,
    is_profile_complete,
    created_at
FROM public.users;

-- 3. Tighten users RLS: only self or admin can SELECT from raw users table
--    (public reads go through public_user_profiles view, which inherits no RLS
--     on a view by default — we grant SELECT to anon/authenticated explicitly)
DROP POLICY IF EXISTS "Public select users" ON public.users;

CREATE POLICY "Users select self or admin" ON public.users
    FOR SELECT USING (
        auth.uid() = id
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- 4. Activity audit log table
CREATE TABLE IF NOT EXISTS public.activity_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.users(id),
    action VARCHAR(50) NOT NULL CHECK (
        action IN ('APPROVED', 'REJECTED', 'MANUAL_SYNC', 'BULK_APPROVED', 'BULK_REJECTED')
    ),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_activity ON public.activity_audit_logs(activity_id);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON public.activity_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.activity_audit_logs(created_at DESC);

ALTER TABLE public.activity_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read audit logs" ON public.activity_audit_logs
    FOR SELECT USING (true);

CREATE POLICY "Admin write audit logs" ON public.activity_audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- 5. Grant access to the public_user_profiles view
GRANT SELECT ON public.public_user_profiles TO anon, authenticated;
