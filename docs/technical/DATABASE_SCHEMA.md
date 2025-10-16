# Database Schema Documentation

## Overview

The database is designed with a **multi-tenant architecture** using PostgreSQL and Prisma ORM. The schema supports multiple directory domains with shared company data, while allowing domain-specific customization through the `CompanyContent` linking table.

## Entity Relationship Diagram

```
┌─────────────────┐
│     Domain      │
│  (Tenant/Site)  │
└────────┬────────┘
         │ 1:N
         │
         │ (via CompanyContent)
         │
         │ N:M
┌────────┴────────────┐
│     Company         │
└─────────┬───────────┘
          │ 1:N
          ├──────────────────────────────────┬──────────────┬──────────────┬──────────────┐
          │                                  │              │              │              │
┌─────────▼─────────┐  ┌──────────▼────────┐ ┌────────▼────┐ ┌──────▼──────┐ ┌─────▼─────┐
│    Review         │  │  CompanyOwnership │ │   Photo     │ │BusinessHours│ │ Analytics │
└─────────┬─────────┘  └──────────┬────────┘ └─────────────┘ └─────────────┘ └───────────┘
          │ 1:1                   │ N:1
          │                       │
┌─────────▼─────────┐  ┌──────────▼────────┐
│   ReviewReply     │  │  BusinessOwner    │
└───────────────────┘  └───────────────────┘
          │ 1:N
┌─────────▼─────────┐
│   ReviewVote      │
│   ReviewReport    │
└───────────────────┘

┌─────────────────┐
│   LegalPage     │
└────────┬────────┘
         │ N:1
         │
┌────────▼────────┐
│     Domain      │
└─────────────────┘
```

## Core Tables

### 1. Domain (Tenant/Site)

**Purpose:** Represents individual directory websites in the multi-tenant system.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Auto-incrementing primary key |
| `name` | STRING (UNIQUE) | Domain name (e.g., "haguenau.pro") |
| `isActive` | BOOLEAN | Whether the domain is active (default: true) |
| `siteTitle` | STRING? | Site-specific title |
| `siteDescription` | TEXT? | Site-specific description |
| `logoUrl` | STRING? | Site logo URL |
| `primaryColor` | STRING | Brand color (default: "#3B82F6") |
| `settings` | JSON? | Additional custom settings |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

**Relationships:**
- Has many `CompanyContent` (via "DomainContent" relation)
- Has many `LegalPage`

**Indexes:**
- `[name, isActive]` - For domain lookup with active filter
- `[isActive]` - For listing active domains
- `[createdAt DESC]` - For sorting by creation date

**Sample Query:**
```typescript
// Get active domain with its visible companies
const domain = await prisma.domain.findUnique({
  where: { name: 'haguenau.pro' },
  include: {
    content: {
      where: { isVisible: true },
      include: { company: true },
    },
  },
});
```

---

### 2. Company (Core Business Data)

**Purpose:** Stores core company/business information shared across all domains.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Auto-incrementing primary key |
| `name` | STRING | Business name |
| `slug` | STRING (UNIQUE) | URL-safe identifier (e.g., "cafe-du-marche-haguenau") |
| `googlePlaceId` | STRING? (UNIQUE) | Google Maps Place ID |
| `address` | STRING? | Street address |
| `city` | STRING? | City name |
| `postalCode` | STRING? | Postal code |
| `phone` | STRING? | Phone number |
| `email` | STRING? | Email address |
| `website` | STRING? | Website URL |
| `latitude` | FLOAT? | GPS latitude |
| `longitude` | FLOAT? | GPS longitude |
| `businessHours` | JSON? | ⚠️ DEPRECATED - Use BusinessHours model |
| `categories` | STRING[] | Business categories (e.g., ["Restaurant", "Café"]) |
| `logoUrl` | STRING? | Logo image URL |
| `coverImageUrl` | STRING? | Cover/hero image URL |
| `rating` | FLOAT? | Average rating (from Google/manual reviews) |
| `reviewCount` | INT | Total number of reviews |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

**Relationships:**
- Has many `CompanyContent` (domain-specific content)
- Has many `Review`
- Has many `CompanyOwnership`
- Has many `Photo`
- Has one `BusinessHours`
- Has many `CompanyAnalytics`

**Indexes:**
- `[slug]` - For URL lookup (most common query)
- `[city]` - For city-based filtering
- `[latitude, longitude]` - For geo-spatial queries
- `[rating DESC]` - For sorting by rating
- `[createdAt DESC]` - For sorting by date
- `[googlePlaceId]` - For Google integration

**Sample Queries:**
```typescript
// Get company by slug with all related data
const company = await prisma.company.findUnique({
  where: { slug: 'cafe-du-marche-haguenau' },
  include: {
    reviews: {
      where: { isApproved: true },
      orderBy: { reviewDate: 'desc' },
      take: 10,
    },
    photos: {
      orderBy: { order: 'asc' },
    },
    hours: true,
  },
});

// Search companies by category and city
const companies = await prisma.company.findMany({
  where: {
    categories: { has: 'Restaurant' },
    city: 'Haguenau',
    content: {
      some: {
        domainId: 1,
        isVisible: true,
      },
    },
  },
  orderBy: { rating: 'desc' },
});

// Nearby companies using GPS
const nearbyCompanies = await prisma.$queryRaw`
  SELECT * FROM companies
  WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(${userLat})) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(${userLng})) +
        sin(radians(${userLat})) * sin(radians(latitude))
      )
    ) < 10
  ORDER BY rating DESC
  LIMIT 20
`;
```

---

### 3. CompanyContent (Multi-Tenant Link)

**Purpose:** Links companies to domains with domain-specific customization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Auto-incrementing primary key |
| `companyId` | INT (FK) | Reference to Company |
| `domainId` | INT (FK) | Reference to Domain |
| `isVisible` | BOOLEAN | Whether company is visible on this domain (default: false) |
| `customDescription` | TEXT? | Domain-specific description |
| `customImages` | JSON? | Array of domain-specific images |
| `promotions` | TEXT? | Special promotions for this domain |
| `specialOffers` | TEXT? | Special offers for this domain |
| `highlightedServices` | STRING[] | Featured services |
| `customTags` | STRING[] | Domain-specific tags |
| `metaTitle` | STRING? | SEO meta title override |
| `metaDescription` | STRING? | SEO meta description override |
| `customFields` | JSON? | Additional custom fields |
| `featuredUntil` | DATETIME? | Featured listing expiration |
| `priority` | INT | Sorting priority (0-100, default: 0) |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

**Relationships:**
- Belongs to `Company`
- Belongs to `Domain`

**Unique Constraint:**
- `[companyId, domainId]` - One entry per company per domain

**Indexes:**
- `[domainId, isVisible]` - For listing visible companies
- `[domainId, isVisible, priority DESC]` - For featured/prioritized listings
- `[companyId, domainId]` - For quick lookups
- `[updatedAt DESC]` - For recently updated content

**Sample Queries:**
```typescript
// Get visible companies for a domain
const visibleCompanies = await prisma.companyContent.findMany({
  where: {
    domainId: 1,
    isVisible: true,
  },
  include: {
    company: true,
  },
  orderBy: [
    { priority: 'desc' },
    { company: { rating: 'desc' } },
  ],
});

// Add company to domain
await prisma.companyContent.create({
  data: {
    companyId: 123,
    domainId: 1,
    isVisible: true,
    priority: 50,
    customDescription: 'La meilleure boulangerie de Haguenau!',
  },
});

// Update domain-specific content
await prisma.companyContent.update({
  where: {
    companyId_domainId: {
      companyId: 123,
      domainId: 1,
    },
  },
  data: {
    priority: 100,
    featuredUntil: new Date('2025-12-31'),
  },
});
```

---

### 4. Review (User Reviews)

**Purpose:** Stores customer reviews from Google or manual submissions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Auto-incrementing primary key |
| `companyId` | INT (FK) | Reference to Company |
| `authorName` | STRING | Reviewer name |
| `authorPhoto` | STRING? | Reviewer photo URL |
| `authorEmail` | STRING? | Reviewer email (for contact) |
| `rating` | INT | Rating (1-5) |
| `comment` | TEXT? | Review text |
| `photos` | STRING[] | Array of review photo URLs (max 5) |
| `source` | STRING | Source ("google" or "manual", default: "manual") |
| `reviewDate` | DATETIME | Date of review |
| `isApproved` | BOOLEAN | Admin approval status (default: true) |
| `isVerified` | BOOLEAN | Verified purchase badge (default: false) |
| `verifiedAt` | DATETIME? | Verification timestamp |
| `verifiedBy` | STRING? | BusinessOwner ID who verified |
| `helpfulCount` | INT | Number of helpful votes |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

**Relationships:**
- Belongs to `Company`
- Has one `ReviewReply` (optional)
- Has many `ReviewVote`
- Has many `ReviewReport`

**Indexes:**
- `[companyId, isApproved, reviewDate DESC]` - For company reviews listing
- `[isApproved, createdAt DESC]` - For admin moderation
- `[source]` - For filtering by source
- `[companyId, rating DESC, reviewDate DESC]` - For sorting by rating

**Sample Queries:**
```typescript
// Get approved reviews for a company
const reviews = await prisma.review.findMany({
  where: {
    companyId: 123,
    isApproved: true,
  },
  include: {
    reply: true,
  },
  orderBy: [
    { isVerified: 'desc' },
    { reviewDate: 'desc' },
  ],
  take: 20,
});

// Calculate average rating
const stats = await prisma.review.aggregate({
  where: {
    companyId: 123,
    isApproved: true,
  },
  _avg: { rating: true },
  _count: { id: true },
});

// Get recent reviews across all companies
const recentReviews = await prisma.review.findMany({
  where: { isApproved: true },
  include: {
    company: {
      select: { name: true, slug: true },
    },
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
});
```

---

### 5. BusinessOwner (Business Dashboard Users)

**Purpose:** Business owners who can claim and manage their company listings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | STRING (PK) | CUID primary key |
| `email` | STRING (UNIQUE) | Email address |
| `password` | STRING | Bcrypt hashed password |
| `firstName` | STRING? | First name |
| `lastName` | STRING? | Last name |
| `phone` | STRING? | Phone number |
| `emailVerified` | DATETIME? | Email verification timestamp |
| `phoneVerified` | DATETIME? | Phone verification timestamp |
| `emailNewReview` | BOOLEAN | Email on new review (default: true) |
| `emailReviewReply` | BOOLEAN | Email on review reply (default: true) |
| `emailWeeklyDigest` | BOOLEAN | Weekly summary email (default: false) |
| `emailMarketing` | BOOLEAN | Marketing emails (default: false) |
| `unsubscribeToken` | STRING (UNIQUE) | Token for email unsubscribe |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

**Relationships:**
- Has many `CompanyOwnership`
- Has many `ReviewReply`

**Indexes:**
- `[email]` - For login lookup
- `[unsubscribeToken]` - For email unsubscribe

**Sample Queries:**
```typescript
// Create new business owner
const owner = await prisma.businessOwner.create({
  data: {
    email: 'owner@example.com',
    password: hashedPassword,
    firstName: 'Jean',
    lastName: 'Dupont',
  },
});

// Get owner with all owned companies
const ownerWithCompanies = await prisma.businessOwner.findUnique({
  where: { email: 'owner@example.com' },
  include: {
    companies: {
      include: {
        company: {
          include: {
            reviews: {
              where: { isApproved: true },
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
      },
    },
  },
});
```

---

### 6. CompanyOwnership (Company-Owner Link)

**Purpose:** Many-to-many relationship between companies and business owners.

| Column | Type | Description |
|--------|------|-------------|
| `id` | STRING (PK) | CUID primary key |
| `companyId` | INT (FK) | Reference to Company |
| `ownerId` | STRING (FK) | Reference to BusinessOwner |
| `role` | STRING | Role ("owner", "manager", "editor", default: "owner") |
| `verified` | BOOLEAN | Ownership verification status (default: false) |
| `createdAt` | DATETIME | Creation timestamp |

**Relationships:**
- Belongs to `Company`
- Belongs to `BusinessOwner`

**Unique Constraint:**
- `[companyId, ownerId]` - One ownership per company per owner

**Indexes:**
- `[ownerId]` - For user's companies
- `[companyId]` - For company's owners

**Sample Queries:**
```typescript
// Claim a company
await prisma.companyOwnership.create({
  data: {
    companyId: 123,
    ownerId: 'clx123abc',
    role: 'owner',
    verified: false, // Pending verification
  },
});

// Verify ownership
await prisma.companyOwnership.update({
  where: {
    companyId_ownerId: {
      companyId: 123,
      ownerId: 'clx123abc',
    },
  },
  data: { verified: true },
});
```

---

## Supporting Tables

### 7. User (Admin Users)

**Purpose:** Admin panel users for managing the platform.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Auto-incrementing primary key |
| `email` | STRING (UNIQUE) | Email address |
| `passwordHash` | STRING | Hashed password |
| `name` | STRING? | Full name |
| `role` | STRING | Role ("admin", "editor", default: "admin") |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

**Indexes:**
- `[email]` - For login
- `[role]` - For role-based filtering

---

### 8. Photo (Company Images)

**Purpose:** Company photo gallery.

| Column | Type | Description |
|--------|------|-------------|
| `id` | STRING (PK) | CUID primary key |
| `companyId` | INT (FK) | Reference to Company |
| `url` | STRING | Image URL (Vercel Blob/Cloudinary) |
| `thumbnail` | STRING? | Thumbnail URL |
| `caption` | STRING? | Photo caption |
| `order` | INT | Display order (default: 0) |
| `type` | STRING | Type ("logo", "cover", "gallery", "interior", "product") |
| `isPrimary` | BOOLEAN | Is primary photo (default: false) |
| `uploadedBy` | STRING? | BusinessOwner ID |
| `createdAt` | DATETIME | Creation timestamp |

**Indexes:**
- `[companyId, order]` - For ordered display
- `[companyId, type]` - For filtering by type

---

### 9. BusinessHours (Operating Hours)

**Purpose:** Weekly operating hours and special schedules.

| Column | Type | Description |
|--------|------|-------------|
| `id` | STRING (PK) | CUID primary key |
| `companyId` | INT (UNIQUE FK) | Reference to Company |
| `monday` | JSON? | `{ open: "09:00", close: "18:00", closed: false }` |
| `tuesday` | JSON? | Same format |
| `wednesday` | JSON? | Same format |
| `thursday` | JSON? | Same format |
| `friday` | JSON? | Same format |
| `saturday` | JSON? | Same format |
| `sunday` | JSON? | Same format |
| `specialHours` | JSON? | `[{ date: "2025-12-25", closed: true, note: "Noël" }]` |
| `timezone` | STRING | Timezone (default: "Europe/Paris") |
| `updatedAt` | DATETIME | Last update timestamp |

**Sample Data:**
```typescript
await prisma.businessHours.create({
  data: {
    companyId: 123,
    monday: { open: '08:00', close: '19:00', closed: false },
    tuesday: { open: '08:00', close: '19:00', closed: false },
    sunday: { closed: true },
    specialHours: [
      { date: '2025-12-25', closed: true, note: 'Noël' },
      { date: '2025-01-01', closed: true, note: 'Nouvel An' },
    ],
  },
});
```

---

### 10. CompanyAnalytics (Metrics)

**Purpose:** Track company page views and engagement.

| Column | Type | Description |
|--------|------|-------------|
| `id` | STRING (PK) | CUID primary key |
| `companyId` | INT (FK) | Reference to Company |
| `date` | DATE | Analytics date |
| `profileViews` | INT | Profile page views |
| `uniqueVisitors` | INT | Unique visitors |
| `phoneClicks` | INT | Phone number clicks |
| `websiteClicks` | INT | Website link clicks |
| `emailClicks` | INT | Email clicks |
| `directionsClicks` | INT | Directions clicks |
| `sourceOrganic` | INT | Organic traffic |
| `sourceSearch` | INT | Search traffic |
| `sourceDirect` | INT | Direct traffic |
| `sourceReferral` | INT | Referral traffic |

**Unique Constraint:**
- `[companyId, date]` - One entry per company per day

**Indexes:**
- `[companyId, date DESC]` - For time-series queries

**Sample Query:**
```typescript
// Get analytics for last 30 days
const analytics = await prisma.companyAnalytics.findMany({
  where: {
    companyId: 123,
    date: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  },
  orderBy: { date: 'desc' },
});
```

---

### 11. ReviewReply (Business Responses)

**Purpose:** Business owner responses to reviews.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Auto-incrementing primary key |
| `reviewId` | INT (UNIQUE FK) | Reference to Review (one reply per review) |
| `ownerId` | STRING (FK) | Reference to BusinessOwner |
| `content` | TEXT | Reply text |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

---

### 12. ReviewVote (Helpful Votes)

**Purpose:** Track helpful votes on reviews.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Auto-incrementing primary key |
| `reviewId` | INT (FK) | Reference to Review |
| `voterIp` | STRING | Voter IP address |
| `voterSession` | STRING? | Session ID |
| `isHelpful` | BOOLEAN | Is helpful (true) or not (false) |
| `createdAt` | DATETIME | Creation timestamp |

**Unique Constraint:**
- `[reviewId, voterIp]` - One vote per IP per review

---

### 13. ReviewReport (Report Reviews)

**Purpose:** Users can report inappropriate reviews.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Auto-incrementing primary key |
| `reviewId` | INT (FK) | Reference to Review |
| `reporterIp` | STRING | Reporter IP |
| `reason` | STRING | Reason ("spam", "offensive", "fake", "other") |
| `description` | TEXT? | Detailed description |
| `status` | STRING | Status ("pending", "reviewed", "resolved", "dismissed") |
| `reviewedAt` | DATETIME? | Review timestamp |
| `reviewedBy` | STRING? | Admin user ID |
| `createdAt` | DATETIME | Creation timestamp |

---

### 14. LegalPage (Footer Pages)

**Purpose:** Legal pages (privacy policy, terms, etc.) per domain.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Auto-incrementing primary key |
| `slug` | STRING (UNIQUE) | URL slug (e.g., "mentions-legales") |
| `title` | STRING | Page title |
| `content` | TEXT | Page content (HTML/Markdown) |
| `domainId` | INT? (FK) | Domain (null = applies to all) |
| `isActive` | BOOLEAN | Is active (default: true) |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

---

## Database Operations

### Common Queries

**1. Get companies for a domain with filters:**
```typescript
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
  return prisma.company.findMany({
    where: {
      content: {
        some: {
          domainId,
          isVisible: true,
        },
      },
      ...(category && { categories: { has: category } }),
      ...(city && { city }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { categories: { hasSome: [search] } },
        ],
      }),
    },
    include: {
      content: {
        where: { domainId },
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

**2. Update company rating (aggregate from reviews):**
```typescript
export async function updateCompanyRating(companyId: number) {
  const stats = await prisma.review.aggregate({
    where: {
      companyId,
      isApproved: true,
    },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.company.update({
    where: { id: companyId },
    data: {
      rating: stats._avg.rating || null,
      reviewCount: stats._count.id,
    },
  });
}
```

**3. Get business owner dashboard data:**
```typescript
export async function getOwnerDashboard(ownerId: string) {
  const ownerships = await prisma.companyOwnership.findMany({
    where: { ownerId },
    include: {
      company: {
        include: {
          reviews: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          analytics: {
            where: {
              date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            orderBy: { date: 'desc' },
          },
        },
      },
    },
  });

  return ownerships;
}
```

### Migrations

**Create migration:**
```bash
npx prisma migrate dev --name add_new_feature
```

**Apply migrations to production:**
```bash
npx prisma migrate deploy
```

**Reset database (development only):**
```bash
npx prisma migrate reset
```

**Generate Prisma Client:**
```bash
npx prisma generate
```

### Seeding

**Run seed script:**
```bash
npx prisma db seed
```

**Seed configuration** (`package.json`):
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

## Performance Optimization

### Indexes

All indexes are defined in the schema for optimal query performance:

- **Composite indexes** for common filter combinations (e.g., `[domainId, isVisible, priority]`)
- **Sorting indexes** for DESC operations (e.g., `[createdAt DESC]`)
- **Unique constraints** for data integrity (e.g., `[companyId, domainId]`)

### Query Optimization Tips

1. **Always use domain filtering:**
```typescript
// Good
const companies = await prisma.company.findMany({
  where: {
    content: { some: { domainId: 1, isVisible: true } },
  },
});

// Bad (returns all companies)
const companies = await prisma.company.findMany();
```

2. **Use select to limit returned fields:**
```typescript
const companies = await prisma.company.findMany({
  select: {
    id: true,
    name: true,
    slug: true,
    rating: true,
  },
});
```

3. **Paginate large result sets:**
```typescript
const companies = await prisma.company.findMany({
  take: 20,
  skip: page * 20,
});
```

4. **Use aggregations for statistics:**
```typescript
const stats = await prisma.review.groupBy({
  by: ['rating'],
  where: { companyId: 123 },
  _count: { id: true },
});
```

## Backup and Recovery

### Backup Strategy

**Automated backups:**
- Vercel Postgres: Automatic daily backups (7-day retention)
- Supabase: Point-in-time recovery (up to 7 days)
- Neon: Branch-based backups

**Manual backup:**
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

**Restore from backup:**
```bash
psql $DATABASE_URL < backup-20250116.sql
```

### Data Integrity

**Foreign key constraints:**
- All relationships use `onDelete: Cascade` for automatic cleanup
- Orphaned records are automatically prevented

**Transaction support:**
```typescript
await prisma.$transaction([
  prisma.company.create({ data: companyData }),
  prisma.companyContent.create({ data: contentData }),
]);
```

## Security Considerations

1. **Row-Level Security (RLS):** Always filter by `domainId` to prevent cross-tenant data access
2. **Password Hashing:** Use bcrypt with salt rounds ≥10 for `BusinessOwner.password`
3. **SQL Injection:** Prisma automatically parameterizes queries
4. **Sensitive Data:** Never log `password`, `passwordHash`, or API keys
5. **Rate Limiting:** Implement rate limiting on review/vote endpoints

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Multi-Tenant Guide](./MULTI_TENANT.md)
- [API Reference](../api/API_REFERENCE.md)
- [Developer Guide](../guides/DEVELOPER_GUIDE.md)
