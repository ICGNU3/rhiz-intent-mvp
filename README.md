# Rhiz - Intent-First Relationship Intelligence

Rhiz is an AI-powered platform that captures high-signal relationship data from calendar attendees and voice notes, then generates smart introduction suggestions based on your goals.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp docs/env.example .env

# Run database migrations
pnpm db:migrate

# Seed with demo data
pnpm db:seed

# Start development
pnpm dev              # Web app
pnpm workers:start    # Workers
```

Visit http://localhost:3000 to see the demo with seeded data.

## 🏃‍♂️ How to Run Locally with Seed Data

The application comes with comprehensive demo data that demonstrates all features:

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database (local or cloud)
- Redis instance
- OpenAI API key

### Setup Steps

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp docs/env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   DATABASE_URL=postgresql://user:pass@localhost:5432/rhiz
   REDIS_URL=redis://localhost:6379
   OPENAI_API_KEY=sk-your-openai-key
   ENCRYPTION_KEY=your-32-char-encryption-key
   ```

3. **Initialize database:**
   ```bash
   pnpm db:migrate   # Creates all tables with RLS policies
   pnpm db:seed      # Loads demo data
   ```

4. **Start the application:**
   ```bash
   pnpm dev          # Web app on http://localhost:3000
   pnpm workers:start # Background workers
   ```

### Demo Data Included

The seed script creates:
- **1 demo user** (demo-user-id)
- **3 organizations** (TechCorp, StartupHub, Innovation Labs)
- **5 people** with full profiles and claims
- **3 encounters** (meetings and calls)
- **1 active goal** (Raise $2M Seed Round)
- **13 claims** (facts about people)
- **3 edges** (relationships between people)
- **3 suggestions** with AI-generated intro drafts
- **2 tasks** (follow-up reminders)
- **4 event logs** (audit trail)

### What You'll See

1. **Home page** shows Intent Cards with:
   - Goal title: "Raise $2M Seed Round"
   - Top 2 suggestions with scores and mutual interests
   - 1 insight with confidence score

2. **People page** displays contacts with:
   - Relationship strength indicators
   - Last encounter dates
   - Known information (title, company, expertise)

3. **Suggestions page** shows:
   - Introduction drafts
   - "Why this match" explanations
   - Accept/reject actions

4. **Goals page** lists:
   - Active goals with status
   - Suggestion counts
   - Creation dates

### Testing the Features

- **Voice recording**: Record a voice note to see transcription and entity extraction
- **Calendar upload**: Upload the example ICS file from `docs/example.ics`
- **Agent workflows**: Watch the worker logs to see background processing
- **Security**: Check that RLS policies are working (data isolation by owner_id)

### Troubleshooting

- **Database connection**: Ensure PostgreSQL is running and accessible
- **Redis connection**: Verify Redis is running on the configured port
- **OpenAI API**: Check your API key has sufficient credits
- **Workers not starting**: Check Redis connection and role environment variables

## 📚 Documentation

All documentation is organized in the [`docs/`](./docs/) folder:

- **[INDEX.md](./docs/INDEX.md)** - Documentation index and navigation guide
- **[README.md](./docs/README.md)** - Comprehensive setup and usage guide
- **[PROJECT_SUMMARY.md](./docs/PROJECT_SUMMARY.md)** - Complete feature overview
- **[DECISIONS.md](./docs/DECISIONS.md)** - Architectural decision log
- **[SECURITY.md](./docs/SECURITY.md)** - Security policy and practices
- **[PRIVACY.md](./docs/PRIVACY.md)** - Privacy policy and GDPR compliance
- **[env.example](./docs/env.example)** - Environment variables template
- **[example.ics](./docs/example.ics)** - Sample calendar file for testing

## 🎯 What is Rhiz?

Rhiz is an intent-first relationship intelligence platform that:

- **Captures high-signal data** from calendar attendees and voice notes
- **Enriches contacts** through safe provider integrations
- **Categorizes contacts** and computes connection scores
- **Generates smart introductions** with double-opt templates
- **Drives everything** from goal-centric Intent Cards

## 🛡️ Privacy & Security First

- **Safe data collection** from legitimate sources only
- **Field-level encryption** for sensitive data
- **GDPR compliance** with consent and provenance tracking
- **No unauthorized scraping** or automation
- **Complete audit trails** for all data processing

## 🏗️ Architecture

- **Next.js 14** with App Router and TypeScript
- **PostgreSQL** with Drizzle ORM and pgvector
- **BullMQ** with Redis for scalable job processing
- **OpenAI** for transcription and LLM processing
- **Role-based workers** for different processing tasks

## 🚀 Deployment

- **Vercel** for web application
- **Railway** for worker deployment
- **Docker** for containerized workers
- **Environment-based** configuration

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🤝 Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development guidelines.

---

For detailed documentation, architecture decisions, and implementation guides, please see the [`docs/`](./docs/) folder.
