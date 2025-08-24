# Database Setup Guide

## Quick Setup

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql
   
   # Or use Docker
   docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
   ```

2. **Create the database**:
   ```bash
   createdb rhiz
   ```

3. **Set environment variables**:
   ```bash
   export DATABASE_URL="postgresql://postgres:password@localhost:5432/rhiz"
   export ENCRYPTION_KEY="dGVzdC1lbmNyeXB0aW9uLWtleS1mb3ItZGV2ZWxvcG1lbnQ="
   ```

4. **Run the setup script**:
   ```bash
   ./setup-db.sh
   ```

5. **Start the web app**:
   ```bash
   cd apps/web
   npm run dev
   ```

## Alternative: Use Supabase (Recommended for development)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Get your database URL from Settings > Database
4. Set the environment variable:
   ```bash
   export DATABASE_URL="your-supabase-database-url"
   ```
5. Run the setup script

## Environment Variables

Create a `.env.local` file in `apps/web/` with:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/rhiz
ENCRYPTION_KEY=dGVzdC1lbmNyeXB0aW9uLWtleS1mb3ItZGV2ZWxvcG1lbnQ=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Troubleshooting

- If you get connection errors, make sure PostgreSQL is running
- If you get permission errors, check your database user permissions
- For Supabase, make sure to use the connection string from the dashboard
