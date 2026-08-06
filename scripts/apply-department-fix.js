const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://gkdbnpgaibkbmdnktbxt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZGJucGdhaWJrYm1kbmt0Ynh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk4MTE4NywiZXhwIjoyMTAxNTU3MTg3fQ.6Xk4qISvAxuJpWU6IFWtEAvmGBcSx-4VlcJwRScPyfQ'

const fs = require('fs')
const path = require('path')

async function runMigration() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('🔄 Fixing department leaderboard to show ALL departments...')

    console.log('📋 Step 1: Dropping old view...')
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP MATERIALIZED VIEW IF EXISTS public.mv_department_leaderboard CASCADE'
    })

    if (dropError && !dropError.message.includes('does not exist')) {
      console.error('❌ Failed to drop view:', dropError)
    } else {
      console.log('✅ Old view dropped')
    }

    console.log('📋 Step 2: Creating new view with CROSS JOIN...')

    const createViewSQL = `CREATE MATERIALIZED VIEW public.mv_department_leaderboard AS
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
GROUP BY d.id, d.name, d.code, d.avatar_color, c.id;`

    const { data: viewData, error: viewError } = await supabase.rpc('exec_sql', {
      sql: createViewSQL
    })

    if (viewError) {
      console.error('❌ Failed to create view:', viewError)
      throw viewError
    }

    console.log('✅ New view created')

    console.log('📋 Step 3: Creating unique index...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dept_unique ON public.mv_department_leaderboard (department_id, competition_id)'
    })

    if (indexError) {
      console.error('❌ Failed to create index:', indexError)
      throw indexError
    }

    console.log('✅ Index created')

    console.log('📋 Step 4: Granting permissions...')
    const { error: grantError } = await supabase.rpc('exec_sql', {
      sql: 'GRANT SELECT ON public.mv_department_leaderboard TO anon, authenticated'
    })

    if (grantError) {
      console.error('❌ Failed to grant permissions:', grantError)
      throw grantError
    }

    console.log('✅ Permissions granted')

    console.log('\n✅ Migration applied successfully!')
    console.log('📍 All departments now visible, even with 0 points')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('\n💡 Try running SQL manually in Supabase Dashboard:')
    console.error('   1. Go to https://app.supabase.com')
    console.error('   2. Select your project')
    console.error('   3. Click SQL Editor')
    console.error('   4. Copy from: supabase/migrations/014_fix_department_leaderboard.sql')
    console.error('   5. Click Run')
    process.exit(1)
  }
}

runMigration()
