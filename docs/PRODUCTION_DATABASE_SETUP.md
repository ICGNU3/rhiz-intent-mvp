# Production Database Setup Guide

This guide covers setting up a production PostgreSQL database for Rhiz using either Railway or Neon.

## Option 1: Railway PostgreSQL

Railway provides fully managed PostgreSQL with automatic backups and scaling.

### Setup Steps

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub for easy deployment

2. **Create New Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project in your repo
   railway init
   ```

3. **Add PostgreSQL Service**
   - In Railway dashboard, click "New Service"
   - Select "Database" → "Add PostgreSQL"
   - Railway automatically provisions with:
     - PostgreSQL 15+ with pgvector extension
     - Automatic daily backups
     - Connection pooling

4. **Get Connection String**
   - Click on PostgreSQL service
   - Go to "Variables" tab
   - Copy `DATABASE_URL` (format: `postgresql://user:pass@host:port/db`)

5. **Enable Required Extensions**
   ```sql
   -- Railway PostgreSQL comes with these pre-installed:
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "vector";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   ```

### Railway Configuration

```env
# .env.production (Railway)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway
DATABASE_POOL_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway
```

## Option 2: Neon PostgreSQL

Neon offers serverless PostgreSQL with branching and autoscaling.

### Setup Steps

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up for free tier (includes 0.5 GB storage)

2. **Create Database**
   ```bash
   # Using Neon CLI
   npm install -g neonctl
   neonctl auth
   
   # Create project
   neonctl projects create --name rhiz-production --region us-west-2
   ```

3. **Configure Database**
   - Dashboard → Settings → Enable:
     - ✅ Connection pooling
     - ✅ Autoscaling
     - ✅ Auto-suspend (saves costs)

4. **Get Connection Strings**
   - Dashboard → Connection Details
   - Copy both pooled and direct connections:
     - Pooled: For application queries
     - Direct: For migrations

5. **Enable Extensions**
   ```sql
   -- Connect using direct URL for DDL operations
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "vector";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   ```

### Neon Configuration

```env
# .env.production (Neon)
DATABASE_URL=postgresql://[user]:[password]@[endpoint-pooler].neon.tech/rhiz?sslmode=require
DIRECT_URL=postgresql://[user]:[password]@[endpoint].neon.tech/rhiz?sslmode=require
DATABASE_POOL_URL=postgresql://[user]:[password]@[endpoint-pooler].neon.tech/rhiz?sslmode=require&pool_mode=transaction
```

## Database Migration Setup

### 1. Update Drizzle Config for Production

```typescript
// packages/db/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment-specific config
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

dotenv.config({ path: envFile });

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use DIRECT_URL for migrations (bypasses pooler)
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### 2. Create Production Migration Script

```json
// package.json scripts
{
  "scripts": {
    "db:migrate:prod": "NODE_ENV=production drizzle-kit migrate",
    "db:push:prod": "NODE_ENV=production drizzle-kit push",
    "db:studio:prod": "NODE_ENV=production drizzle-kit studio",
    "db:seed:prod": "NODE_ENV=production tsx packages/db/src/seed.ts"
  }
}
```

### 3. Run Migrations

```bash
# For Railway
railway run pnpm db:migrate:prod

# For Neon (or local with .env.production)
pnpm db:migrate:prod
```

## Connection Pooling Configuration

### Application Connection Pool

```typescript
// packages/db/src/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL;

const sql = postgres(connectionString!, {
  max: process.env.NODE_ENV === 'production' ? 25 : 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30, // 30 minutes
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

export const db = drizzle(sql, { schema });
```

### Worker Connection Pool

```typescript
// packages/workers/src/db.ts
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

// Workers need separate connection pool
const workerSql = postgres(process.env.DATABASE_POOL_URL!, {
  max: 5, // Fewer connections per worker
  idle_timeout: 10,
  ssl: 'require',
});

export const workerDb = drizzle(workerSql);
```

## Security Configuration

### 1. Environment Variables

```env
# .env.production
NODE_ENV=production

# Database (Railway or Neon)
DATABASE_URL=<pooled-connection-string>
DIRECT_URL=<direct-connection-string>
DATABASE_POOL_URL=<pooled-connection-string>

# Security
ENCRYPTION_KEY=<32-character-key>
JWT_SECRET=<strong-secret>

# Redis (Railway or Upstash)
REDIS_URL=redis://default:[password]@[host]:[port]

# OpenAI
OPENAI_API_KEY=sk-<your-key>

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Row-Level Security (RLS)

```sql
-- Ensure RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for multi-tenant isolation
CREATE POLICY "Users can only see their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Workspace members can access workspace data" ON workspaces
  FOR ALL USING (
    id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );
```

### 3. SSL/TLS Configuration

```typescript
// Enforce SSL in production
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false,
};
```

## Monitoring & Maintenance

### Railway Monitoring

- **Metrics**: CPU, Memory, Network in Railway dashboard
- **Logs**: `railway logs` or dashboard logs viewer
- **Backups**: Automatic daily backups (7-day retention on Hobby, 30-day on Pro)

### Neon Monitoring

- **Metrics**: Dashboard → Monitoring tab
- **Query Insights**: Shows slow queries and optimization suggestions
- **Branching**: Create database branches for testing migrations

### Health Checks

```typescript
// app/api/health/db/route.ts
import { db } from '@/packages/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT NOW()`);
    return Response.json({ 
      status: 'healthy',
      timestamp: result.rows[0].now,
      poolSize: process.env.DB_POOL_SIZE || '25'
    });
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy',
      error: error.message 
    }, { status: 503 });
  }
}
```

## Cost Comparison

### Railway
- **Hobby**: $5/month (includes $5 usage)
- **Pro**: $20/month (includes $20 usage)
- **Database**: ~$5-10/month for starter usage
- **Total**: ~$10-15/month

### Neon
- **Free Tier**: 0.5 GB storage, 10 GB bandwidth
- **Pro**: $19/month (includes 10 GB storage, 50 GB bandwidth)
- **Autoscaling**: Pay only for active compute time
- **Total**: $0-19/month

## Deployment Checklist

- [ ] Choose hosting provider (Railway or Neon)
- [ ] Create production database
- [ ] Enable required extensions (uuid-ossp, vector, pg_trgm)
- [ ] Configure connection pooling
- [ ] Set up environment variables
- [ ] Run database migrations
- [ ] Enable RLS policies
- [ ] Configure SSL/TLS
- [ ] Set up monitoring
- [ ] Create backup strategy
- [ ] Test connection from application
- [ ] Verify worker connections
- [ ] Load test connection pool

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check SSL requirement
psql $DATABASE_URL -c "SHOW ssl;"

# Verify extensions
psql $DATABASE_URL -c "SELECT * FROM pg_extension;"
```

### Migration Issues

```bash
# Reset migrations (CAUTION: destroys data)
pnpm drizzle-kit drop

# Generate fresh migration
pnpm drizzle-kit generate

# Apply with verbose output
pnpm drizzle-kit migrate --verbose
```

### Performance Issues

```sql
-- Check slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check connection count
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Next Steps

1. Set up production database
2. Configure environment variables
3. Run migrations
4. Deploy application to Vercel
5. Deploy workers to Railway
6. Set up monitoring and alerts