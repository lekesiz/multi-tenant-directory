# TASK-003: Database Schema Migration Instructions

**Assignee:** Manus AI (Production Deployment)
**Status:** Ready for Production Deployment
**Priority:** P0 - Critical

---

## ✅ What Was Completed (Claude AI - VS Code Developer)

### 1. Prisma Schema Updates

Added 5 new models to `prisma/schema.prisma`:

#### ✅ BusinessOwner Model
- Stores business owner/dashboard user credentials
- Fields: email, password (bcrypt hashed), firstName, lastName, phone
- Email verification tracking

#### ✅ CompanyOwnership Model
- Links business owners to companies (many-to-many)
- Supports multiple roles: owner, manager, editor
- Verification system for ownership claims

#### ✅ Photo Model
- Photo gallery management
- Supports multiple types: logo, cover, gallery, interior, product
- Thumbnail generation support
- Sortable order system

#### ✅ BusinessHours Model
- Structured weekly business hours (JSON)
- Special hours for holidays
- Timezone support

#### ✅ CompanyAnalytics Model
- Daily analytics tracking
- View metrics, click metrics, source tracking
- Ready for dashboard charts

### 2. Company Model Updates

Updated existing `Company` model with new relations:
- `ownerships` → CompanyOwnership[]
- `photos` → Photo[]
- `hours` → BusinessHours?
- `analytics` → CompanyAnalytics[]

### 3. Seed Data Script

Created `prisma/seed-dashboard.ts` with:
- Test business owner account (mikail@lekesiz.org)
- Ownership link to NETZ Informatique
- Sample business hours (Mon-Fri 9-18h)
- Last 7 days of analytics data

---

## 🚀 What Needs To Be Done (Manus AI)

### Step 1: Generate and Review Migration

```bash
# Set production DATABASE_URL in terminal
export DATABASE_URL="postgresql://..."

# Create migration
npx prisma migrate dev --name add_dashboard_tables
```

This will:
- Create migration SQL file
- Show you the SQL commands that will run
- **IMPORTANT:** Review the generated SQL before proceeding!

### Step 2: Apply Migration to Production

```bash
# Apply migration to production database
npx prisma migrate deploy
```

This will:
- Run all pending migrations
- Update database schema with new tables
- Create all indexes and foreign keys

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

This updates the Prisma Client types with new models.

### Step 4: Run Dashboard Seed

```bash
# Install bcryptjs if not already installed
npm install bcryptjs
npm install -D @types/bcryptjs

# Run seed script
npx tsx prisma/seed-dashboard.ts
```

This will create:
- Business owner account
- Link to NETZ Informatique
- Business hours
- Sample analytics data

### Step 5: Verify in Prisma Studio

```bash
npx prisma studio
```

Check that all tables were created:
- ✅ `business_owners` (should have 1 row)
- ✅ `company_ownerships` (should have 1 row)
- ✅ `photos` (empty - will be populated later)
- ✅ `business_hours` (should have 1 row)
- ✅ `company_analytics` (should have 7 rows - last 7 days)

---

## 🔐 Test Credentials

After seed:
- **Email:** mikail@lekesiz.org
- **Password:** netz2025!

⚠️ **IMPORTANT:** Change this password after first login!

---

## 📋 Acceptance Criteria Checklist

- [ ] Migration created successfully
- [ ] Migration applied to production database
- [ ] All 5 new tables exist in database
- [ ] Seed script runs without errors
- [ ] Test account created (mikail@lekesiz.org)
- [ ] Ownership link to NETZ Informatique exists
- [ ] Business hours created
- [ ] Analytics data for last 7 days exists
- [ ] Prisma Studio shows all data correctly
- [ ] Foreign keys and indexes created
- [ ] No TypeScript errors in project

---

## 🧪 Testing Commands

```bash
# 1. Check database connection
npx prisma db pull

# 2. Check migration status
npx prisma migrate status

# 3. Inspect schema
npx prisma studio

# 4. Test Prisma Client
npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.businessOwner.findMany().then(console.log).finally(() => p.\$disconnect())"
```

---

## ⚠️ Troubleshooting

### Issue: Migration fails with "relation already exists"
```bash
# Reset migrations (DANGEROUS - only for development)
npx prisma migrate reset

# Or manually drop conflicting tables
psql $DATABASE_URL -c "DROP TABLE IF EXISTS business_owners CASCADE;"
```

### Issue: Seed fails - "Company not found"
```bash
# Check if companies exist
psql $DATABASE_URL -c "SELECT id, name, slug FROM companies LIMIT 5;"

# Manually find NETZ Informatique
psql $DATABASE_URL -c "SELECT id, name, slug FROM companies WHERE slug LIKE '%netz%';"
```

### Issue: Foreign key constraint fails
- Make sure Company table has existing data
- Check that companyId in seed matches an actual company ID

---

## 📊 Database Schema Visualization

```
BusinessOwner (1) ←──→ (N) CompanyOwnership (N) ←──→ (1) Company
                                                           ↓
                                                    BusinessHours (1)
                                                           ↓
                                                      Photos (N)
                                                           ↓
                                                    Analytics (N)
```

---

## 🎯 Next Steps After Completion

Once TASK-003 is done, these tasks will become unblocked:

1. **TASK-004:** Authentication System (NextAuth.js) - Claude AI
2. **TASK-005:** Dashboard Layout - VS Code Developer
3. **TASK-007:** Photo Upload System - Manus AI + VS Code Developer

---

## 📝 Notes

- All IDs use `@default(cuid())` for security (non-sequential)
- Passwords are bcrypt hashed (cost: 10)
- Indexes added for common queries (performance)
- Cascade deletes configured (data integrity)
- JSON fields used for flexible data (businessHours, specialHours)
- Timezone support for international businesses
- Analytics designed for daily aggregation (efficient queries)

---

**Status:** ✅ Ready for Manus AI to execute migration in production

**Estimated Time:** 30 minutes (including verification)

**Risk Level:** Low (additive changes only, no destructive operations)

---

*Generated by VS Code Developer (Claude AI)*
*Date: 2025-10-15*
*Sprint: 3*
