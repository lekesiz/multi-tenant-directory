# Multi-Tenant Directory Platform - Documentation

> Comprehensive documentation for the Multi-Tenant Business Directory Platform

**Version:** 2.1.0 | **Last Updated:** November 25, 2025

---

## Quick Navigation

| Document | Description | Audience |
|----------|-------------|----------|
| [Quick Start](./QUICKSTART.md) | Get up and running in 5 minutes | Developers |
| [API Documentation](./API_DOCUMENTATION.md) | Complete API reference | Developers |
| [Developer Guide](./guides/DEVELOPER_GUIDE.md) | In-depth development guide | Developers |
| [Admin Guide](./ADMIN_GUIDE.md) | Platform administration | Administrators |
| [Business Owner Guide](./BUSINESS_OWNER_GUIDE.md) | Business dashboard usage | Business Owners |
| [User Guide](./USER_GUIDE.md) | End-user documentation | End Users |

---

## Documentation Structure

```
docs/
├── README.md                    # This file - Documentation index
├── QUICKSTART.md               # Quick start for developers
│
├── Core Documentation
│   ├── API_DOCUMENTATION.md     # API endpoints reference
│   ├── ADMIN_GUIDE.md           # Admin panel guide
│   ├── BUSINESS_OWNER_GUIDE.md  # Business dashboard guide
│   └── USER_GUIDE.md            # End-user guide
│
├── technical/                   # Technical documentation
│   ├── ARCHITECTURE.md          # System architecture
│   └── DATABASE_SCHEMA.md       # Database models & relations
│
├── guides/                      # Developer guides
│   └── DEVELOPER_GUIDE.md       # Development workflow
│
├── deployment/                  # Deployment documentation
│   └── ...
│
├── Setup Guides
│   ├── DEPLOYMENT_GUIDE.md      # Deployment instructions
│   ├── PRODUCTION_SETUP.md      # Production configuration
│   ├── PRODUCTION_CHECKLIST.md  # Pre-launch checklist
│   ├── STRIPE_SETUP.md          # Stripe integration
│   ├── GOOGLE_MAPS_SETUP.md     # Google Maps setup
│   ├── SENTRY_SETUP.md          # Error tracking setup
│   └── UPSTASH_REDIS_SETUP.md   # Redis cache setup
│
├── Features Documentation
│   ├── MOBILE_API.md            # Mobile API reference
│   ├── BUSINESS_OWNER_API.md    # Business owner API
│   ├── CRON_JOBS.md             # Scheduled tasks
│   ├── SITEMAP_GENERATOR.md     # SEO sitemap
│   └── STRUCTURED_DATA_GUIDE.md # JSON-LD schema
│
├── Performance & Optimization
│   ├── DATABASE_OPTIMIZATION.md # Query optimization
│   ├── PERFORMANCE_OPTIMIZATIONS.md
│   └── n-plus-one-fixes.md      # N+1 query solutions
│
└── Reference
    ├── ERROR_HANDLING.md        # Error handling patterns
    ├── KNOWN_ISSUES.md          # Known issues & workarounds
    └── API_ECOSYSTEM.md         # API ecosystem overview
```

---

## Getting Started

### For New Developers

1. **[Quick Start Guide](./QUICKSTART.md)** - Get the project running in 5 minutes
2. **[Developer Guide](./guides/DEVELOPER_GUIDE.md)** - Understand the codebase
3. **[Architecture Overview](./technical/ARCHITECTURE.md)** - System design
4. **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute

### For DevOps / Deployment

1. **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Deploy to Vercel
2. **[Production Setup](./PRODUCTION_SETUP.md)** - Configure production
3. **[Production Checklist](./PRODUCTION_CHECKLIST.md)** - Pre-launch checklist

### For API Integration

1. **[API Documentation](./API_DOCUMENTATION.md)** - Endpoint reference
2. **[API Examples](./api-examples.ts)** - Code examples
3. **[Mobile API](./MOBILE_API.md)** - Mobile-specific endpoints

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js | 15.5.4 |
| **Language** | TypeScript | 5.0 |
| **UI** | React | 19 |
| **Styling** | Tailwind CSS | 4.x |
| **Database** | PostgreSQL | 14+ |
| **ORM** | Prisma | 6.18 |
| **Auth** | NextAuth.js | 4.24 |
| **Payments** | Stripe | 19.x |
| **AI** | OpenAI / Anthropic / Gemini | Latest |
| **Hosting** | Vercel | Edge |

---

## Project Statistics

| Metric | Count |
|--------|-------|
| API Endpoints | 119+ |
| Database Models | 50+ |
| React Components | 128 |
| Active Domains | 22 |
| Supported Languages | 3 (FR/EN/DE) |

---

## Key Features

### Core Platform
- Multi-tenant architecture (22 domains)
- Business directory with categories
- Review system with Google sync
- Advanced search with filters
- SEO optimized (sitemaps, JSON-LD)

### Business Dashboard
- Profile management
- Photo gallery
- Business hours (multiple shifts)
- Review management
- Analytics dashboard
- Activity system (blog posts)

### Admin Panel
- Company management
- Category management (hierarchical)
- Review moderation
- Lead management
- Domain configuration
- User management

### AI Features
- Content generation
- Sentiment analysis
- SEO optimization
- Image generation
- Smart recommendations

### Payments
- Stripe integration
- Subscription plans
- Invoice management
- Featured listings

---

## Support

- **Issues**: [GitHub Issues](https://github.com/lekesiz/multi-tenant-directory/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lekesiz/multi-tenant-directory/discussions)
- **Email**: support@haguenau.pro

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 2.1.0 | Nov 2025 | Activity System, AI improvements |
| 2.0.0 | Oct 2025 | Multi-tenant architecture, Admin panel |
| 1.0.0 | Sep 2025 | Initial release |

See [CHANGELOG.md](../CHANGELOG.md) for detailed version history.
