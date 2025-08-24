#!/bin/bash

echo "🚀 Building Rhiz MVP app..."

# Set environment variables
export DATABASE_URL="postgresql://postgres:password@db.whdwzrnyubpexjtjzcwh.supabase.co:5432/postgres"
export ENCRYPTION_KEY="dGVzdC1lbmNyeXB0aW9uLWtleS1mb3ItZGV2ZWxvcG1lbnQ="
export USE_MOCK_AUTH="true"

# Create .env.local for the web app
cat > apps/web/.env.local << EOF
DATABASE_URL=${DATABASE_URL}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
NEXT_PUBLIC_APP_URL=http://localhost:3000
USE_MOCK_AUTH=true
EOF

echo "✅ Environment set up"

# Create mock package directories
mkdir -p apps/web/node_modules/@rhiz

# Copy built packages (if they exist)
if [ -d "packages/db" ]; then
  cp -r packages/db apps/web/node_modules/@rhiz/
fi

if [ -d "packages/shared" ]; then
  cp -r packages/shared apps/web/node_modules/@rhiz/
fi

if [ -d "packages/core" ]; then
  cp -r packages/core apps/web/node_modules/@rhiz/
fi

if [ -d "packages/workers" ]; then
  cp -r packages/workers apps/web/node_modules/@rhiz/
fi

if [ -d "packages/integrations" ]; then
  cp -r packages/integrations apps/web/node_modules/@rhiz/
fi

echo "✅ Mock packages copied"

# Try to build
cd apps/web
npm run build

echo "✅ Build complete!"
