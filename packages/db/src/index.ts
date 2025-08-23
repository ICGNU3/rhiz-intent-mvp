import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
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

// Database utilities
export const closeConnection = async () => {
  await client.end();
};
