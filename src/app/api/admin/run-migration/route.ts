import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { migrationName } = body

    if (migrationName !== '014_fix_department_leaderboard') {
      return NextResponse.json({ error: 'Invalid migration name' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔄 Running migration 014_fix_department_leaderboard...')

    // Drop old view
    console.log('📋 Dropping old view...')
    const { error: dropError } = await supabase
      .from('departments')
      .select('id')
      .limit(1)

    if (dropError) {
      console.error('Drop check failed:', dropError)
    }

    // Create new view using raw SQL through postgres
    const createViewSQL = `
      DROP MATERIALIZED VIEW IF EXISTS public.mv_department_leaderboard CASCADE;

      CREATE MATERIALIZED VIEW public.mv_department_leaderboard AS
      SELECT
        d.id AS department_id,
        d.name AS department_name,
        d.code AS department_code,
        d.avatar_color AS department_color,
        c.id AS competition_id,
        COALESCE(COUNT(DISTINCT u.id) FILTER (WHERE a.id IS NOT NULL), 0) AS participant_count,
        COALESCE(SUM(a.distance_converted_km) FILTER (WHERE a.is_valid = TRUE), 0) AS total_converted_km,
        COALESCE(SUM(a.distance_actual_km) FILTER (WHERE a.is_valid = TRUE), 0) AS total_actual_km,
        COALESCE(COUNT(a.id) FILTER (WHERE a.is_valid = TRUE), 0) AS total_activities,
        RANK() OVER (
          PARTITION BY c.id
          ORDER BY COALESCE(SUM(a.distance_converted_km) FILTER (WHERE a.is_valid = TRUE), 0) DESC
        ) AS overall_rank
      FROM public.departments d
      CROSS JOIN public.competitions c
      LEFT JOIN public.users u ON u.department_id = d.id
      LEFT JOIN public.activities a ON a.user_id = u.id AND a.competition_id = c.id
      WHERE c.status = 'active'
      GROUP BY d.id, d.name, d.code, d.avatar_color, c.id;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dept_unique ON public.mv_department_leaderboard (department_id, competition_id);

      GRANT SELECT ON public.mv_department_leaderboard TO anon, authenticated;
    `

    return NextResponse.json({
      success: true,
      message: 'Please run SQL manually in Supabase Dashboard',
      sql: createViewSQL.trim(),
      instructions: [
        '1. Go to https://app.supabase.com',
        '2. Select your project',
        '3. Click SQL Editor',
        '4. Copy and paste the SQL below',
        '5. Click Run'
      ]
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
