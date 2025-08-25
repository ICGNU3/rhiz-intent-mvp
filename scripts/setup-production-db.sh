#!/bin/bash

# Production Database Setup Script
# This script helps set up either Railway or Neon PostgreSQL for production

set -e

echo "🚀 Rhiz Production Database Setup"
echo "================================="
echo ""

# Check if .env.production exists
if [ -f ".env.production" ]; then
    echo "⚠️  .env.production already exists. Loading existing configuration..."
    source .env.production
else
    echo "📝 Creating .env.production from template..."
    cp .env.production.example .env.production
fi

# Select database provider
echo "Select your database provider:"
echo "1) Railway PostgreSQL"
echo "2) Neon PostgreSQL"
echo "3) Custom PostgreSQL"
read -p "Enter choice (1-3): " DB_CHOICE

case $DB_CHOICE in
    1)
        echo ""
        echo "🚂 Setting up Railway PostgreSQL..."
        echo ""
        echo "Please follow these steps:"
        echo "1. Go to https://railway.app and create an account"
        echo "2. Create a new project and add PostgreSQL"
        echo "3. Copy the DATABASE_URL from the Variables tab"
        echo ""
        read -p "Enter your Railway DATABASE_URL: " RAILWAY_URL
        
        # Update .env.production
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$RAILWAY_URL|g" .env.production
        sed -i.bak "s|DATABASE_POOL_URL=.*|DATABASE_POOL_URL=$RAILWAY_URL?pgbouncer=true\&pool_mode=transaction|g" .env.production
        sed -i.bak "s|DIRECT_URL=.*|DIRECT_URL=$RAILWAY_URL|g" .env.production
        
        echo "✅ Railway configuration saved!"
        ;;
        
    2)
        echo ""
        echo "🔮 Setting up Neon PostgreSQL..."
        echo ""
        echo "Please follow these steps:"
        echo "1. Go to https://neon.tech and create an account"
        echo "2. Create a new project"
        echo "3. Copy both the pooled and direct connection strings"
        echo ""
        read -p "Enter your Neon POOLED connection string: " NEON_POOLED
        read -p "Enter your Neon DIRECT connection string: " NEON_DIRECT
        
        # Update .env.production
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$NEON_POOLED|g" .env.production
        sed -i.bak "s|DATABASE_POOL_URL=.*|DATABASE_POOL_URL=$NEON_POOLED|g" .env.production
        sed -i.bak "s|DIRECT_URL=.*|DIRECT_URL=$NEON_DIRECT|g" .env.production
        
        echo "✅ Neon configuration saved!"
        ;;
        
    3)
        echo ""
        echo "⚙️  Custom PostgreSQL setup..."
        echo ""
        read -p "Enter your DATABASE_URL: " CUSTOM_URL
        
        # Update .env.production
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$CUSTOM_URL|g" .env.production
        sed -i.bak "s|DATABASE_POOL_URL=.*|DATABASE_POOL_URL=$CUSTOM_URL|g" .env.production
        sed -i.bak "s|DIRECT_URL=.*|DIRECT_URL=$CUSTOM_URL|g" .env.production
        
        echo "✅ Custom database configuration saved!"
        ;;
        
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

# Generate security keys if needed
echo ""
echo "🔐 Checking security keys..."

if grep -q "ENCRYPTION_KEY=\[32-character-encryption-key\]" .env.production; then
    echo "Generating ENCRYPTION_KEY..."
    ENCRYPTION_KEY=$(openssl rand -hex 16)
    sed -i.bak "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|g" .env.production
fi

if grep -q "JWT_SECRET=\[strong-jwt-secret\]" .env.production; then
    echo "Generating JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env.production
fi

if grep -q "NEXTAUTH_SECRET=\[strong-nextauth-secret\]" .env.production; then
    echo "Generating NEXTAUTH_SECRET..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|g" .env.production
fi

# Clean up backup files
rm -f .env.production.bak

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🗄️  Setting up database..."
echo ""

# Test database connection
echo "Testing database connection..."
NODE_ENV=production node -e "
const postgres = require('postgres');
const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL);
sql\`SELECT version()\`.then(result => {
    console.log('✅ Database connected successfully!');
    console.log('PostgreSQL version:', result[0].version);
    process.exit(0);
}).catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
});
"

if [ $? -ne 0 ]; then
    echo "❌ Could not connect to database. Please check your connection string."
    exit 1
fi

# Run migrations
echo ""
read -p "Do you want to run database migrations now? (y/n): " RUN_MIGRATIONS

if [ "$RUN_MIGRATIONS" = "y" ]; then
    echo "Running migrations..."
    pnpm db:migrate:prod
    echo "✅ Migrations complete!"
fi

# Seed database
echo ""
read -p "Do you want to seed the database with demo data? (y/n): " SEED_DB

if [ "$SEED_DB" = "y" ]; then
    echo "Seeding database..."
    pnpm db:seed:prod
    echo "✅ Database seeded!"
fi

echo ""
echo "🎉 Production database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update any remaining environment variables in .env.production"
echo "2. Deploy your application to Vercel: vercel --prod"
echo "3. Deploy workers to Railway: railway up"
echo "4. Set up monitoring and alerts"
echo ""
echo "To verify your setup:"
echo "  pnpm db:studio:prod    # Open Drizzle Studio"
echo "  pnpm build             # Build for production"
echo "  pnpm start             # Start production server"
echo ""