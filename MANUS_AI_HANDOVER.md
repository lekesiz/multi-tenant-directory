# 🤖 MANUS AI - Project Handover Documentation

**Project:** haguenau.pro - Multi-Tenant Business Directory Platform
**Created:** 2025-11-04
**Status:** 🔴 **CRITICAL ISSUES ONGOING**
**Version:** 2.1.2
**Repository:** https://github.com/lekesiz/multi-tenant-directory
**Production URL:** https://haguenau.pro

> **⚠️ SECURITY NOTE:** This document does NOT contain sensitive credentials.
> See `CREDENTIALS_LOCAL.md` (NOT in Git) for passwords, API keys, and database credentials.

---

## 📋 TABLE DES MATIÈRES

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Critical Issues (UNRESOLVED)](#critical-issues-unresolved)
4. [Recent Work](#recent-work)
5. [Database Schema](#database-schema)
6. [Key Features](#key-features)
7. [Deployment](#deployment)
8. [Testing Instructions](#testing-instructions)
9. [Next Steps](#next-steps)

---

## 🎯 PROJECT OVERVIEW

### Mission
Multi-tenant business directory platform serving **22 French cities** in Bas-Rhin region. Each city has its own subdomain (e.g., haguenau.pro, saverne.pro) sharing the same codebase with tenant-specific content.

### Tech Stack
```
Frontend:   Next.js 15.5.4 (App Router)
Backend:    Next.js API Routes
Database:   PostgreSQL 15 (Neon.tech)
ORM:        Prisma 6.18.0
Auth:       NextAuth.js 4.24.11
Styling:    Tailwind CSS 4
Hosting:    Vercel
Email:      Resend
Storage:    Vercel Blob, Cloudinary
AI:         n8n.cloud orchestration
```

### Key Metrics
- **22 domains** (bas-rhin.pro, haguenau.pro, saverne.pro, gries.pro, etc.)
- **~300 companies** in database
- **28 categories** (8 parents + 20 children)
- **Multi-language**: French, English, German, Turkish support
- **Rich text editing**: TipTap editor with image upload
- **SIRET Integration**: French government business data API

---

## 🏗️ ARCHITECTURE

### Multi-Tenant Strategy

```
Request Flow:
┌─────────────────────────────────────────────┐
│  User visits: https://haguenau.pro         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Middleware (src/middleware.ts)             │
│  - Checks SUPPORTED_DOMAINS array           │
│  - Sets x-tenant-domain header              │
│  - Returns 404 if domain not found          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Page Component                             │
│  - Reads x-tenant-domain from headers       │
│  - Queries domain from database             │
│  - Filters companies by domainId            │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  CompanyContent Junction Table              │
│  - company_id + domain_id = unique content  │
│  - isVisible flag per domain                │
│  - customDescription per domain             │
└─────────────────────────────────────────────┘
```

### Directory Structure

```
multi-tenant-directory/
├── prisma/
│   ├── schema.prisma           # Database schema (1549 lines)
│   ├── seed.ts                 # Database seeding
│   └── migrations/             # Migration history
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public pages
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/                # API routes
│   │   ├── auth/               # Authentication pages
│   │   ├── business/           # Business owner dashboard
│   │   ├── categories/[category]/   # Category listing pages
│   │   ├── companies/[slug]/        # Company detail pages
│   │   └── [legalSlug]/             # Dynamic legal pages
│   │
│   ├── components/             # React components
│   │   ├── CompanyEditForm.tsx      # ⚠️ Recently modified
│   │   ├── RichTextEditor.tsx       # TipTap editor
│   │   ├── BusinessHoursForm.tsx
│   │   ├── AIDescriptionGenerator.tsx
│   │   └── KeywordSuggestions.tsx
│   │
│   ├── lib/                    # Utilities
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── logger.ts           # Winston logger
│   │   ├── seo.ts              # SEO helpers
│   │   ├── queries/            # Database queries
│   │   │   └── domain.ts       # Domain-related queries
│   │   └── utils.ts            # Generic utilities
│   │
│   └── middleware.ts           # ⚠️ Multi-tenant routing logic
│
├── scripts/                    # Automation scripts
├── public/                     # Static assets
├── .env.local                  # ⚠️ NOT IN GIT - see CREDENTIALS_LOCAL.md
│
├── MANUS_AI_HANDOVER.md        # 👈 This file (GIT-SAFE)
├── CREDENTIALS_LOCAL.md        # 🔐 PASSWORDS (NOT IN GIT)
└── PRODUCTION_ENVIRONMENT_VARIABLES.md  # Full env var guide
```

---

## 🔴 CRITICAL ISSUES (UNRESOLVED)

### Issue Summary

User reported 6 critical issues, most were fixed but **runtime errors persist**:

| # | Issue | Status | Priority |
|---|-------|--------|----------|
| 1 | `/categories/establishment` error | ✅ FIXED | - |
| 2 | Legal pages 404 | ✅ FIXED | - |
| 3 | Leads count mismatch | ✅ VERIFIED | - |
| 4 | Modifier button 500 error | ⚠️ PARTIAL | **HIGH** |
| 5 | SIRET creation error | ✅ FIXED | - |
| 6 | gries.pro domain not working | ✅ FIXED | - |
| 7 | **Runtime errors persist** | 🔴 **ONGOING** | **CRITICAL** |

### Issue #7: Runtime Errors Despite Successful Build

**Symptoms:**
- Build succeeds: `✓ Compiled successfully in 10.1s`
- HTTP returns 200 OK
- Browser shows: "Application error: a server-side exception has occurred"
- Error digests: `1011084242`, `3048464563`, `2826634772`

**Affected Pages:**
- `/admin/categories` - HTTP 200 but runtime error
- `/admin/companies/[id]` - Modifier button issue (partially fixed)
- Various other pages showing intermittent errors

**Possible Causes:**
1. **Hydration Mismatch**: Server-rendered HTML ≠ Client-rendered HTML
2. **Null Reference**: Component trying to access undefined/null data
3. **Prisma Query Issues**: Database queries failing at runtime
4. **React.Fragment Key Props**: Using key={index} instead of key={id}
5. **API Authentication**: `/api/admin/categories/list` returns 500 error

**Current Hypothesis:**
The `/api/admin/categories/list` endpoint is returning an error, which causes the category dropdown to fail loading. This cascades into other components that depend on categories.

**Evidence:**
```bash
curl https://haguenau.pro/api/admin/categories/list
# Returns: {"error":"Failed to fetch categories"}
```

**Next Steps:**
1. Check Vercel deployment logs for specific error messages
2. Test `/api/admin/categories/list` with authentication
3. Review admin categories page for null safety
4. Check browser console for hydration warnings
5. Verify Prisma Client is correctly deployed

---

## 📚 RECENT WORK (LAST SESSION - 2025-11-04)

### Commits Made

**Latest Commit:** `e56b706` - "✨ Système complet catégories + SIRET dans CompanyEditForm"

**Changes:**
1. Added hierarchical category dropdown (parent-child with optgroup)
2. Added SIRET/SIREN input fields with validation
3. Implemented "Fetch from SIRET" button (calls `/api/companies/from-siret`)
4. Fixed category system to use `company_categories` junction table
5. Restored RichTextEditor (was temporarily disabled)
6. Added gries.pro to SUPPORTED_DOMAINS array

**Previous Commits:**
- `9c4035f` - Restore: Re-enable RichTextEditor with TipTap
- `60729b7` - Critical Fix: Install missing dependencies
- `780dd68` - Fix: Handle empty category pages gracefully
- `9cbff63` - Fix: Add gries.pro to supported domains list

### Files Modified

#### `src/components/CompanyEditForm.tsx` (Major Changes)

**Added:**
- `useEffect` to fetch categories from `/api/admin/categories/list` (line 124-138)
- `handleFetchFromSiret()` function (line 140-192)
- SIRET input section UI (line 509-603)
- Category dropdown UI with hierarchy (line 613-717)
- State: `availableCategories` (line 77-84)
- State: `siretLoading` (line 85)

**Features:**
- **SIRET Fetch**: Calls API, merges data ADDITIVELY (preserves existing data)
- **Category Selection**: Dropdown with parent categories as optgroup
- **Multi-Category**: Can add multiple categories per company
- **Real-time Validation**: SIRET must be 14 digits, auto-format

#### `src/middleware.ts`

**Added:** `'gries.pro'` to SUPPORTED_DOMAINS array (line 17)

#### `src/app/categories/[category]/page.tsx`

**Added:** Category existence check + empty state UI (line 117-237)

---

## 💾 DATABASE SCHEMA

### Core Tables

#### `domains` (22 rows)
```sql
id | name              | isActive | siteTitle      | logoUrl
---+-------------------+----------+----------------+--------
1  | bas-rhin.pro      | true     | Bas-Rhin.PRO   | ...
2  | haguenau.pro      | true     | Haguenau.PRO   | ...
38 | gries.pro         | true     | Gries.PRO      | ...
```

#### `companies` (~300 rows)
```sql
-- Core fields
id, name, slug, googlePlaceId

-- SIRET fields (recently added)
siren (9 digits), siret (14 digits), legalForm, nafCode
employeeCount, capital, foundingDate, isVerified

-- Contact
address, city, postalCode, phone, email, website

-- Location
latitude, longitude

-- Legacy categories (OLD - being replaced)
categories: string[]  -- Array like ["Restaurant", "Bar"]

-- Status
isActive, subscriptionStatus, subscriptionTier
```

#### `categories` (28 rows)
```sql
id | slug          | name          | nameFr        | icon | parentId | order
---+---------------+---------------+---------------+------+----------+------
1  | alimentation  | Alimentation  | Alimentation  | 🍽️   | NULL     | 1
2  | restaurant    | Restaurant    | Restaurant    | 🍴   | 1        | 1
7  | sante         | Santé         | Santé         | ⚕️   | NULL     | 2
8  | pharmacie     | Pharmacie     | Pharmacie     | 💊   | 7        | 1

-- Hierarchy:
-- Parent (parentId = NULL)
--   ├── Child 1 (parentId = parent.id)
--   └── Child 2 (parentId = parent.id)
```

#### `company_categories` (Junction Table)
```sql
id | companyId | categoryId | isPrimary | createdAt
---+-----------+------------+-----------+----------
1  | 1         | 1          | true      | ...
747| 1         | 4          | false     | ...

-- Allows multiple categories per company
-- UNIQUE constraint on (companyId, categoryId)
-- CASCADE delete when company or category deleted
```

#### `company_content` (Junction Table - Multi-Tenant)
```sql
id | companyId | domainId | isVisible | customDescription | priority
---+-----------+----------+-----------+-------------------+---------
1  | 1         | 1        | true      | "Custom text..."  | 0
2  | 1         | 2        | false     | null              | 0

-- Same company can have different content per domain
-- isVisible controls if company appears on that domain
-- customDescription overrides default description
```

### Important Relationships

```
Domain (1) ←→ (N) CompanyContent ←→ (1) Company
Company (1) ←→ (N) CompanyCategories ←→ (1) Category
Category (parent) ←→ (children) Category
```

---

## 🚀 KEY FEATURES

### 1. Multi-Tenant System

**How It Works:**
1. User visits `https://haguenau.pro`
2. Middleware extracts domain name
3. Checks if domain in SUPPORTED_DOMAINS array
4. Sets `x-tenant-domain` header
5. Page components query domain from database
6. Filter companies by `domainId` via `company_content` table

**Adding New Domain:**
```typescript
// 1. Add to middleware.ts
const SUPPORTED_DOMAINS = [
  'bas-rhin.pro',
  'new-city.pro',  // ← Add here
];

// 2. Add to database
INSERT INTO domains (name, isActive, siteTitle)
VALUES ('new-city.pro', true, 'New City Directory');

// 3. Configure DNS: A record → 76.76.21.21 (Vercel)
// 4. Add domain in Vercel project settings
```

---

### 2. Category System (Hierarchical)

**Structure:**
```
🍽️ Alimentation (parent)
  ├── 🍴 Restaurant (child)
  ├── ☕ Café (child)
  └── 🥖 Boulangerie (child)

⚕️ Santé (parent)
  ├── 💊 Pharmacie (child)
  └── 🩺 Médecin (child)
```

**Implementation:**
```typescript
// Fetch hierarchy
const parents = await prisma.category.findMany({
  where: { parentId: null },
  include: { children: true }
});

// Assign to company (multi-select)
await prisma.companyCategory.createMany({
  data: [
    { companyId: 1, categoryId: 2, isPrimary: true },  // Restaurant
    { companyId: 1, categoryId: 4, isPrimary: false }, // Boulangerie
  ]
});
```

---

### 3. SIRET Integration (French Business API)

**What is SIRET:**
- **SIREN**: 9-digit company identifier (like EIN in US)
- **SIRET**: 14-digit establishment identifier (SIREN + 5 digits)
- Official French government registry of all businesses

**API Used:** https://annuaire-entreprises.data.gouv.fr/

**Flow:**
```
User enters SIRET in form
      ↓
Frontend calls /api/companies/from-siret
      ↓
Backend fetches from Annuaire des Entreprises API
      ↓
Enriches with Google Places data
      ↓
Generates AI profile description
      ↓
Returns complete company data
      ↓
Form auto-fills (ADDITIVE merge)
```

---

### 4. Rich Text Editor (TipTap)

**Features:**
- Bold, Italic, Underline, Strike
- Headings (H1-H6)
- Bullet/Numbered lists
- Links (with URL input)
- Images (with URL or upload)
- Code blocks
- Blockquotes

**Component:** `src/components/RichTextEditor.tsx`

**Packages:**
- @tiptap/react
- @tiptap/starter-kit
- @tiptap/extension-link
- @tiptap/extension-image

---

## 📦 DEPLOYMENT

### Build Process

```bash
# Local build
npm run build

# Build steps:
1. prisma generate     # Generate Prisma Client
2. next build          # Build Next.js app
3. Optimize assets     # Images, CSS, JS
4. Generate sitemap    # SEO
5. Static generation   # 161 routes
```

### Vercel Deployment

**Automatic (Git Push):**
```bash
git add .
git commit -m "Your changes"
git push origin main
# → Vercel detects push
# → Triggers build
# → Deploys to production
```

**Manual (Vercel CLI):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables
vercel env pull .env.local
```

**Environment Variables:**
> **⚠️ See `CREDENTIALS_LOCAL.md` for actual values (NOT in Git)**

Required environment variables in Vercel:
- `DATABASE_URL` - PostgreSQL connection (pooled)
- `DIRECT_URL` - PostgreSQL connection (direct)
- `NEXTAUTH_URL` - App URL (https://haguenau.pro)
- `NEXTAUTH_SECRET` - Auth secret (48+ characters)
- `RESEND_API_KEY` - Email service API key
- `RESEND_FROM_EMAIL` - Sender email
- `ADMIN_EMAIL` - Admin account email
- `ADMIN_PASSWORD` - Admin account password
- `NODE_ENV` - Environment (production)

Full documentation: `PRODUCTION_ENVIRONMENT_VARIABLES.md`

---

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name add_siret_fields

# Apply to production
npx prisma migrate deploy

# Or push schema changes directly (no migration)
npx prisma db push

# Seed database
npm run db:seed
```

---

## 🧪 TESTING INSTRUCTIONS

### Local Testing

```bash
# Install dependencies
npm install

# Setup environment
# See CREDENTIALS_LOCAL.md for actual values
cp .env.example .env.local
# Edit .env.local with credentials

# Generate Prisma Client
npx prisma generate

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

---

### Production Testing

**Browser Tests:**
```
1. Admin Login:
   → https://haguenau.pro/admin/login

2. Categories Management:
   → https://haguenau.pro/admin/categories
   ⚠️ Currently shows runtime error (ISSUE #7)

3. Company Edit:
   → https://haguenau.pro/admin/companies/1
   ⚠️ Category dropdown may not load (API error)

4. Category Page:
   → https://haguenau.pro/categories/restaurant
   ✅ Should show list of restaurants

5. Multi-Domain Test:
   → https://gries.pro/
   ✅ Should load (recently fixed)
```

**API Tests:**
```bash
# Test category list (requires auth)
curl https://haguenau.pro/api/admin/categories/list
# Current: {"error":"Failed to fetch categories"}

# Test domain resolution
curl -I https://haguenau.pro/
# Expected: HTTP/2 200 ✅

curl -I https://gries.pro/
# Expected: HTTP/2 200 ✅
```

---

## 📋 NEXT STEPS

### Immediate Priorities

1. **Fix Runtime Errors**
   - [ ] Debug `/api/admin/categories/list` 500 error
   - [ ] Check Vercel deployment logs
   - [ ] Add null safety checks
   - [ ] Fix React hydration issues

2. **Verify Core Features**
   - [ ] Admin categories page loads
   - [ ] Company edit form works
   - [ ] Category dropdown functions
   - [ ] SIRET fetch works end-to-end

3. **User Acceptance Testing**
   - [ ] User tests Modifier button
   - [ ] User tests SIRET fetch
   - [ ] User verifies gries.pro domain

---

## 🆘 GETTING HELP

### Error Patterns

**"Application error: a server-side exception has occurred"**
→ Check Vercel logs: Deployment → Functions → Logs

**"Failed to fetch categories"**
→ Test API endpoint directly
→ Check authentication

**Build succeeds but runtime fails**
→ Run: `npx prisma generate`
→ Check for null/undefined in components

---

### Debugging Checklist

1. **Check Vercel Logs**
   ```
   Vercel Dashboard → Project → Deployments → [Latest] → Functions
   ```

2. **Check Browser Console**
   ```
   F12 → Console → Red errors
   Network tab → Failed API calls
   ```

3. **Test API Endpoints**
   ```bash
   curl -I https://haguenau.pro/api/admin/categories/list
   ```

4. **Check Database**
   ```bash
   npm run db:studio
   ```

5. **Clear Caches**
   ```bash
   # Browser: Cmd+Shift+R
   # Vercel: Redeploy
   # Local: rm -rf .next && npm run build
   ```

---

## 📞 RESOURCES

### Documentation Files (in repo)
- `PRODUCTION_ENVIRONMENT_VARIABLES.md` - Full env var guide
- `PROJECT_DASHBOARD.md` - Project status
- `AI_INTEGRATION_SUMMARY.md` - AI features
- `GOOGLE_MAPS_SETUP.md` - Maps integration

### External Resources
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Vercel Docs: https://vercel.com/docs
- French Business API: https://annuaire-entreprises.data.gouv.fr/

---

## ✅ HANDOVER CHECKLIST

Before starting:
- [ ] Read this document
- [ ] Get `CREDENTIALS_LOCAL.md` from owner
- [ ] Clone repository
- [ ] Pull environment variables
- [ ] Connect to database
- [ ] Review recent commits
- [ ] Check Vercel logs

First tasks:
- [ ] Fix runtime errors
- [ ] Debug `/api/admin/categories/list`
- [ ] Verify CompanyEditForm
- [ ] Test SIRET integration
- [ ] Communicate findings

---

**END OF HANDOVER DOCUMENT**

Last Updated: 2025-11-04
Status: 🔴 CRITICAL - Runtime errors ongoing

> **IMPORTANT:** This project has unresolved runtime errors despite successful builds.
> Priority #1 is debugging the `/api/admin/categories/list` endpoint.

Good luck! 🚀
