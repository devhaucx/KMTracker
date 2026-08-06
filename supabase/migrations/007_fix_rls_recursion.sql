-- =====================================================
-- Migration 007: Fix RLS Infinite Recursion + Grant Privileges
-- =====================================================
-- Problem: "Users select self or admin" policy on users table
-- has a subquery SELECT 1 FROM users WHERE ... which triggers
-- RLS on users → infinite recursion. ALL other tables that
-- subquery users to check admin role also break.
--
-- Fix: Create a SECURITY DEFINER function that bypasses RLS
-- to check admin status, then use it in all policies.

-- 1. Drop the recursive policy on users
DROP POLICY IF EXISTS "Users select self or admin" ON public.users;

-- 2. Create SECURITY DEFINER function (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
    )
$$;

-- 3. Recreate users SELECT policy using is_admin()
CREATE POLICY "Users select self or admin" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR public.is_admin()
    );

-- 4. Recreate users UPDATE policy using is_admin()
DROP POLICY IF EXISTS "User update own profile" ON public.users;
CREATE POLICY "User update own profile" ON public.users
    FOR UPDATE USING (
        auth.uid() = id OR public.is_admin()
    );

-- 5. Recreate users admin policy
DROP POLICY IF EXISTS "Admin manage users" ON public.users;
CREATE POLICY "Admin manage users" ON public.users
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Fix all other tables that subquery users

-- Departments
DROP POLICY IF EXISTS "Admin manage departments" ON public.departments;
CREATE POLICY "Admin manage departments" ON public.departments
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Competitions
DROP POLICY IF EXISTS "Admin manage competitions" ON public.competitions;
CREATE POLICY "Admin manage competitions" ON public.competitions
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Competition Sports
DROP POLICY IF EXISTS "Admin manage competition_sports" ON public.competition_sports;
CREATE POLICY "Admin manage competition_sports" ON public.competition_sports
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Competition Participants
DROP POLICY IF EXISTS "Admin manage participants" ON public.competition_participants;
CREATE POLICY "Admin manage participants" ON public.competition_participants
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Activities
DROP POLICY IF EXISTS "Admin manage activities" ON public.activities;
CREATE POLICY "Admin manage activities" ON public.activities
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Activity Audit Logs
DROP POLICY IF EXISTS "Admin write audit logs" ON public.activity_audit_logs;
CREATE POLICY "Admin write audit logs" ON public.activity_audit_logs
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 7. Grant privileges to anon and authenticated roles
--    (required since newer Supabase doesn't auto-expose tables)
GRANT SELECT ON public.departments TO anon, authenticated;
GRANT SELECT ON public.competitions TO anon, authenticated;
GRANT SELECT ON public.competition_sports TO anon, authenticated;
GRANT SELECT ON public.competition_participants TO anon, authenticated;
GRANT SELECT ON public.activities TO anon, authenticated;
GRANT SELECT ON public.activity_audit_logs TO anon, authenticated;

-- Users can read/insert/update their own participant records
GRANT INSERT ON public.competition_participants TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competition_sports TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competition_participants TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_audit_logs TO service_role;

-- 8. Grant SELECT on materialized views to anon and authenticated
GRANT SELECT ON public.mv_individual_leaderboard TO anon, authenticated;
GRANT SELECT ON public.mv_department_leaderboard TO anon, authenticated;
