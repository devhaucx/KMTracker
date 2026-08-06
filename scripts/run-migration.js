const { Client } = require('pg')

const client = new Client({
  connectionString: 'postgresql://postgres:Anhsang123!@db.gkdbnpgaibkbmdnktbxt.supabase.co:5432/postgres',
})

const fs = require('fs')
const path = require('path')

async function runMigration() {
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/013_leaderboard_auto_refresh.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🔄 Applying migration 013_leaderboard_auto_refresh.sql...')

    // Split and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.includes('TRIGGER') || statement.includes('FUNCTION')) {
        console.log(`Executing: ${statement.substring(0, 60)}...`)
        await client.query(statement)
      }
    }

    console.log('✅ Migration applied successfully!')

    // Verify triggers
    const result = await client.query(`
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE event_object_table = 'activities'
        AND trigger_name LIKE '%leaderboard%'
      ORDER BY trigger_name
    `)

    console.log('📋 Triggers created:')
    result.rows.forEach(row => {
      console.log(`   - ${row.trigger_name}`)
    })

    await client.end()
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('\n💡 Tip: Check if:')
    console.error('   1. Database connection is correct')
    console.error('   2. Migration file exists at supabase/migrations/013_leaderboard_auto_refresh.sql')
    console.error('   3. You have proper permissions')
    process.exit(1)
  }
}

runMigration()
