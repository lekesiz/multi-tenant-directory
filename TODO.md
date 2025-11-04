# TODO List - Multi-Tenant Directory

## ✅ Completed

### Category System Migration
- [x] Create migration script for 336 companies
- [x] Fix Prisma schema @map directives
- [x] Migrate all companies to new hierarchical system
- [x] Update homepage to show 7 main categories
- [x] Redesign annuaire page with hierarchical sidebar
- [x] Add revalidation API endpoint

## 🔄 In Progress

### Category System (Remaining)
- [ ] Update admin panel company add/edit forms
  - [ ] Replace old category selection with new system
  - [ ] Use hierarchical category picker
  - [ ] Update validation logic
- [ ] Update all components using categories
  - [ ] FilterBar component
  - [ ] SearchBar component
  - [ ] Company card components
- [ ] Update API endpoints
  - [ ] `/api/companies` - filter by new categories
  - [ ] `/api/search` - search in new categories
  - [ ] `/api/categories` - return hierarchical structure

## 🐛 Bugs to Fix

### 1. gries.pro Domain Not Found
- **Status:** Ready to test after deployment
- **Solution:** Use revalidation API to clear cache
- **Command:**
  ```bash
  curl -X POST https://haguenau.pro/api/revalidate \
    -H "Content-Type: application/json" \
    -d '{"secret": "NEXTAUTH_SECRET", "domain": "gries.pro"}'
  ```

### 2. Admin Panel - Company Edit Error
- **URL:** `haguenau.pro/admin/companies/628`
- **Error:** "Application error: a server-side exception has occurred"
- **Digest:** 3048464563
- **Next Steps:**
  - Check Vercel logs
  - Verify NEXTAUTH_SECRET is set correctly
  - Test after deployment

### 3. Admin Panel - New Company SIRET Error
- **URL:** `haguenau.pro/admin/companies/new`
- **Error:** "The column `companies.siret` does not exist in the current database"
- **Solution:** 
  - Option A: Add `siret` column to database
  - Option B: Remove `siret` from Prisma schema
  - **Recommended:** Check if SIRET is needed, then add migration

### 4. Vercel Environment Variables
- **Issue:** Duplicate environment variables
- **Action:** Clean up in Vercel dashboard
- **Variables to check:**
  - DATABASE_URL
  - NEXTAUTH_SECRET
  - NEXTAUTH_URL

## 📝 Documentation Needed

- [ ] Category system architecture
- [ ] Migration guide for future domains
- [ ] API documentation for new category endpoints
- [ ] Admin panel user guide

## 🚀 Deployment Status

**Latest Commit:** `702e159` - "feat: Complete category system migration"
**Status:** Deploying to Vercel...
**ETA:** 2-3 minutes

## 📊 Statistics

- **Companies migrated:** 336/336 (100%)
- **Category mappings:** 460
- **Main categories:** 7
- **Sub categories:** 20
- **Files modified:** 12
- **Lines added:** 1,582
