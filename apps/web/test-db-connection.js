// Load environment variables
require('dotenv').config({ path: '.env.local' });

const postgres = require('postgres');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not set!');
      return false;
    }
    
    // Create a direct connection with proper options
    const sql = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    });
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful!');
    console.log('Current time from DB:', result[0].current_time);
    
    // Test schema tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📋 Available tables:');
    tables.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Close connection
    await sql.end();
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('🎉 Database test completed successfully!');
    } else {
      console.log('💥 Database test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
