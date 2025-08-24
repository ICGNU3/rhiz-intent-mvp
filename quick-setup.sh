#!/bin/bash

echo "🚀 Quick setup for Rhiz MVP..."

# Set environment variables
export DATABASE_URL="postgresql://postgres:password@db.whdwzrnyubpexjtjzcwh.supabase.co:5432/postgres"
export ENCRYPTION_KEY="dGVzdC1lbmNyeXB0aW9uLWtleS1mb3ItZGV2ZWxvcG1lbnQ="

# Create .env.local for the web app
cat > apps/web/.env.local << EOF
DATABASE_URL=${DATABASE_URL}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "✅ Environment set up"

# Try to build the web app
echo "🔨 Building web app..."
cd apps/web

# Install dependencies from root
cd ../..
npm install

# Try to build
cd apps/web
npm run build

echo "✅ Setup complete!"
