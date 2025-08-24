# Rhiz MVP Decisions Log

This document captures key architectural and implementation decisions made during the development of the Rhiz MVP.

## Architecture Decisions

### 1. Monorepo Structure
**Decision**: Use pnpm workspaces with a monorepo structure
**Rationale**: 
- Enables code sharing between packages while maintaining clear boundaries
- Simplifies dependency management and versioning
- Allows for independent deployment of different components
- Facilitates testing and development workflows

**Alternatives Considered**: 
- Separate repositories (more complex CI/CD)
- Single package (harder to maintain boundaries)

### 2. Database: PostgreSQL + Drizzle ORM
**Decision**Y: PostgreSQL with Drizzle ORM and pgvector
**Rationale**:
- PostgreSQL provides ACID compliance and advanced features
- Drizzle offers type safety and excellent TypeScript integration
- pgvector enables future embedding-based features
- Row-level security (RLS) for multi-tenancy

**Alternatives Considered**:
- MongoDB (less structured, harder to enforce relationships)
- Prisma (heavier, more opinionated)

### 3. Queue System: BullMQ + Redis
**Decision**: BullMQ with Redis for job queues
**Rationale**:
- BullMQ provides robust job processing with retries and delays
- Redis is fast and reliable for job storage
- Supports role-based worker deployment
- Built-in monitoring and job management

**Alternatives Considered**:
- RabbitMQ (more complex setup)
- In-memory queues (not persistent)

### 4. LLM Integration: OpenAI with ModelRouter
**Decision**: OpenAI API with a ModelRouter abstraction
**Rationale**:
- OpenAI provides reliable, high-quality models
- ModelRouter abstraction allows easy switching between providers
- Structured prompts for consistent extraction
- Cost management through budget controls

**Alternatives Considered**:
- Anthropic Claude (good alternative, but OpenAI more established)
- Self-hosted models (complex infrastructure requirements)

## Implementation Decisions

### 5. Intent-First Design
**Decision**: Everything driven by user intents/goals
**Rationale**:
- Aligns with user mental models
- Provides clear value proposition
- Enables goal-driven matching and suggestions
- Creates actionable insights

**Alternatives Considered**:
- Contact-first design (less goal-oriented)
- Event-first design (harder to derive value)

### 6. Safe Defaults for External Integrations
**Decision**: Provider interface with null provider as default
**Rationale**:
- System works without external API keys
- Easy to test and develop
- Clear upgrade path to paid providers
- Reduces external dependencies

**Alternatives Considered**:
- Requiring external APIs (higher barrier to entry)
- Mock data (less realistic)

### 7. Field-Level Encryption for Sensitive Data
**Decision**: Encrypt phone numbers and other sensitive fields
**Rationale**:
- Protects user privacy
- Meets compliance requirements
- Allows for future expansion to other sensitive fields
- Maintains queryability where needed

**Alternatives Considered**:
- Database-level encryption (less granular)
- No encryption (privacy concerns)

### 8. Provenance Tracking
**Decision**: Every claim includes source, lawful basis, and provenance
**Rationale**:
- Enables GDPR compliance
- Provides audit trail
- Allows for data quality assessment
- Supports consent management

**Alternatives Considered**:
- Minimal tracking (compliance issues)
- Complex provenance (over-engineering)

## Technology Stack Decisions

### 9. Frontend: Next.js 14 App Router
**Decision**: Next.js 14 with App Router and TypeScript
**Rationale**:
- Excellent developer experience
- Built-in API routes
- Server-side rendering capabilities
- Strong TypeScript support

**Alternatives Considered**:
- React + Vite (more setup required)
- SvelteKit (smaller ecosystem)

### 10. UI: Tailwind CSS + shadcn/ui
**Decision**: Tailwind CSS with shadcn/ui components
**Rationale**:
- Rapid development with utility classes
- Consistent design system
- Accessible components out of the box
- Easy customization

**Alternatives Considered**:
- Material-UI (more opinionated)
- Custom CSS (more maintenance)

### 11. State Management: React Hooks + Server State
**Decision**: React hooks with server state management
**Rationale**:
- Simple and effective for MVP
- Leverages Next.js server components
- Reduces client-side complexity
- Easy to understand and maintain

**Alternatives Considered**:
- Redux (overkill for MVP)
- Zustand (good alternative for future)

## Security Decisions

### 12. Row-Level Security (RLS)
**Decision**: Implement RLS on all tables with owner_id
**Rationale**:
- Ensures data isolation between users
- Database-level security enforcement
- Prevents data leakage
- Supports multi-tenancy

**Alternatives Considered**:
- Application-level filtering (less secure)
- Separate databases (more complex)

### 13. Consent Management
**Decision**: Track consent with lawful basis and policy versions
**Rationale**:
- GDPR compliance requirement
- Clear audit trail
- Supports different data processing activities
- Enables consent withdrawal

**Alternatives Considered**:
- Simple boolean consent (insufficient for GDPR)
- Complex consent workflows (over-engineering for MVP)

## Deployment Decisions

### 14. Role-Based Worker Deployment
**Decision**: Deploy workers with different roles via environment variable
**Rationale**:
- Allows independent scaling of different agent types
- Enables cost optimization
- Supports different resource requirements
- Simplifies monitoring and debugging

**Alternatives Considered**:
- Single worker process (less flexible)
- Microservices (over-engineering for MVP)

### 15. Vercel + Railway Deployment
**Decision**: Vercel for web app, Railway for workers
**Rationale**:
- Vercel excellent for Next.js apps
- Railway good for background workers
- Both have good developer experience
- Cost-effective for MVP

**Alternatives Considered**:
- AWS (more complex setup)
- Heroku (higher costs)

## Exclusions (What We're Not Building)

### 16. LinkedIn Automation
**Decision**: Exclude LinkedIn automation
**Rationale**:
- Terms of service violations
- Legal and ethical concerns
- Focus on legitimate data sources
- Reduces complexity

### 17. Gmail Server-Side Integration
**Decision**: Exclude Gmail server-side integration
**Rationale**:
- Restricted scopes limit functionality
- Privacy concerns with server access
- Focus on calendar data instead
- Simpler implementation

### 18. Private Page Scraping
**Decision**: Exclude scraping of private pages
**Rationale**:
- Legal and ethical concerns
- Terms of service violations
- Focus on user-provided data
- Respects privacy boundaries

## Future Considerations

### 19. Embedding-Based Features
**Decision**: Include pgvector but defer embedding features
**Rationale**:
- Infrastructure ready for future features
- Semantic search and similarity matching
- Requires more data and tuning
- Can be added incrementally

### 20. Real-Time Features
**Decision**: Defer real-time features to future versions
**Rationale**:
- MVP focuses on core value proposition
- WebSocket complexity not needed yet
- Can be added with polling or SSE
- Reduces initial complexity

## Cost Management

### 21. OpenAI Cost Controls
**Decision**: Implement daily cost budgets
**Rationale**:
- Prevents unexpected charges
- Enables cost monitoring
- Supports different pricing tiers
- Protects against abuse

### 22. Provider Feature Flags
**Decision**: Use environment variables for provider features
**Rationale**:
- Easy to enable/disable features
- Supports different deployment environments
- Enables A/B testing
- Reduces costs in development

This decisions log will be updated as the project evolves and new decisions are made.
