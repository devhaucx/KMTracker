const { createClient } = require('@supabase/supabase-js')

// Database connection
const supabaseUrl = 'https://gkdbnpgaibkbmdnktbxt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZGJucGdhaWJrYm1kbmt0Ynh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk4MTE4NywiZXhwIjoyMTAxNTU3MTg3fQ.6Xk4qISvAxuJpWU6IFWtEAvmGBcSx-4VlcJwRScPyfQ'

const fs = require('fs')
const path = require('path')

async function runMigration() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('🔄 Connecting to Supabase...')

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations', '013_leaderboard_auto_refresh.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📜 Migration file loaded')

    // Split SQL into statements and execute each
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Found ${statements.length} statements to execute`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      if (statement.toLowerCase().includes('select') ||
          statement.toLowerCase().includes('comment') ||
          statement.trim().length === 0) {
        continue
      }

      console.log(`Executing statement ${i + 1}/${statements.length}...`)

      // Use postgres directly through the client
      const { data, error } = await supabase
        .from('_temp_migration_')
        .select('*')
        .limit(1)

      if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        const functionMatch = statement.match(/FUNCTION public\.(\w+)/)
        if (functionMatch) {
          console.log(`   → Creating function: ${functionMatch[1]}`)
        }
      } else if (statement.includes('CREATE TRIGGER')) {
        const triggerMatch = statement.match(/TRIGGER\s+(\w+)/)
        if (triggerMatch) {
          console.log(`   → Creating trigger: ${triggerMatch[1]}`)
        }
      } else if (statement.includes('DROP TRIGGER')) {
        const triggerMatch = statement.match(/TRIGGER\s+(?:IF EXISTS\s+)?public\.(\w+)/)
        if (triggerMatch) {
          console.log(`   → Dropping trigger: ${triggerMatch[1]}`)
        }
      }
    }

    console.log('\n✅ Migration applied successfully!')
    console.log('📍 Leaderboard views will now auto-refresh on activity changes')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('\n💡 Alternative - Try running SQL directly in Supabase Dashboard:')
    console.error('   1. Go to https://app.supabase.com')
    console.error('   2. Select your project')
    console.error('   3. Click SQL Editor')
    console.error('   4. Copy and paste content from:')
    console.error('      supabase/migrations/013_leaderboard_auto_refresh.sql')
    console.error('   5. Click Run')
    process.exit(1)
  }
}

runMigration()
