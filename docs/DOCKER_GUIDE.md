# Docker Guide for Rhiz

This guide explains how to use Docker with your Rhiz application.

## What is Docker?

Docker is a platform that packages applications into **containers** - lightweight, isolated environments that run consistently across different machines.

## How Rhiz Uses Docker

Your Rhiz application uses Docker for:

1. **Background Workers** - AI processing, data enrichment, job queues
2. **Database** - PostgreSQL for data storage
3. **Cache/Queue** - Redis for job processing
4. **Integrations** - n8n for CRM integrations

## Quick Start

### Prerequisites

1. **Install Docker Desktop** (if not already installed)
   - [Download for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - [Download for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - [Download for Linux](https://docs.docker.com/desktop/install/linux-install/)

2. **Verify Installation**
   ```bash
   docker --version
   docker-compose --version
   ```

### Start Everything

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Access Services

- **n8n**: http://localhost:5678 (admin/rhiz_password)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Docker Services Explained

### 1. PostgreSQL Database
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: rhiz
    POSTGRES_USER: rhiz
    POSTGRES_PASSWORD: rhiz_password
```

**Purpose**: Stores all your application data
- People, encounters, goals, suggestions
- User data and workspace information
- Integration configurations

### 2. Redis Cache/Queue
```yaml
redis:
  image: redis:7-alpine
```

**Purpose**: Handles job queues and caching
- Background job processing
- Temporary data storage
- Rate limiting

### 3. n8n Integration Platform
```yaml
n8n:
  image: n8nio/n8n:latest
  environment:
    N8N_BASIC_AUTH_USER: admin
    N8N_BASIC_AUTH_PASSWORD: rhiz_password
```

**Purpose**: Manages CRM integrations
- HubSpot, Salesforce, Pipedrive connections
- Automated workflows
- Data synchronization

### 4. Worker Containers
```yaml
worker-router:
  build:
    dockerfile: infra/docker/Dockerfile.worker
  environment:
    ROLE: intent-router
```

**Purpose**: Background processing agents
- **Intent Router**: Processes user goals and intents
- **Capture Agent**: Extracts data from voice notes and calendar
- **Enrichment Agent**: Adds context and insights
- **Matching Agent**: Finds connection opportunities
- **Intro Writer**: Drafts introduction messages
- **Follow Up**: Manages follow-up sequences

## Common Docker Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart worker-router

# View running containers
docker ps

# View logs for a service
docker-compose logs worker-router
```

### Development Commands
```bash
# Rebuild containers after code changes
docker-compose build

# Rebuild and restart
docker-compose up -d --build

# View real-time logs
docker-compose logs -f worker-router

# Execute commands inside a container
docker-compose exec postgres psql -U rhiz -d rhiz
```

### Troubleshooting
```bash
# Check service health
docker-compose ps

# View detailed logs
docker-compose logs --tail=100 worker-router

# Restart everything
docker-compose down
docker-compose up -d

# Clean up everything (WARNING: deletes data)
docker-compose down -v
```

## Environment Variables

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://rhiz:rhiz_password@localhost:5432/rhiz

# Redis
REDIS_URL=redis://localhost:6379

# n8n
N8N_API_KEY=your-n8n-api-key
N8N_BASE_URL=http://localhost:5678
```

### Optional Environment Variables
```bash
# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-key

# Slack (for notifications)
SLACK_BOT_TOKEN=your-slack-token

# Google Calendar
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Development Workflow

### 1. Local Development
```bash
# Start only infrastructure (database, redis, n8n)
docker-compose up -d postgres redis n8n

# Run web app locally
cd apps/web && npm run dev

# Run workers locally
cd packages/workers && npm run dev
```

### 2. Full Docker Development
```bash
# Start everything in Docker
docker-compose up -d

# Make code changes
# Rebuild and restart
docker-compose up -d --build
```

### 3. Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## Data Persistence

### Volumes
Docker volumes persist your data:
- `postgres_data`: Database files
- `redis_data`: Redis cache
- `n8n_data`: n8n workflows and configurations

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U rhiz rhiz > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U rhiz rhiz < backup.sql
```

## Monitoring and Health Checks

### Check Service Health
```bash
# All services
docker-compose ps

# Specific service logs
docker-compose logs worker-router

# Health check endpoint
curl http://localhost:5678/healthz  # n8n
```

### Resource Usage
```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

## Troubleshooting Common Issues

### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :5432

# Stop conflicting service
sudo service postgresql stop  # Ubuntu
brew services stop postgresql # Mac
```

### 2. Permission Issues
```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
# Log out and back in
```

### 3. Out of Disk Space
```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

### 4. Container Won't Start
```bash
# Check logs
docker-compose logs service-name

# Check environment variables
docker-compose config

# Restart with fresh state
docker-compose down -v
docker-compose up -d
```

## Production Considerations

### Security
```bash
# Use strong passwords
POSTGRES_PASSWORD=very-strong-password-here

# Enable SSL for database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Use secrets management
docker secret create db_password ./db_password.txt
```

### Performance
```bash
# Resource limits
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Monitoring
```bash
# Add monitoring stack
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

## Next Steps

1. **Start with basic setup**: `docker-compose up -d`
2. **Explore n8n**: http://localhost:5678
3. **Check worker logs**: `docker-compose logs worker-router`
4. **Test integrations**: Use the n8n CLI tool
5. **Monitor performance**: `docker stats`

## Getting Help

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **n8n Documentation**: https://docs.n8n.io/
- **Project Issues**: Check the GitHub repository
