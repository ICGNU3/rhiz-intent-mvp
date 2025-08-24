// Test database connection
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:AeL2SMXpTyywuJaYKFOL4xxL2ZAFyrIQGB2T6vua4j0@db.whdwzrnyubpexjtjzcwh.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    const client = await pool.connect();
    console.log('✅ Connected to database successfully!');
    
    // Test query to list tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Found tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log(`\n🎉 Database test successful! Found ${result.rows.length} tables.`);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
