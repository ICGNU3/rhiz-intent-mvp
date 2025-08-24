#!/bin/bash

# Setup environment variables for Rhiz MVP with Supabase
echo "🚀 Setting up environment for Rhiz MVP..."

# Get the database password from user
echo "Please enter your Supabase database password:"
read -s DB_PASSWORD

# Set environment variables
export DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@db.whdwzrnyubpexjtjzcwh.supabase.co:5432/postgres"
export ENCRYPTION_KEY="dGVzdC1lbmNyeXB0aW9uLWtleS1mb3ItZGV2ZWxvcG1lbnQ="

echo "✅ Environment variables set:"
echo "DATABASE_URL: postgresql://postgres:***@db.whdwzrnyubpexjtjzcwh.supabase.co:5432/postgres"
echo "ENCRYPTION_KEY: dGVzdC1lbmNyeXB0aW9uLWtleS1mb3ItZGV2ZWxvcG1lbnQ="

# Create .env.local for the web app
cat > apps/web/.env.local << EOF
DATABASE_URL=${DATABASE_URL}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "✅ Created apps/web/.env.local"

# Run database setup
echo "🗄️  Setting up database..."
cd packages/db
npx drizzle-kit push:pg

echo "🌱 Seeding database..."
npm run seed

echo "✅ Setup complete! You can now run: cd apps/web && npm run dev"
