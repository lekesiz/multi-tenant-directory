# Quick Start Guide

> Get the Multi-Tenant Directory Platform running in 5 minutes

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** 10+ (comes with Node.js)
- **PostgreSQL** 14+ or [Neon](https://neon.tech/) account
- **Git** ([Download](https://git-scm.com/))

---

## 1. Clone & Install (2 min)

```bash
# Clone the repository
git clone https://github.com/lekesiz/multi-tenant-directory.git
cd multi-tenant-directory

# Install dependencies
npm install
```

---

## 2. Environment Setup (1 min)

```bash
# Copy example environment file
cp .env.local.example .env.local
```

Edit `.env.local` with minimum required values:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/directory_dev"

# Authentication (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Admin Account (Required)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

> **Tip:** Generate NEXTAUTH_SECRET with: `openssl rand -base64 32`

---

## 3. Database Setup (1 min)

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed with sample data
npm run db:seed
```

---

## 4. Start Development Server (30 sec)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Access the Platform

| URL | Description | Credentials |
|-----|-------------|-------------|
| [localhost:3000](http://localhost:3000) | Public homepage | - |
| [localhost:3000/admin](http://localhost:3000/admin) | Admin panel | admin@example.com |
| [localhost:3000/business/login](http://localhost:3000/business/login) | Business dashboard | (create account) |
| [localhost:3000/docs](http://localhost:3000/docs) | API documentation | - |

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Database
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:seed          # Seed database
npx prisma migrate dev   # Create migration

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript check
npm run test             # Run tests

# Formatting
npm run format           # Format with Prettier
```

### Project Structure

```
src/
├── app/                 # Next.js pages & API routes
│   ├── api/            # API endpoints (119+)
│   ├── admin/          # Admin panel pages
│   ├── business/       # Business owner dashboard
│   └── ...             # Public pages
├── components/          # React components (128)
├── lib/                 # Utilities & helpers
├── types/               # TypeScript definitions
└── middleware.ts        # Request handling

prisma/
├── schema.prisma        # Database schema (50+ models)
└── seed.ts              # Seed data

docs/                    # Documentation
```

---

## Next Steps

1. **Explore the codebase** - Browse `src/app/` and `src/components/`
2. **Read the Developer Guide** - [docs/guides/DEVELOPER_GUIDE.md](./guides/DEVELOPER_GUIDE.md)
3. **Understand the architecture** - [docs/technical/ARCHITECTURE.md](./technical/ARCHITECTURE.md)
4. **Check API endpoints** - [docs/API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## Optional: Full Configuration

For production features, add these to `.env.local`:

```env
# Google Maps (for maps & location)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-api-key"

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI Provider (for AI features)
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."

# Email (for notifications)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Redis (for caching & rate limiting)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## Troubleshooting

### Database Connection Error

```
Error: P1001: Can't reach database server
```

**Solution:** Check PostgreSQL is running and DATABASE_URL is correct.

### Prisma Client Error

```
Error: @prisma/client did not initialize yet
```

**Solution:** Run `npx prisma generate`

### Port Already in Use

```
Error: Port 3000 is already in use
```

**Solution:** `PORT=3001 npm run dev` or kill process on port 3000

---

## Need Help?

- **Documentation:** [docs/](./README.md)
- **Issues:** [GitHub Issues](https://github.com/lekesiz/multi-tenant-directory/issues)
- **Contributing:** [CONTRIBUTING.md](../CONTRIBUTING.md)
