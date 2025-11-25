# 💻 Developer Guide - Directory Platform

**Version:** 2.1.0
**Last Updated:** 25 Novembre 2025
**Target Audience:** Developers and Contributors

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Tech Stack](#tech-stack)
5. [Development Workflow](#development-workflow)
6. [Database & Prisma](#database--prisma)
7. [Multi-Tenant Architecture](#multi-tenant-architecture)
8. [Testing](#testing)
9. [Code Style & Conventions](#code-style--conventions)
10. [Contributing](#contributing)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is This Project?

A multi-tenant business directory platform that allows multiple cities/regions to have their own branded directory on separate domains while sharing the same codebase and infrastructure.

### Key Features

- **Multi-Tenant Architecture** - Domain-based tenant isolation
- **Business Listings** - Complete business information with categories
- **Review System** - Customer reviews with moderation
- **Search & Filters** - Advanced search with multiple filters
- **Google Maps Integration** - Interactive maps and directions
- **Admin Dashboard** - Full management interface
- **Business Owner Dashboard** - Self-service management
- **SEO Optimized** - Sitemaps, structured data, meta tags
- **Mobile Responsive** - Fully optimized for mobile devices

### Tech Highlights

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database management
- **PostgreSQL** - Primary database
- **Tailwind CSS** - Utility-first styling
- **NextAuth.js** - Authentication
- **Vercel** - Hosting platform

---

## Getting Started

### Prerequisites

**Required:**
- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL 14+ database
- Git

**Recommended:**
- VS Code with extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense

### Installation Steps

**1. Clone the Repository**

```bash
git clone https://github.com/your-org/multi-tenant-directory.git
cd multi-tenant-directory
```

**2. Install Dependencies**

```bash
npm install
```

This installs:
- Next.js and React
- Prisma and database tools
- TypeScript and type definitions
- Testing libraries (Jest, Playwright)
- Development tools (ESLint, Prettier)

**3. Environment Setup**

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/directory_dev"

# Authentication
NEXTAUTH_SECRET="your-32-character-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Admin Credentials
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure-password"

# Google Maps API
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Optional: Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Optional: Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@example.com"

# Development
SKIP_ENV_VALIDATION="false"
SKIP_BUILD_STATIC_GENERATION="false"
```

**4. Database Setup**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npm run db:seed
```

**5. Start Development Server**

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### First-Time Setup Checklist

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Create `.env.local` file
- [ ] Setup PostgreSQL database
- [ ] Run database migrations
- [ ] Seed database with sample data
- [ ] Start development server
- [ ] Open http://localhost:3000
- [ ] Login to admin panel (`/admin/login`)
- [ ] Create first business listing

---

## Project Structure

### Directory Layout

```
multi-tenant-directory/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (public)/            # Public pages
│   │   ├── admin/               # Admin dashboard
│   │   ├── business/            # Business owner dashboard
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Homepage
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # UI components (buttons, inputs)
│   │   ├── AdminSidebar.tsx     # Admin navigation
│   │   ├── ReviewCard.tsx       # Review display
│   │   └── ...
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── auth/                # Authentication utilities
│   │   ├── queries/             # Database queries
│   │   ├── validation/          # Zod schemas
│   │   ├── db.ts                # Prisma client
│   │   └── ...
│   │
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript type definitions
│   ├── styles/                  # Global styles
│   └── middleware.ts            # Next.js middleware
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Database seeding script
│
├── public/                      # Static assets
│   ├── images/
│   ├── favicon.ico
│   └── ...
│
├── docs/                        # Documentation
│   ├── guides/                  # User guides
│   ├── api/                     # API documentation
│   └── ...
│
├── scripts/                     # Utility scripts
│   ├── import-haguenau-businesses.ts
│   └── ...
│
├── __tests__/                   # Tests (moved to src/)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .github/                     # GitHub workflows
│   └── workflows/
│       ├── test.yml             # CI/CD testing
│       └── ...
│
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Jest test configuration
├── playwright.config.ts         # Playwright E2E configuration
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                  # Prettier configuration
└── package.json                 # Dependencies and scripts
```

### Key Files Explained

**Configuration Files:**
- `next.config.ts` - Next.js settings (domains, images, redirects)
- `tailwind.config.ts` - Tailwind CSS customization
- `tsconfig.json` - TypeScript compiler options
- `prisma/schema.prisma` - Database schema definition

**Important Source Files:**
- `src/middleware.ts` - Route protection and domain handling
- `src/app/layout.tsx` - Root layout with providers
- `src/lib/db.ts` - Centralized Prisma client
- `src/lib/auth/index.ts` - Authentication logic

---

## Tech Stack

### Frontend

**Framework:**
- **Next.js 15.5.4** - React framework
  - App Router (not Pages Router)
  - React Server Components
  - Server Actions
  - Built-in API routes

**UI & Styling:**
- **React 19.1.0** - UI library
- **TypeScript 5.x** - Type safety
- **Tailwind CSS 4.x** - Utility-first CSS
- **Headless UI 2.x** - Unstyled components
- **Heroicons 2.x** - Icon library

**State Management:**
- **React Hooks** - Built-in state management
- **React Query (TanStack Query)** - Server state
- **Context API** - Global state when needed

### Backend

**Runtime:**
- **Node.js 20.x** - JavaScript runtime

**Database:**
- **PostgreSQL 14+** - Primary database
- **Prisma ORM 6.x** - Database toolkit
  - Schema management
  - Migrations
  - Type-safe queries

**Authentication:**
- **NextAuth.js 4.x** - Authentication library
  - Credentials provider
  - JWT tokens
  - Session management

### APIs & Integrations

**External APIs:**
- **Google Maps API** - Maps and geocoding
- **Cloudinary** - Image hosting and optimization
- **SendGrid** - Email delivery (optional)

**Internal APIs:**
- RESTful API endpoints
- Next.js API routes
- Server Actions for mutations

### Development Tools

**Code Quality:**
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

**Testing:**
- **Jest** - Unit and integration tests
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing

**Version Control:**
- **Git** - Version control
- **GitHub** - Repository hosting
- **GitHub Actions** - CI/CD

### Deployment

**Hosting:**
- **Vercel** - Primary hosting platform
  - Automatic deployments
  - Edge functions
  - Analytics

**Database:**
- **Vercel Postgres** - Managed PostgreSQL (recommended)
- **Supabase** - Alternative PostgreSQL hosting
- **Neon** - Serverless PostgreSQL

---

## Development Workflow

### Git Workflow

**Branches:**
- `main` - Production code (protected)
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Urgent production fixes

**Branch Strategy:**

```bash
# Create feature branch
git checkout -b feature/add-favorite-feature

# Make changes and commit
git add .
git commit -m "feat: add favorite feature"

# Push to GitHub
git push origin feature/add-favorite-feature

# Create pull request on GitHub
# After review and CI passes, merge to develop
```

**Commit Message Convention:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, semicolons)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Build process, dependencies

**Examples:**
```
feat(companies): add favorite companies feature
fix(reviews): resolve rating calculation bug
docs(api): update API documentation
refactor(queries): optimize company search query
test(reviews): add review submission tests
chore(deps): update Next.js to 15.5.4
```

### Development Commands

**Starting Development:**
```bash
npm run dev              # Start dev server
npm run dev:turbo        # Start with Turbopack
```

**Building:**
```bash
npm run build            # Production build
npm run start            # Start production server
```

**Code Quality:**
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
```

**Testing:**
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
npm run test:ci          # CI mode
npx playwright test      # E2E tests
```

**Database:**
```bash
npm run db:push          # Push schema changes
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate Prisma Client
```

### Hot Reloading

Next.js supports hot reloading for:
- ✅ React components
- ✅ CSS/Tailwind classes
- ✅ API routes
- ✅ Server components
- ❌ `.env.local` changes (requires restart)
- ❌ `next.config.ts` changes (requires restart)

### Debugging

**VS Code Launch Configuration:**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

**Console Logging:**
- Server-side logs appear in terminal
- Client-side logs appear in browser console
- Use `console.log`, `console.error`, `console.warn`

**React DevTools:**
- Install React DevTools browser extension
- Inspect component tree
- View props and state
- Profile performance

---

## Database & Prisma

### Prisma Schema

**Location:** `prisma/schema.prisma`

**Key Models:**

```prisma
model Domain {
  id         Int      @id @default(autoincrement())
  name       String   @unique  // e.g., "haguenau.pro"
  subdomain  String   @unique  // e.g., "haguenau"
  isActive   Boolean  @default(true)
  companies  CompanyContent[]
}

model Company {
  id          Int      @id @default(autoincrement())
  name        String
  slug        String   @unique
  categories  String[]
  address     String
  city        String
  postalCode  String
  phone       String
  email       String?
  website     String?
  latitude    Float
  longitude   Float
  description String
  hours       Json?
  rating      Float    @default(0)
  reviewCount Int      @default(0)
  verified    Boolean  @default(false)
  reviews     Review[]
  content     CompanyContent[]
}

model Review {
  id            Int      @id @default(autoincrement())
  companyId     Int
  company       Company  @relation(fields: [companyId], references: [id])
  authorName    String
  authorEmail   String
  rating        Int
  comment       String
  photos        String[]
  isApproved    Boolean  @default(false)
  businessReply String?
  createdAt     DateTime @default(now())
}

model CompanyContent {
  id        Int     @id @default(autoincrement())
  companyId Int
  domainId  Int
  isVisible Boolean @default(true)
  company   Company @relation(fields: [companyId], references: [id])
  domain    Domain  @relation(fields: [domainId], references: [id])

  @@unique([companyId, domainId])
}

model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  name     String
  password String
  role     Role   @default(USER)
}

enum Role {
  USER
  BUSINESS_OWNER
  ADMIN
}
```

### Common Prisma Operations

**Query Examples:**

```typescript
import { prisma } from '@/lib/db';

// Find one
const company = await prisma.company.findUnique({
  where: { slug: 'company-slug' },
  include: { reviews: true },
});

// Find many with filters
const companies = await prisma.company.findMany({
  where: {
    city: 'Haguenau',
    verified: true,
    categories: { has: 'Restaurant' },
  },
  orderBy: { rating: 'desc' },
  take: 20,
  skip: 0,
});

// Create
const newCompany = await prisma.company.create({
  data: {
    name: 'New Business',
    slug: 'new-business-haguenau',
    categories: ['Services'],
    address: '1 Rue Example',
    city: 'Haguenau',
    postalCode: '67500',
    latitude: 48.816,
    longitude: 7.789,
  },
});

// Update
const updated = await prisma.company.update({
  where: { id: 1 },
  data: { phone: '03 88 00 00 00' },
});

// Delete
await prisma.company.delete({
  where: { id: 1 },
});

// Transactions
await prisma.$transaction([
  prisma.company.create({ data: {...} }),
  prisma.companyContent.create({ data: {...} }),
]);
```

### Migrations

**Creating Migrations:**

```bash
# After changing schema.prisma
npx prisma migrate dev --name add_favorites

# This will:
# 1. Generate SQL migration file
# 2. Apply migration to database
# 3. Regenerate Prisma Client
```

**Migration Files Location:**
`prisma/migrations/[timestamp]_migration_name/migration.sql`

**Resetting Database (Development):**

```bash
npx prisma migrate reset

# This will:
# 1. Drop database
# 2. Recreate database
# 3. Apply all migrations
# 4. Run seed script
```

### Prisma Studio

**Visual Database Browser:**

```bash
npm run db:studio
```

Opens at `http://localhost:5555`

Features:
- Browse all tables
- Edit records
- Run queries
- View relationships

---

## Multi-Tenant Architecture

### How It Works

**Domain-Based Tenancy:**

```
haguenau.pro    → Domain ID: 1 → Shows Haguenau businesses
strasbourg.pro  → Domain ID: 2 → Shows Strasbourg businesses
colmar.pro      → Domain ID: 3 → Shows Colmar businesses
```

**Key Concept:**
- Single codebase serves multiple domains
- Each domain has its own content
- `CompanyContent` table links companies to domains

### Middleware

**File:** `src/middleware.ts`

```typescript
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Extract domain
  const domain = hostname.split(':')[0];

  // Add domain to headers for use in app
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-domain', domain);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
```

### Domain Resolution

**Utility:** `src/lib/queries/domain.ts`

```typescript
export async function getCurrentDomain(request: Request) {
  const hostname = request.headers.get('host') || '';
  const domainName = hostname.split(':')[0];

  const domain = await prisma.domain.findUnique({
    where: { name: domainName },
  });

  return domain;
}
```

### Filtering by Domain

**All company queries must filter by domain:**

```typescript
// ❌ BAD: Returns all companies across all domains
const companies = await prisma.company.findMany();

// ✅ GOOD: Returns only companies for current domain
const companies = await prisma.company.findMany({
  where: {
    content: {
      some: {
        domainId: currentDomain.id,
        isVisible: true,
      },
    },
  },
});
```

### Adding a New Domain

**Steps:**

1. **Add to Database:**
```sql
INSERT INTO "Domain" (name, subdomain, "isActive")
VALUES ('newcity.pro', 'newcity', true);
```

2. **Configure DNS:**
- Point domain to Vercel
- Add CNAME record

3. **Add to Vercel:**
- Project Settings → Domains
- Add `newcity.pro`

4. **Seed Content:**
```bash
# Create companies with CompanyContent for new domain
```

---

## Testing

### Test Structure

```
src/
└── __tests__/
    ├── components/          # Component tests
    │   ├── ReviewCard.test.tsx
    │   └── ...
    │
    ├── lib/                 # Utility tests
    │   ├── queries/
    │   │   └── company.test.ts
    │   └── ...
    │
    ├── api/                 # API route tests
    │   └── reviews/
    │       └── submit.test.ts
    │
    └── e2e/                 # E2E tests
        └── search-flow.test.ts
```

### Running Tests

```bash
# Unit & Integration Tests
npm test                    # Run all
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage

# E2E Tests
npx playwright test         # Run all
npx playwright test --ui    # Interactive
npx playwright test --headed # With browser
npx playwright test search  # Specific test
```

### Writing Tests

**Component Test Example:**

```typescript
import { render, screen } from '@testing-library/react';
import ReviewCard from '@/components/ReviewCard';

describe('ReviewCard', () => {
  it('renders author name', () => {
    render(
      <ReviewCard
        authorName="John Doe"
        rating={5}
        comment="Great!"
        reviewDate={new Date()}
        source="local"
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

**API Test Example:**

```typescript
import { POST } from '@/app/api/reviews/submit/route';
import { prismaMock } from '@/__mocks__/prisma';

describe('POST /api/reviews/submit', () => {
  it('creates a review', async () => {
    prismaMock.company.findUnique.mockResolvedValue(mockCompany);
    prismaMock.review.create.mockResolvedValue(mockReview);

    const request = createMockRequest({
      method: 'POST',
      body: {
        companyId: 1,
        authorName: 'Test User',
        rating: 5,
        comment: 'Great!',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
  });
});
```

**E2E Test Example:**

```typescript
import { test, expect } from '@playwright/test';

test('search for businesses', async ({ page }) => {
  await page.goto('/');

  await page.fill('[placeholder="Search..."]', 'restaurant');
  await page.press('[placeholder="Search..."]', 'Enter');

  await expect(page).toHaveURL(/\/companies\?.*q=restaurant/);

  const results = page.locator('[data-testid="company-card"]');
  await expect(results.first()).toBeVisible();
});
```

### Test Coverage Goals

- **Overall:** >80%
- **Critical paths (queries, validation):** >90%
- **API routes:** >80%
- **Components:** >70%

---

## Code Style & Conventions

### TypeScript

**Use explicit types:**

```typescript
// ❌ BAD
const companies = await getCompanies();

// ✅ GOOD
const companies: Company[] = await getCompanies();
```

**Interfaces over types:**

```typescript
// ✅ Prefer interfaces
interface Company {
  id: number;
  name: string;
}

// Use types for unions/intersections
type CompanyWithReviews = Company & { reviews: Review[] };
```

### React Components

**Functional components with TypeScript:**

```typescript
interface Props {
  name: string;
  rating: number;
}

export default function CompanyCard({ name, rating }: Props) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{rating} stars</p>
    </div>
  );
}
```

**Use Server Components by default:**

```typescript
// app/companies/page.tsx
export default async function CompaniesPage() {
  const companies = await getCompanies(); // Server-side fetch

  return <div>{companies.map(c => <CompanyCard key={c.id} {...c} />)}</div>;
}
```

**Client Components when needed:**

```typescript
'use client';

import { useState } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `CompanyCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- API routes: `route.ts` (Next.js convention)
- Tests: `*.test.ts` or `*.test.tsx`

### Import Order

```typescript
// 1. React and Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. External libraries
import { toast } from 'sonner';

// 3. Internal utilities
import { prisma } from '@/lib/db';
import { getCompanies } from '@/lib/queries/company';

// 4. Components
import CompanyCard from '@/components/CompanyCard';

// 5. Types
import type { Company } from '@prisma/client';

// 6. Styles (if any)
import styles from './styles.module.css';
```

### Error Handling

**API Routes:**

```typescript
try {
  const data = await prisma.company.findUnique({ where: { id } });

  if (!data) {
    return NextResponse.json(
      { error: 'Company not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data });
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Contributing

### Before Contributing

1. Read this guide completely
2. Check existing issues on GitHub
3. Discuss major changes in an issue first
4. Follow code style and conventions

### Contribution Steps

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Write/update tests**
5. **Run tests and linting**
6. **Commit with conventional messages**
7. **Push to your fork**
8. **Create a Pull Request**

### Pull Request Guidelines

**PR Title:**
```
feat(companies): add favorite companies feature
```

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### Code Review Process

1. **Automated Checks** - CI must pass
2. **Code Review** - At least one approval required
3. **Testing** - Reviewer tests changes
4. **Merge** - Squash and merge to develop

---

## Troubleshooting

### Common Issues

**Issue: Database connection error**

```
Error: P1001: Can't reach database server
```

**Solution:**
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env.local`
- Test connection: `psql $DATABASE_URL`

---

**Issue: Prisma Client not found**

```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
npx prisma generate
```

---

**Issue: Port 3000 already in use**

```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

**Issue: Module not found**

```
Error: Cannot find module '@/lib/db'
```

**Solution:**
- Check `tsconfig.json` paths configuration
- Restart TypeScript server in VS Code
- Delete `.next` folder and restart

---

**Issue: TypeScript errors after update**

**Solution:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
npx prisma generate
```

---

## Additional Resources

- **[API Documentation](../api/API_REFERENCE.md)** - Complete API reference
- **[User Guide](USER_GUIDE.md)** - End-user documentation
- **[Business Owner Guide](BUSINESS_OWNER_GUIDE.md)** - Business owner docs
- **[Deployment Guide](../deployment/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Testing Guide](../technical/TESTING.md)** - Testing documentation

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

---

**Last Updated:** 25 Novembre 2025
**Version:** 2.1.0
**Maintainers:** Development Team
