# 🏗️ System Architecture - Directory Platform

**Version:** 1.0.0
**Last Updated:** 16 Octobre 2025

---

## Table of Contents

1. [Overview](#overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Application Architecture](#application-architecture)
4. [Data Flow](#data-flow)
5. [Multi-Tenant Architecture](#multi-tenant-architecture)
6. [Authentication Flow](#authentication-flow)
7. [API Architecture](#api-architecture)
8. [Database Architecture](#database-architecture)
9. [Frontend Architecture](#frontend-architecture)
10. [Security Architecture](#security-architecture)
11. [Performance Optimization](#performance-optimization)
12. [Deployment Architecture](#deployment-architecture)

---

## Overview

### System Type
Multi-tenant SaaS business directory platform

### Architecture Style
- **Pattern:** Monolithic (Next.js full-stack)
- **Rendering:** Hybrid (SSR + CSR + SSG)
- **Database:** Relational (PostgreSQL)
- **Multi-Tenancy:** Domain-based isolation

### Key Characteristics
- ✅ Scalable multi-tenant design
- ✅ SEO-optimized (SSR + static generation)
- ✅ Real-time data updates
- ✅ Mobile-first responsive
- ✅ API-first architecture
- ✅ Type-safe (TypeScript)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
│  End Users │ Business Owners │ Administrators │ API Clients │
└──────┬──────────────┬─────────────────┬──────────────┬──────┘
       │              │                 │              │
       └──────────────┴─────────────────┴──────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   DNS / CDN       │
                    │  (Cloudflare)     │
                    └─────────┬─────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
┌──────▼────────┐    ┌────────▼────────┐    ┌──────▼────────┐
│ haguenau.pro  │    │ strasbourg.pro  │    │  colmar.pro   │
│   (Tenant 1)  │    │   (Tenant 2)    │    │  (Tenant 3)   │
└──────┬────────┘    └────────┬────────┘    └──────┬────────┘
       │                      │                     │
       └──────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   NEXT.JS APP      │
                    │  (App Router)      │
                    │                    │
                    │ ┌────────────────┐ │
                    │ │  Middleware    │ │ Domain Detection
                    │ └────────────────┘ │
                    │                    │
                    │ ┌────────────────┐ │
                    │ │  API Routes    │ │ REST API
                    │ └────────────────┘ │
                    │                    │
                    │ ┌────────────────┐ │
                    │ │  Pages/Routes  │ │ SSR/SSG
                    │ └────────────────┘ │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
      ┌───────▼────────┐ ┌───▼────┐  ┌──────▼────────┐
      │  PostgreSQL    │ │ Redis  │  │ External APIs │
      │   Database     │ │ Cache  │  │ - Google Maps │
      │  - Companies   │ │        │  │ - Cloudinary  │
      │  - Reviews     │ │        │  │ - SendGrid    │
      │  - Users       │ │        │  │               │
      │  - Domains     │ │        │  │               │
      └────────────────┘ └────────┘  └───────────────┘
```

---

## Application Architecture

### Layer Architecture

```
┌───────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                    │
│  React Components │ Pages │ Layouts │ UI Components  │
└──────────────────────┬────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────┐
│                  APPLICATION LAYER                    │
│   Business Logic │ Hooks │ Context │ State Management│
└──────────────────────┬────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────┐
│                     API LAYER                         │
│    Next.js API Routes │ Server Actions │ Middleware  │
└──────────────────────┬────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────┐
│                   SERVICE LAYER                       │
│    Queries │ Mutations │ Validation │ Auth Services  │
└──────────────────────┬────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────┐
│                DATA ACCESS LAYER                      │
│          Prisma ORM │ Database Models                 │
└──────────────────────┬────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────┐
│                 DATABASE LAYER                        │
│                  PostgreSQL                           │
└───────────────────────────────────────────────────────┘
```

### Directory Structure Mapping

```
src/
├── app/                    → Presentation Layer (Pages)
│   ├── (public)/          → Public pages
│   ├── admin/             → Admin pages
│   ├── business/          → Business owner pages
│   └── api/               → API Layer
│
├── components/            → Presentation Layer (Components)
│   ├── ui/               → Base UI components
│   └── ...               → Feature components
│
├── lib/                  → Service Layer
│   ├── queries/          → Database queries
│   ├── validation/       → Input validation
│   ├── auth/             → Authentication
│   └── ...               → Utilities
│
├── hooks/                → Application Layer
│   └── ...               → Custom React hooks
│
├── middleware.ts         → API Layer (Request handling)
│
└── types/                → Type definitions
```

---

## Data Flow

### Request Flow (Server-Side Rendering)

```
1. User Request
   ↓
2. DNS Resolution (Cloudflare)
   ↓
3. Next.js Middleware
   - Extract domain from host header
   - Identify tenant (Domain ID)
   - Add to request context
   ↓
4. Page Component (Server Component)
   - Execute server-side code
   - Fetch data from database
   - Filter by tenant domain
   ↓
5. Prisma ORM
   - Build SQL query
   - Include tenant filter
   - Execute query
   ↓
6. PostgreSQL
   - Return filtered data
   ↓
7. React Rendering
   - Generate HTML with data
   - Include client components
   ↓
8. Response to User
   - HTML + CSS + JS
   - Hydration scripts
   ↓
9. Client-Side Hydration
   - React takes over
   - Interactive components active
```

### API Request Flow

```
1. Client Request (fetch/axios)
   ↓
2. Next.js API Route
   - Parse request
   - Validate authentication
   - Extract parameters
   ↓
3. Validation Layer (Zod)
   - Validate input
   - Return 400 if invalid
   ↓
4. Service Layer
   - Business logic
   - Authorization check
   ↓
5. Data Access Layer (Prisma)
   - Query database
   - Apply tenant filter
   ↓
6. Database (PostgreSQL)
   - Execute query
   - Return results
   ↓
7. Response Formatting
   - Format data as JSON
   - Add pagination/metadata
   ↓
8. HTTP Response
   - Status code (200, 400, 404, etc.)
   - JSON body
   - Headers
```

---

## Multi-Tenant Architecture

### Domain-Based Tenancy

**Concept:**
Each tenant (city/region) has its own domain, but all share the same application code and database.

**Tenant Identification:**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const domain = hostname.split(':')[0]; // Extract domain

  // Add to headers for app to use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-domain', domain);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}
```

**Data Isolation:**

```
┌─────────────────────────────────────────────┐
│              SHARED DATABASE                │
│                                             │
│  ┌────────────┐  ┌────────────┐            │
│  │  Company   │  │  Review    │            │
│  │            │  │            │            │
│  │ id: 1      │  │ id: 101    │            │
│  │ name: ...  │  │ company: 1 │            │
│  └────────────┘  │ rating: 5  │            │
│                  └────────────┘            │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │     CompanyContent (Link Table)      │  │
│  │                                      │  │
│  │  companyId │ domainId │ isVisible   │  │
│  │     1      │    1     │    true     │  │ Haguenau
│  │     1      │    2     │    false    │  │ Strasbourg
│  │     2      │    2     │    true     │  │ Strasbourg
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌────────────────────┐                    │
│  │     Domain         │                    │
│  │                    │                    │
│  │ id │ name          │                    │
│  │ 1  │ haguenau.pro  │                    │
│  │ 2  │ strasbourg.pro│                    │
│  └────────────────────┘                    │
└─────────────────────────────────────────────┘
```

**Query Pattern:**

```typescript
// ❌ WRONG: Returns all companies (all tenants)
await prisma.company.findMany();

// ✅ CORRECT: Returns only tenant's companies
await prisma.company.findMany({
  where: {
    content: {
      some: {
        domainId: currentDomainId,
        isVisible: true
      }
    }
  }
});
```

---

## Authentication Flow

### User Authentication (NextAuth.js)

```
┌──────────────────────────────────────────┐
│  1. User visits /login                   │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│  2. Enter email + password               │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│  3. POST /api/auth/login                 │
│     - Validate credentials               │
│     - Check user exists                  │
│     - Verify password (bcrypt)           │
└────────────┬─────────────────────────────┘
             │
         ┌───┴───┐
    Valid│       │Invalid
         │       │
    ┌────▼───┐  ┌▼─────────────────┐
    │Generate│  │Return 401 Error  │
    │JWT     │  └──────────────────┘
    │Token   │
    └────┬───┘
         │
    ┌────▼─────────────────────────┐
    │4. Set session cookie         │
    │   - HttpOnly                 │
    │   - Secure (HTTPS)           │
    │   - SameSite: Lax            │
    └────┬─────────────────────────┘
         │
    ┌────▼─────────────────────────┐
    │5. Redirect to dashboard      │
    └──────────────────────────────┘
```

### Protected Route Access

```
┌─────────────────────────────────┐
│  1. User requests /admin/*      │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  2. Middleware checks session   │
│     - Read session cookie       │
│     - Verify JWT signature      │
│     - Check expiration          │
└────────────┬────────────────────┘
             │
         ┌───┴───┐
    Valid│       │Invalid
         │       │
    ┌────▼───┐  ┌▼──────────────┐
    │Allow   │  │Redirect to    │
    │Access  │  │/login         │
    └────┬───┘  └───────────────┘
         │
    ┌────▼────────────────────────┐
    │3. Check authorization       │
    │   - Verify user role        │
    │   - ADMIN for /admin/*      │
    │   - BUSINESS_OWNER for own  │
    └────┬────────────────────────┘
         │
     ┌───┴───┐
Allow│       │Deny
     │       │
┌────▼───┐  ┌▼─────────┐
│Render  │  │Return 403│
│Page    │  │Forbidden │
└────────┘  └──────────┘
```

---

## API Architecture

### RESTful Endpoints

```
/api/
├── auth/
│   ├── login              POST   - User login
│   ├── register           POST   - User registration
│   └── logout             POST   - User logout
│
├── companies/
│   ├── /                  GET    - List companies
│   ├── [slug]             GET    - Single company
│   ├── /                  POST   - Create (admin)
│   ├── [id]               PUT    - Update
│   └── [id]               DELETE - Delete (admin)
│
├── reviews/
│   ├── /                  GET    - List reviews
│   ├── submit             POST   - Submit review
│   ├── [id]/reply         PUT    - Reply (owner)
│   └── [id]               DELETE - Delete (admin)
│
├── search/
│   └── /                  POST   - Advanced search
│
├── google-maps/
│   └── search             GET    - Google Places
│
└── admin/
    ├── companies/         GET    - All companies
    ├── reviews/           GET    - All reviews
    └── analytics/         GET    - Analytics data
```

### API Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "pagination": { ... } // Optional
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... } // Optional
}
```

---

## Database Architecture

### Entity-Relationship Overview

```
┌─────────────┐         ┌─────────────┐
│   Domain    │────┐    │   Company   │
│             │    │    │             │
│ id          │    │    │ id          │
│ name        │    │    │ name        │
│ subdomain   │    │    │ slug        │
│ isActive    │    │    │ address     │
└─────────────┘    │    │ latitude    │
                   │    │ longitude   │
                   │    │ rating      │
                   │    │ verified    │
                   │    └──────┬──────┘
                   │           │
        ┌──────────┴───────────┴──────────┐
        │                                  │
┌───────▼─────────┐              ┌────────▼────────┐
│ CompanyContent  │              │     Review      │
│                 │              │                 │
│ companyId    FK │              │ id              │
│ domainId     FK │              │ companyId    FK │
│ isVisible       │              │ authorName      │
└─────────────────┘              │ rating          │
                                 │ comment         │
                                 │ isApproved      │
                                 │ businessReply   │
                                 └─────────────────┘

┌─────────────┐
│    User     │
│             │
│ id          │
│ email       │
│ password    │
│ role        │
└─────────────┘
```

### Key Tables

**Domain** - Tenant configuration
```sql
CREATE TABLE "Domain" (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) UNIQUE NOT NULL,
  subdomain  VARCHAR(100) UNIQUE NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Company** - Business listings
```sql
CREATE TABLE "Company" (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) UNIQUE NOT NULL,
  categories      TEXT[],
  address         TEXT NOT NULL,
  city            VARCHAR(100),
  "postalCode"    VARCHAR(20),
  phone           VARCHAR(50),
  website         VARCHAR(500),
  latitude        DECIMAL(10, 8),
  longitude       DECIMAL(11, 8),
  description     TEXT,
  rating          DECIMAL(3, 2) DEFAULT 0,
  "reviewCount"   INTEGER DEFAULT 0,
  verified        BOOLEAN DEFAULT false,
  "createdAt"     TIMESTAMP DEFAULT NOW(),
  "updatedAt"     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_company_slug ON "Company"(slug);
CREATE INDEX idx_company_city ON "Company"(city);
CREATE INDEX idx_company_rating ON "Company"(rating DESC);
```

**CompanyContent** - Multi-tenant linking
```sql
CREATE TABLE "CompanyContent" (
  id          SERIAL PRIMARY KEY,
  "companyId" INTEGER REFERENCES "Company"(id) ON DELETE CASCADE,
  "domainId"  INTEGER REFERENCES "Domain"(id) ON DELETE CASCADE,
  "isVisible" BOOLEAN DEFAULT true,
  UNIQUE("companyId", "domainId")
);

CREATE INDEX idx_companycontent_domain ON "CompanyContent"("domainId");
CREATE INDEX idx_companycontent_visible ON "CompanyContent"("isVisible");
```

---

## Frontend Architecture

### Component Hierarchy

```
App (Layout)
│
├── Public Pages
│   ├── Homepage
│   │   ├── Hero
│   │   ├── SearchBar
│   │   ├── CategoryGrid
│   │   └── FeaturedCompanies
│   │
│   ├── Companies List
│   │   ├── SearchBar
│   │   ├── FilterSidebar
│   │   ├── CompanyCard[]
│   │   └── Pagination
│   │
│   └── Company Detail
│       ├── Header
│       ├── ContactInfo
│       ├── PhotoGallery
│       ├── MapView
│       └── ReviewsList
│
├── Admin Dashboard
│   ├── AdminSidebar
│   ├── Companies Management
│   ├── Reviews Moderation
│   └── Analytics
│
└── Business Owner Dashboard
    ├── Overview
    ├── Profile Management
    ├── Reviews Management
    └── Analytics
```

### Server vs Client Components

**Server Components (Default):**
- Data fetching
- Database queries
- No interactivity
- SEO-optimized

```typescript
// app/companies/page.tsx
export default async function CompaniesPage() {
  const companies = await getCompanies(); // Server-side
  return <CompanyList companies={companies} />;
}
```

**Client Components (Interactive):**
- User interactions
- State management
- Event handlers
- Browser APIs

```typescript
'use client';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  // ... interactive logic
}
```

---

## Security Architecture

### Security Layers

```
┌────────────────────────────────────────┐
│  1. Network Security                   │
│     - HTTPS/TLS encryption             │
│     - Cloudflare DDoS protection       │
│     - Rate limiting                    │
└────────────┬───────────────────────────┘
             │
┌────────────▼───────────────────────────┐
│  2. Authentication                     │
│     - JWT tokens                       │
│     - Secure password hashing (bcrypt) │
│     - Session management               │
└────────────┬───────────────────────────┘
             │
┌────────────▼───────────────────────────┐
│  3. Authorization                      │
│     - Role-based access (RBAC)         │
│     - Resource ownership checks        │
│     - Middleware protection            │
└────────────┬───────────────────────────┘
             │
┌────────────▼───────────────────────────┐
│  4. Input Validation                   │
│     - Zod schema validation            │
│     - SQL injection prevention         │
│     - XSS protection                   │
└────────────┬───────────────────────────┘
             │
┌────────────▼───────────────────────────┐
│  5. Data Security                      │
│     - Encrypted connections            │
│     - Tenant data isolation            │
│     - Secure environment variables     │
└────────────────────────────────────────┘
```

### Security Best Practices

**Authentication:**
- Passwords hashed with bcrypt (cost: 10)
- JWT tokens expire after 24 hours
- Refresh tokens expire after 30 days
- HttpOnly cookies prevent XSS

**Authorization:**
```typescript
// Middleware check
if (path.startsWith('/admin') && user.role !== 'ADMIN') {
  return NextResponse.redirect('/login');
}

// API check
if (company.ownerId !== user.id && user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Input Validation:**
```typescript
const reviewSchema = z.object({
  companyId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
  photos: z.array(z.string().url()).max(5).optional(),
});
```

---

## Performance Optimization

### Caching Strategy

```
┌─────────────────────────────────────────┐
│  Browser Cache (Client-Side)           │
│  - Static assets (images, CSS, JS)     │
│  - Cache-Control headers                │
│  - Service Worker (future)              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  CDN Cache (Edge)                       │
│  - Vercel Edge Network                  │
│  - Cloudflare CDN                       │
│  - Geographic distribution              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Application Cache (Server)             │
│  - Redis (optional)                     │
│  - React Cache                          │
│  - Database query cache                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Database                               │
│  - Query optimization                   │
│  - Indexes                              │
│  - Connection pooling                   │
└─────────────────────────────────────────┘
```

### Optimization Techniques

**1. Image Optimization:**
- Next.js Image component
- Automatic format conversion (WebP)
- Lazy loading
- Responsive sizes

**2. Code Splitting:**
- Automatic route-based splitting
- Dynamic imports for large components
- Lazy component loading

**3. Database Optimization:**
- Indexed columns (slug, city, rating)
- Query optimization (EXPLAIN ANALYZE)
- Connection pooling
- N+1 query prevention

**4. SSR/SSG Optimization:**
- Static generation for public pages
- Incremental Static Regeneration (ISR)
- Server-side rendering for dynamic pages

---

## Deployment Architecture

### Vercel Deployment

```
┌──────────────────────────────────────────┐
│            GitHub Repository             │
└──────────────┬───────────────────────────┘
               │ Push/Merge
┌──────────────▼───────────────────────────┐
│          Vercel Build System             │
│  - Install dependencies                  │
│  - Run Prisma generate                   │
│  - Build Next.js app                     │
│  - Generate static pages                 │
└──────────────┬───────────────────────────┘
               │ Deploy
┌──────────────▼───────────────────────────┐
│        Vercel Edge Network               │
│  - 65+ edge locations globally           │
│  - Automatic HTTPS                       │
│  - DDoS protection                       │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│      Serverless Functions                │
│  - API routes                            │
│  - Server components                     │
│  - Edge middleware                       │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│        External Services                 │
│  - Vercel Postgres (Database)            │
│  - Redis (Cache)                         │
│  - Cloudinary (Images)                   │
│  - SendGrid (Email)                      │
└──────────────────────────────────────────┘
```

---

## Diagrams

### Component Interaction Diagram

```
┌────────────┐    ┌─────────────┐    ┌──────────────┐
│   User     │───▶│  Next.js    │───▶│  Middleware  │
│  Browser   │    │   Router    │    │   (Domain)   │
└────────────┘    └─────────────┘    └──────┬───────┘
                                             │
                          ┌──────────────────┼──────────────────┐
                          │                  │                  │
                   ┌──────▼──────┐    ┌──────▼──────┐   ┌──────▼──────┐
                   │   Server    │    │    API      │   │   Client    │
                   │  Component  │    │   Route     │   │  Component  │
                   └──────┬──────┘    └──────┬──────┘   └─────────────┘
                          │                  │
                          └──────────┬───────┘
                                     │
                              ┌──────▼──────┐
                              │   Prisma    │
                              │     ORM     │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │ PostgreSQL  │
                              │  Database   │
                              └─────────────┘
```

---

**Last Updated:** 16 Octobre 2025
**Version:** 1.0.0
