# Rhiz - Intent-First Relationship Intelligence

Rhiz is an AI-powered platform that captures high-signal relationship data from calendar attendees and voice notes, then generates smart introduction suggestions based on your goals.

## Features

- **Intent Cards**: Goal-centric UI that drives everything from your intents
- **Voice Note Processing**: Extract entities, needs, offers, and explicit goals from voice recordings
- **Calendar Integration**: Parse ICS files and extract attendee information
- **Smart Matching**: AI-powered connection scoring and introduction suggestions
- **Safe Integrations**: Provider interface with safe defaults that work without external keys
- **Consent & Provenance**: Every fact includes source, lawful basis, and provenance tracking

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm 8+
- PostgreSQL with pgvector extension (via Docker or local)
- Redis for BullMQ queues
- OpenAI API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd rhiz-intent-mvp
pnpm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp docs/env.example .env
```

Required environment variables:

```bash
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/rhiz
DIRECT_URL=postgresql://user:password@localhost:5432/rhiz

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Encryption (generate with: openssl rand -base64 32)
ENCRYPTION_KEY=your-32-byte-base64-encryption-key-here

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 3. Database Setup

```bash
# Run migrations
pnpm db:migrate

# Seed with demo data
pnpm db:seed
```

### 4. Start Development

```bash
# Terminal 1: Start the web app
pnpm dev

# Terminal 2: Start the workers (in a new terminal)
pnpm workers:start
```

Visit http://localhost:3000 to see the demo with seeded data.

## Architecture

### Monorepo Structure

```
rhiz-intent-mvp/
├── apps/
│   └── web/                 # Next.js 14 App Router
├── packages/
│   ├── core/               # Domain logic, scoring, prompts
│   ├── db/                 # Drizzle schema, migrations
│   ├── workers/            # BullMQ agents, queues
│   ├── bots/               # Telegram bot (optional)
│   └── shared/             # Types, utils, crypto
└── infra/
    ├── docker/             # Dockerfiles for workers
    └── sql/                # Seed data and utilities
```

### Agent Roles

- **IntentRouter**: Processes ingested events, extracts/updates goals
- **CaptureAgent**: Creates encounters and claims from raw data
- **EnrichmentAgent**: Adds claims from external providers
- **MatchingAgent**: Builds candidate pairs and computes scores
- **IntroWriter**: Drafts introduction messages
- **FollowUp**: Schedules nudges and tracks outcomes

### Database Schema

- **People**: Contact information with field-level encryption
- **Encounters**: Meetings, calls, voice notes with timestamps
- **Claims**: Facts about people with confidence and provenance
- **Goals**: User intents that drive the system
- **Suggestions**: AI-generated introduction recommendations
- **Consent**: GDPR-compliant consent tracking

## API Routes

### Data Ingestion

- `POST /api/ingest/voice` - Upload and process voice notes
- `POST /api/ingest/calendar` - Upload ICS files or event JSON

### Testing

Use the example files in the `docs/` folder for testing:
- `docs/example.ics` - Sample calendar file for testing calendar ingestion

### Core Features

- `GET /api/intent-cards` - Fetch goal-driven intent cards
- `POST /api/goals` - Create new goals
- `POST /api/suggestions/:id/accept` - Accept introduction suggestions

## Deployment

### Vercel (Web App)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with `pnpm build`

### Railway (Workers)

1. Create Railway project
2. Add environment variables
3. Deploy with different `ROLE` values:
   - `ROLE=router`
   - `ROLE=capture`
   - `ROLE=matching`
   - etc.

### Docker

```bash
# Build worker image
docker build -f infra/docker/Dockerfile.worker -t rhiz-worker .

# Run with role
docker run -e ROLE=matching -e DATABASE_URL=... rhiz-worker
```

## Development

### Adding New Intent Types

1. Update `IntentKind` enum in `packages/core/src/types.ts`
2. Add scoring logic in `packages/core/src/matching.ts`
3. Update templates in `packages/core/src/templates.ts`

### Adding New Providers

1. Implement `EnrichmentProviderInterface` in `packages/core/src/providers/`
2. Add to factory function
3. Set environment variable to enable

### Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @rhiz/core test
pnpm --filter @rhiz/db test
```

## Security & Privacy

- **Field-level encryption** for sensitive data
- **Row-level security** on all tables
- **Consent tracking** with lawful basis
- **Provenance logging** for all data sources
- **Minimal PII access** with audit trails

See [SECURITY.md](./SECURITY.md) and [PRIVACY.md](./PRIVACY.md) for detailed policies.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- Documentation: [docs.rhiz.ai](https://docs.rhiz.ai)
- Issues: [GitHub Issues](https://github.com/rhiz/rhiz-intent-mvp/issues)
- Discussions: [GitHub Discussions](https://github.com/rhiz/rhiz-intent-mvp/discussions)
