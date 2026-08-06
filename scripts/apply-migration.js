const { Client } = require('pg')

const client = new Client({
  connectionString: 'postgresql://postgres:Anhsang123!@db.gkdbnpgaibkbmdnktbxt.supabase.co:5432/postgres',
  connectionTimeoutMillis: 10000,
})

const fs = require('fs')
const path = require('path')

async function runMigration() {
  let client
  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations', '013_leaderboard_auto_refresh.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📜 Migration file loaded')

    // Drop existing triggers if any (for re-running)
    console.log('🧹 Cleaning up existing triggers...')
    await client.query(`DROP TRIGGER IF EXISTS public.trg_refresh_leaderboard_on_activity_insert ON public.activities`)
    await client.query(`DROP TRIGGER IF EXISTS public.trg_refresh_leaderboard_on_activity_update ON public.activities`)
    await client.query(`DROP TRIGGER IF EXISTS public.trg_refresh_leaderboard_on_activity_delete ON public.activities`)
    await client.query(`DROP TRIGGER IF EXISTS public.trg_refresh_leaderboard_on_user_department ON public.users`)
    console.log('✅ Cleaned up')

    // Drop function if exists
    await client.query(`DROP FUNCTION IF EXISTS public.refresh_leaderboard_views() CASCADE`)
    console.log('✅ Dropped old function')

    // Split by semicolon and filter
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Found ${statements.length} statements to execute`)

    let executedCount = 0
    for (const statement of statements) {
      try {
        await client.query(statement)
        executedCount++
      } catch (err) {
          console.error(`❌ Error executing statement: ${statement.substring(0, 60)}...`)
          console.error(`   Error: ${err.message}`)
          throw err
      }
    }

    console.log(`✅ Executed ${executedCount} statements successfully`)

    // Verify triggers created
    const result = await client.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_name LIKE '%leaderboard%'
      ORDER BY trigger_name
    `)

    console.log(`📋 Triggers created (${result.rows.length}):`)
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.trigger_name} on ${row.event_object_table}`)
    })

    console.log('\n🎉 Migration applied successfully!')
    console.log('📍 Leaderboard will now auto-refresh when activities are added/updated!')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('\n💡 Troubleshooting:')
    console.error('   1. Check DATABASE_URL is correct')
    console.error('   2. Check migration file exists: supabase/migrations/013_leaderboard_auto_refresh.sql')
    console.error('   3. Check you have proper permissions (CREATE TRIGGER privilege)')
    console.error('\n📋 To try again, fix the issue above and re-run this script.')
    process.exit(1)
  } finally {
    if (client) {
      await client.end()
      console.log('🔌 Database connection closed')
    }
  }
}

runMigration()
