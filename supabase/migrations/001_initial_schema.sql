-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    avatar_color VARCHAR(20) DEFAULT '#FC4C02',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    strava_athlete_id BIGINT UNIQUE,
    strava_access_token TEXT,
    strava_refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    is_profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Competitions Table
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    invite_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ NOT NULL,
    scoring_rules JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'registration', 'active', 'ended')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Competition Sports Table
CREATE TABLE IF NOT EXISTS public.competition_sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    sport_type VARCHAR(50) NOT NULL CHECK (sport_type IN ('Run', 'Walk', 'Ride', 'Swim')),
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    conversion_ratio FLOAT NOT NULL DEFAULT 1.0,
    min_pace_or_speed FLOAT NOT NULL,
    max_pace_or_speed FLOAT NOT NULL,
    validation_unit VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(competition_id, sport_type)
);

-- 5. Competition Participants Table
CREATE TABLE IF NOT EXISTS public.competition_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'withdrawn')),
    UNIQUE(user_id, competition_id)
);

-- 6. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    competition_sport_id UUID REFERENCES public.competition_sports(id) ON DELETE SET NULL,
    strava_activity_id BIGINT UNIQUE NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    distance_actual_km FLOAT NOT NULL DEFAULT 0.0,
    distance_converted_km FLOAT NOT NULL DEFAULT 0.0,
    moving_time_seconds INT NOT NULL DEFAULT 0,
    pace_or_speed FLOAT NOT NULL DEFAULT 0.0,
    start_date TIMESTAMPTZ NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    rejection_reason VARCHAR(255),
    sync_status VARCHAR(50) DEFAULT 'processed' CHECK (sync_status IN ('pending', 'processed', 'failed')),
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_strava_id ON public.users(strava_athlete_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_competition ON public.activities(competition_id);
CREATE INDEX IF NOT EXISTS idx_activities_sport ON public.activities(sport_type);
CREATE INDEX IF NOT EXISTS idx_activities_valid_date ON public.activities(is_valid, start_date);
CREATE INDEX IF NOT EXISTS idx_participants_user_comp ON public.competition_participants(user_id, competition_id);
