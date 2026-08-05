-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 1. Departments: Anyone can view departments
CREATE POLICY "Public select departments" ON public.departments
    FOR SELECT USING (true);

-- Admin can manage departments
CREATE POLICY "Admin manage departments" ON public.departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- 2. Users: Anyone can view public user profiles
CREATE POLICY "Public select users" ON public.users
    FOR SELECT USING (true);

-- User can update their own profile
CREATE POLICY "User update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Admin can manage all users
CREATE POLICY "Admin manage users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- 3. Competitions: Anyone can view competitions
CREATE POLICY "Public select competitions" ON public.competitions
    FOR SELECT USING (true);

-- Admin can manage competitions
CREATE POLICY "Admin manage competitions" ON public.competitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- 4. Competition Sports: Anyone can view sports
CREATE POLICY "Public select competition_sports" ON public.competition_sports
    FOR SELECT USING (true);

-- Admin manage competition sports
CREATE POLICY "Admin manage competition_sports" ON public.competition_sports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- 5. Competition Participants: Anyone can view participants
CREATE POLICY "Public select participants" ON public.competition_participants
    FOR SELECT USING (true);

-- User can join competition for themselves
CREATE POLICY "User join competition" ON public.competition_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin manage participants
CREATE POLICY "Admin manage participants" ON public.competition_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- 6. Activities: Anyone can view valid activities (for public leaderboard)
CREATE POLICY "Public select activities" ON public.activities
    FOR SELECT USING (true);

-- Service Role (backend worker) can insert/update activities
CREATE POLICY "Service role write activities" ON public.activities
    FOR ALL USING (auth.role() = 'service_role');

-- Admin manage activities
CREATE POLICY "Admin manage activities" ON public.activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );
