# Migration Deployment Guide

## 🚀 Production Database Migration

This guide explains how to deploy the Business Owner system migration to production.

## Migration Details

**Migration Name:** `add_business_owner_system`  
**File Location:** `/prisma/migrations/manual_add_business_owner_system/migration.sql`  
**Created:** 2025-01-15

### Tables to be Created:
1. `business_owners` - Business owner accounts
2. `company_ownerships` - Company ownership relationships  
3. `photos` - Photo gallery management
4. `business_hours` - Operating hours
5. `company_analytics` - Analytics tracking

## Deployment Options

### Option 1: Via Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Find your Postgres database
4. Click "Query" or "Data Browser"
5. Execute the migration SQL from `/prisma/migrations/manual_add_business_owner_system/migration.sql`

### Option 2: Via Neon Dashboard

1. Log into [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to "SQL Editor"
4. Copy and paste the migration SQL
5. Execute the query

### Option 3: Via Neon MCP CLI

```bash
# Read migration SQL
MIGRATION_SQL=$(cat prisma/migrations/manual_add_business_owner_system/migration.sql)

# Deploy to production
mcp-cli tool call run_sql --server neon --input '{
  "projectId": "multi-tenant-directory",
  "branchId": "main",
  "sql": "'"$MIGRATION_SQL"'"
}'
```

### Option 4: Via Prisma CLI (if you have production DATABASE_URL)

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Deploy migration
npx prisma migrate deploy
```

## Pre-Deployment Checklist

- [ ] Backup production database
- [ ] Review migration SQL for accuracy
- [ ] Check for any blocking transactions
- [ ] Ensure low-traffic period for deployment
- [ ] Have rollback plan ready

## Post-Deployment Verification

### 1. Verify Tables Exist

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'business_owners',
  'company_ownerships',
  'photos',
  'business_hours',
  'company_analytics'
);
```

### 2. Verify Indexes

```sql
-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'business_owners',
  'company_ownerships',
  'photos',
  'business_hours',
  'company_analytics'
);
```

### 3. Test Seed Data (Optional)

After migration, you can run the seed script:

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run business owner seed
npm run db:seed:business
```

### 4. API Endpoint Testing

Test the registration endpoint:

```bash
curl -X POST https://yourdomain.vercel.app/api/business/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "Owner"
  }'
```

## Rollback Plan

If something goes wrong:

```sql
-- Rollback migration
DROP TABLE IF EXISTS company_analytics CASCADE;
DROP TABLE IF EXISTS business_hours CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS company_ownerships CASCADE;
DROP TABLE IF EXISTS business_owners CASCADE;
```

## Troubleshooting

### Error: "relation already exists"
- One or more tables already exist
- Check which tables exist and adjust migration

### Error: "foreign key constraint"
- Ensure `companies` table exists
- Check data types match (INTEGER for company IDs)

### Error: "permission denied"
- Ensure database user has CREATE TABLE permission
- Check connection string credentials

## Success Indicators

✅ All 5 tables created successfully  
✅ No errors in deployment logs  
✅ API endpoints return 200/201 status  
✅ Prisma Studio shows new tables  
✅ Business owner registration works

## Next Steps After Deployment

1. **Enable Email Service**
   - Configure SendGrid/Resend
   - Update environment variables
   
2. **Configure Blob Storage**
   - Set up Vercel Blob
   - Update photo upload endpoint

3. **Monitor Performance**
   - Check query performance
   - Monitor table growth
   - Set up alerts

## Contact

If you encounter issues:
- Check Vercel deployment logs
- Review Neon database logs
- Consult Prisma documentation
- Contact team coordinator (Manus AI)