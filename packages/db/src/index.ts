import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, desc, sql } from 'drizzle-orm';
import * as schema from './schema';

// Database connection with production pooling
const connectionString = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' 
    ? parseInt(process.env.DB_POOL_MAX || '25') 
    : 10,
  idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '20'),
  max_lifetime: parseInt(process.env.DB_MAX_LIFETIME || '1800'),
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false,
});

export const db = drizzle(client, { schema });

// RLS helper for setting user context
export const setUserContext = async (userId: string) => {
  await client`SELECT set_config('app.current_user_id', ${userId}, true)`;
};

// RLS helper for getting current user
export const getCurrentUser = async () => {
  const result = await client`SELECT current_setting('app.current_user_id', true) as user_id`;
  return result[0]?.user_id;
};

// Export all schema tables
export * from './schema';

// Export drizzle functions
export { eq, and, desc, sql };

// Database utilities
export const closeConnection = async () => {
  await client.end();
};
