#!/bin/bash

# Database setup script for Rhiz MVP
echo "🚀 Setting up Rhiz database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL to your PostgreSQL connection string"
    echo "Example: export DATABASE_URL='postgresql://user:password@localhost:5432/rhiz'"
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
cd packages/db
npm install

# Generate migrations (if needed)
echo "🔄 Generating migrations..."
npx drizzle-kit generate

# Push migrations to database
echo "🗄️  Running migrations..."
npx drizzle-kit push

# Seed the database
echo "🌱 Seeding database..."
npm run seed

echo "✅ Database setup complete!"
echo "You can now run the web app with: npm run dev"
