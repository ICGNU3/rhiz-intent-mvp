#!/bin/bash

# Rhiz Docker Startup Script
echo "🚀 Starting Rhiz with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Building and starting services..."
docker-compose up -d --build

echo "⏳ Waiting for services to start..."
sleep 10

echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Rhiz is starting up!"
echo ""
echo "🌐 Access your services:"
echo "   • n8n (Integrations): http://localhost:5678"
echo "     Username: admin"
echo "     Password: rhiz_password"
echo ""
echo "📊 Monitor services:"
echo "   • View logs: docker-compose logs -f"
echo "   • Check status: docker-compose ps"
echo "   • Stop services: docker-compose down"
echo ""
echo "🔧 Next steps:"
echo "   1. Open n8n at http://localhost:5678"
echo "   2. Set up your API key in n8n settings"
echo "   3. Create your first workflow"
echo "   4. Test the n8n CLI: ./tools/n8n-cli.ts health"
echo ""
echo "📚 For more help, see docs/DOCKER_GUIDE.md"
