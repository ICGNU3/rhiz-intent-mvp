import { db } from './index';
import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Read and execute the SQL seed file
    const seedPath = join(__dirname, '../../../infra/sql/seed.sql');
    const seedSQL = readFileSync(seedPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = seedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execute(sql.raw(statement));
      }
    }
    
    console.log('✅ Database seeded successfully with demo data!');
    console.log('📊 Created:');
    console.log('   - 1 demo user');
    console.log('   - 3 organizations');
    console.log('   - 5 people');
    console.log('   - 3 encounters');
    console.log('   - 1 goal (raise_seed)');
    console.log('   - 13 claims');
    console.log('   - 3 edges');
    console.log('   - 3 suggestions with drafts');
    console.log('   - 2 tasks');
    console.log('   - 4 event logs');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seed().catch(console.error);
}
