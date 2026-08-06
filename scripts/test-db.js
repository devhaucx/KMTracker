const { Client } = require('pg')

const client = new Client({
  connectionString: 'postgresql://postgres:Anhsang123!@db.gkdbnpgaibkbmdnktbxt.supabase.co:5432/postgres',
})

async function testConnection() {
  try {
    console.log('🔗 Testing database connection...')

    const result = await client.query('SELECT 1')
    console.log('✅ Connection successful!')

    // Check if triggers already exist
    const triggers = await client.query(`
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE trigger_name LIKE '%leaderboard%'
      ORDER BY trigger_name
    `)

    console.log(`📋 Current leaderboard triggers: ${triggers.rows.length}`)
    triggers.rows.forEach(row => {
      console.log(`   - ${row.trigger_name}`)
    })

    if (triggers.rows.length === 0) {
      console.log('⚠️  No triggers found - migration needs to be applied')
    } else {
      console.log('✅ Triggers already exist!')
    }

    await client.end()
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    process.exit(1)
  }
}

testConnection()
