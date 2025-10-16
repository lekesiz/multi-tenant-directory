# Multi-Tenant Architecture Guide

## Overview

This platform uses a **domain-based multi-tenant architecture** where each domain (e.g., `haguenau.pro`, `strasbourg.directory`) operates as an independent directory site while sharing the same codebase and database infrastructure.

## Architecture Principles

### 1. Shared Database with Logical Isolation

- **One database** for all tenants
- **Logical separation** via `CompanyContent` linking table
- **Domain-based filtering** enforced at the query level
- **No physical data isolation** (cost-effective, easier maintenance)

### 2. Domain-Based Tenant Identification

Each incoming request is mapped to a tenant based on:
- **Request hostname** (e.g., `haguenau.pro`)
- **Domain lookup** in the `Domain` table
- **Middleware injection** of `domainId` into request context

### 3. Data Sharing Model

**Shared Across Tenants:**
- Company core data (name, address, phone, GPS)
- Reviews (can be shown on multiple domains)
- Business owners (can manage multiple domains)
- Analytics (aggregated per domain)

**Tenant-Specific:**
- Company visibility (`CompanyContent.isVisible`)
- Custom descriptions and promotions
- Featured listings and priority
- SEO metadata
- Domain branding (logo, colors)

## How It Works

### Request Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. User Request: https://haguenau.pro/companies                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. Middleware: Extract hostname → "haguenau.pro"                   │
│     - Next.js middleware runs on all requests                       │
│     - Extracts hostname from request.headers.host                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. Domain Lookup: Query Domain table                               │
│     SELECT * FROM domains WHERE name = 'haguenau.pro'              │
│     → domainId = 1                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. Inject into Request Context                                     │
│     req.domain = { id: 1, name: 'haguenau.pro', ... }              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. Query with Domain Filter                                        │
│     SELECT * FROM companies                                         │
│     WHERE EXISTS (                                                  │
│       SELECT 1 FROM company_content                                 │
│       WHERE company_id = companies.id                               │
│         AND domain_id = 1                                           │
│         AND is_visible = true                                       │
│     )                                                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6. Render Response with Domain-Specific Data                       │
│     - Companies visible on haguenau.pro only                        │
│     - Custom descriptions for this domain                           │
│     - Domain branding (logo, colors)                                │
└─────────────────────────────────────────────────────────────────────┘
```

### Database Structure

**Domain Table** (Tenant Configuration)
```typescript
{
  id: 1,
  name: 'haguenau.pro',
  siteTitle: 'Haguenau Business Directory',
  siteDescription: 'Find the best businesses in Haguenau',
  logoUrl: '/logos/haguenau.svg',
  primaryColor: '#3B82F6',
  isActive: true,
}
```

**Company Table** (Shared Core Data)
```typescript
{
  id: 101,
  name: 'Café du Marché',
  slug: 'cafe-du-marche-haguenau',
  address: '10 Place du Marché',
  city: 'Haguenau',
  phone: '+33388936789',
  latitude: 48.8156,
  longitude: 7.7889,
  categories: ['Restaurant', 'Café'],
  rating: 4.5,
  reviewCount: 42,
}
```

**CompanyContent Table** (Tenant-Specific Link)
```typescript
// Entry 1: Visible on haguenau.pro
{
  id: 1,
  companyId: 101, // Café du Marché
  domainId: 1,    // haguenau.pro
  isVisible: true,
  customDescription: 'Le meilleur café du centre-ville!',
  priority: 100,  // Featured listing
  featuredUntil: '2025-12-31',
}

// Entry 2: Same company, different domain
{
  id: 2,
  companyId: 101, // Same Café du Marché
  domainId: 2,    // strasbourg.directory
  isVisible: false, // Not visible on this domain
}
```

## Implementation Guide

### Step 1: Domain Configuration

**Create a new domain:**
```typescript
// prisma/seed.ts or admin panel
const domain = await prisma.domain.create({
  data: {
    name: 'colmar.directory',
    siteTitle: 'Colmar Business Directory',
    siteDescription: 'Discover businesses in Colmar',
    logoUrl: '/logos/colmar.svg',
    primaryColor: '#10B981',
    isActive: true,
  },
});
```

**Update environment variables:**
```bash
# .env.local
NEXT_PUBLIC_ALLOWED_DOMAINS=haguenau.pro,strasbourg.directory,colmar.directory
```

### Step 2: Middleware Setup

**Create middleware** (`src/middleware.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function middleware(request: NextRequest) {
  // Extract hostname
  const hostname = request.headers.get('host') || '';
  const domainName = hostname.split(':')[0]; // Remove port if localhost

  // Development: Map localhost to default domain
  const actualDomain = domainName.includes('localhost')
    ? 'haguenau.pro'
    : domainName;

  // Lookup domain
  const domain = await prisma.domain.findUnique({
    where: { name: actualDomain },
  });

  if (!domain || !domain.isActive) {
    return NextResponse.json(
      { error: 'Domain not found or inactive' },
      { status: 404 }
    );
  }

  // Inject domain into request headers (accessible in Server Components)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-domain-id', domain.id.toString());
  requestHeaders.set('x-domain-name', domain.name);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### Step 3: Domain Context Helper

**Create helper** (`src/lib/domain.ts`):
```typescript
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

/**
 * Get current domain from request headers (Server Components)
 */
export async function getCurrentDomain() {
  const headersList = headers();
  const domainId = headersList.get('x-domain-id');
  const domainName = headersList.get('x-domain-name');

  if (!domainId) {
    throw new Error('Domain not found in request context');
  }

  return {
    id: parseInt(domainId),
    name: domainName || '',
  };
}

/**
 * Get full domain details
 */
export async function getDomainDetails() {
  const { id } = await getCurrentDomain();

  return prisma.domain.findUnique({
    where: { id },
  });
}
```

### Step 4: Query Filtering Patterns

**Pattern 1: Server Component (Recommended)**
```typescript
// src/app/companies/page.tsx
import { getCurrentDomain } from '@/lib/domain';
import { getCompanies } from '@/lib/queries/company';

export default async function CompaniesPage() {
  const { id: domainId } = await getCurrentDomain();

  const companies = await getCompanies({
    domainId,
    limit: 20,
  });

  return (
    <div>
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
```

**Pattern 2: API Route**
```typescript
// src/app/api/companies/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Extract domain from headers (set by middleware)
  const domainId = parseInt(request.headers.get('x-domain-id') || '0');

  if (!domainId) {
    return Response.json({ error: 'Domain required' }, { status: 400 });
  }

  const companies = await prisma.company.findMany({
    where: {
      content: {
        some: {
          domainId,
          isVisible: true,
        },
      },
    },
    include: {
      content: {
        where: { domainId },
      },
    },
  });

  return Response.json({ companies });
}
```

**Pattern 3: Centralized Query Function**
```typescript
// src/lib/queries/company.ts
import { prisma } from '@/lib/db';

export async function getCompanies({
  domainId,
  category,
  city,
  search,
  limit = 20,
  offset = 0,
}: {
  domainId: number;
  category?: string;
  city?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  // ALWAYS filter by domainId
  return prisma.company.findMany({
    where: {
      // Multi-tenant filter (REQUIRED)
      content: {
        some: {
          domainId,
          isVisible: true,
        },
      },
      // Additional filters
      ...(category && { categories: { has: category } }),
      ...(city && { city }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      content: {
        where: { domainId }, // Include only current domain's content
      },
    },
    orderBy: [
      { content: { priority: 'desc' } },
      { rating: 'desc' },
    ],
    take: limit,
    skip: offset,
  });
}
```

### Step 5: Adding Companies to Domains

**Option A: Bulk Import (Recommended for new domains)**
```typescript
// scripts/import-companies.ts
import { prisma } from '@/lib/db';

async function importCompanies(domainId: number, companies: any[]) {
  for (const companyData of companies) {
    // Create or find company
    const company = await prisma.company.upsert({
      where: { slug: companyData.slug },
      create: {
        name: companyData.name,
        slug: companyData.slug,
        address: companyData.address,
        city: companyData.city,
        phone: companyData.phone,
        latitude: companyData.latitude,
        longitude: companyData.longitude,
        categories: companyData.categories,
      },
      update: {}, // Don't update if exists
    });

    // Link to domain
    await prisma.companyContent.upsert({
      where: {
        companyId_domainId: {
          companyId: company.id,
          domainId,
        },
      },
      create: {
        companyId: company.id,
        domainId,
        isVisible: true,
        customDescription: companyData.description,
        priority: 0,
      },
      update: {
        isVisible: true,
      },
    });
  }
}
```

**Option B: Admin Panel (Manual)**
```typescript
// Admin panel action
async function addCompanyToDomain(
  companyId: number,
  domainId: number,
  options?: {
    customDescription?: string;
    priority?: number;
    featuredUntil?: Date;
  }
) {
  return prisma.companyContent.create({
    data: {
      companyId,
      domainId,
      isVisible: true,
      customDescription: options?.customDescription,
      priority: options?.priority || 0,
      featuredUntil: options?.featuredUntil,
    },
  });
}
```

## Advanced Patterns

### 1. Domain-Specific Branding

**Layout with dynamic branding:**
```typescript
// src/app/layout.tsx
import { getDomainDetails } from '@/lib/domain';

export default async function RootLayout({ children }) {
  const domain = await getDomainDetails();

  return (
    <html lang="fr">
      <head>
        <title>{domain?.siteTitle || 'Directory'}</title>
        <meta name="description" content={domain?.siteDescription || ''} />
        <style>{`
          :root {
            --primary-color: ${domain?.primaryColor || '#3B82F6'};
          }
        `}</style>
      </head>
      <body>
        <header>
          {domain?.logoUrl && (
            <img src={domain.logoUrl} alt={domain.siteTitle} />
          )}
        </header>
        {children}
      </body>
    </html>
  );
}
```

### 2. Cross-Domain Company Visibility

**Show company on multiple domains:**
```typescript
async function makeCompanyMultiDomain(
  companyId: number,
  domainIds: number[]
) {
  await Promise.all(
    domainIds.map((domainId) =>
      prisma.companyContent.upsert({
        where: {
          companyId_domainId: { companyId, domainId },
        },
        create: {
          companyId,
          domainId,
          isVisible: true,
        },
        update: {
          isVisible: true,
        },
      })
    )
  );
}
```

### 3. Domain-Specific Promotions

**Featured listings:**
```typescript
async function featureCompany(
  companyId: number,
  domainId: number,
  durationDays: number
) {
  const featuredUntil = new Date();
  featuredUntil.setDate(featuredUntil.getDate() + durationDays);

  await prisma.companyContent.update({
    where: {
      companyId_domainId: { companyId, domainId },
    },
    data: {
      priority: 100,
      featuredUntil,
      promotions: 'Featured listing - special offer!',
    },
  });
}
```

### 4. Analytics Per Domain

**Track views per domain:**
```typescript
async function trackCompanyView(
  companyId: number,
  domainId: number,
  source: 'organic' | 'search' | 'direct' | 'referral'
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.companyAnalytics.upsert({
    where: {
      companyId_date: { companyId, date: today },
    },
    create: {
      companyId,
      date: today,
      profileViews: 1,
      uniqueVisitors: 1,
      [`source${source.charAt(0).toUpperCase() + source.slice(1)}`]: 1,
    },
    update: {
      profileViews: { increment: 1 },
      [`source${source.charAt(0).toUpperCase() + source.slice(1)}`]: { increment: 1 },
    },
  });
}
```

## Testing Multi-Tenant Logic

### Unit Tests

**Test domain filtering:**
```typescript
// src/__tests__/lib/queries/company.test.ts
import { getCompanies } from '@/lib/queries/company';
import { prismaMock } from '@/__mocks__/prisma';

describe('getCompanies - Multi-Tenant', () => {
  it('should only return companies visible on specified domain', async () => {
    const mockCompanies = [
      { id: 1, name: 'Company A', content: [{ domainId: 1, isVisible: true }] },
      { id: 2, name: 'Company B', content: [{ domainId: 1, isVisible: false }] },
      { id: 3, name: 'Company C', content: [{ domainId: 2, isVisible: true }] },
    ];

    prismaMock.company.findMany.mockResolvedValue([mockCompanies[0]]);

    const result = await getCompanies({ domainId: 1 });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Company A');
    expect(prismaMock.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          content: {
            some: {
              domainId: 1,
              isVisible: true,
            },
          },
        }),
      })
    );
  });
});
```

### Integration Tests

**Test domain isolation:**
```typescript
describe('Domain Isolation', () => {
  it('should not leak data between domains', async () => {
    // Create two domains
    const domain1 = await prisma.domain.create({
      data: { name: 'test1.com' },
    });
    const domain2 = await prisma.domain.create({
      data: { name: 'test2.com' },
    });

    // Create a company visible only on domain1
    const company = await prisma.company.create({
      data: {
        name: 'Test Company',
        slug: 'test-company',
        content: {
          create: [
            { domainId: domain1.id, isVisible: true },
            { domainId: domain2.id, isVisible: false },
          ],
        },
      },
    });

    // Query from domain1 - should find company
    const domain1Companies = await getCompanies({ domainId: domain1.id });
    expect(domain1Companies).toHaveLength(1);

    // Query from domain2 - should NOT find company
    const domain2Companies = await getCompanies({ domainId: domain2.id });
    expect(domain2Companies).toHaveLength(0);
  });
});
```

## Common Pitfalls

### ❌ Mistake 1: Forgetting Domain Filter

```typescript
// WRONG - Returns ALL companies across all domains!
const companies = await prisma.company.findMany();

// CORRECT - Filters by domain
const companies = await prisma.company.findMany({
  where: {
    content: {
      some: {
        domainId,
        isVisible: true,
      },
    },
  },
});
```

### ❌ Mistake 2: Hard-Coding Domain ID

```typescript
// WRONG - Hard-coded domain
const domainId = 1;

// CORRECT - Get from request context
const { id: domainId } = await getCurrentDomain();
```

### ❌ Mistake 3: Not Including Domain Content

```typescript
// WRONG - Missing domain-specific customization
const company = await prisma.company.findUnique({
  where: { slug },
});

// CORRECT - Include domain content
const company = await prisma.company.findUnique({
  where: { slug },
  include: {
    content: {
      where: { domainId },
    },
  },
});
```

### ❌ Mistake 4: Cross-Domain Data Leaks

```typescript
// WRONG - Reviews from all domains mixed together
const reviews = await prisma.review.findMany({
  where: { companyId },
});

// CORRECT - Filter reviews by domain (if needed)
// In this case, reviews are shared across domains,
// but you might want to filter by company visibility:
const reviews = await prisma.review.findMany({
  where: {
    companyId,
    company: {
      content: {
        some: {
          domainId,
          isVisible: true,
        },
      },
    },
  },
});
```

## Performance Considerations

### 1. Index Optimization

Ensure indexes exist for domain filtering:
```prisma
@@index([domainId, isVisible])
@@index([domainId, isVisible, priority(sort: Desc)])
```

### 2. Query Caching

Cache domain lookups:
```typescript
// src/lib/domain-cache.ts
const domainCache = new Map<string, Domain>();

export async function getCachedDomain(name: string) {
  if (domainCache.has(name)) {
    return domainCache.get(name);
  }

  const domain = await prisma.domain.findUnique({
    where: { name },
  });

  if (domain) {
    domainCache.set(name, domain);
  }

  return domain;
}
```

### 3. Connection Pooling

Use Prisma connection pooling for multi-tenant scalability:
```env
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=20&pool_timeout=20"
```

## Deployment Checklist

- [ ] All queries include domain filtering
- [ ] Middleware properly extracts domain from hostname
- [ ] Domain configuration added to database
- [ ] Environment variables include new domain
- [ ] DNS configured to point to deployment
- [ ] SSL certificate covers new domain
- [ ] Test domain isolation (no data leaks)
- [ ] Analytics tracking per domain
- [ ] Legal pages configured per domain

## Adding a New Tenant (Step-by-Step)

1. **Database:** Create domain entry
2. **Environment:** Add to `NEXT_PUBLIC_ALLOWED_DOMAINS`
3. **DNS:** Point domain to Vercel/deployment
4. **Data:** Import companies for this domain
5. **Branding:** Upload logo, set colors
6. **Legal:** Add legal pages
7. **Test:** Verify isolation and functionality
8. **Monitor:** Set up analytics and uptime monitoring

## Related Documentation

- [Database Schema](./DATABASE_SCHEMA.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Developer Guide](../guides/DEVELOPER_GUIDE.md)
- [API Reference](../api/API_REFERENCE.md)
