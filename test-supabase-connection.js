// Test Supabase connection using the client
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://whdwzrnyubpexjtjzcwh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZHd6cm55dWJwZXhqdGp6Y3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDEyODgsImV4cCI6MjA3MTAxNzI4OH0.PXi6cHy9nqPW-jk5ynnq7igXjUQZBKD1wrDTsSgKBnY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test a simple query to check if we can connect
    const { data, error } = await supabase
      .from('workspace')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connected to Supabase successfully!');
    console.log('📋 Workspace table accessible');
    console.log(`📊 Found ${data ? data.length : 0} workspace records`);
    
    // Test another table
    const { data: personData, error: personError } = await supabase
      .from('person')
      .select('*')
      .limit(1);
    
    if (!personError) {
      console.log('✅ Person table accessible');
      console.log(`📊 Found ${personData ? personData.length : 0} person records`);
    }
    
    console.log('\n🎉 Supabase connection test successful!');
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  }
}

testSupabaseConnection();
