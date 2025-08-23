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
