# Fix Vercel Deployment - Failed Migration P3009

## Problem
Vercel deployment failing with:
```
Error: P3009
migrate found failed migrations in the target database
The `20251021072919_add_rating_distribution` migration started at 2025-10-21 11:39:58.678970 UTC failed
```

## Root Cause
A Prisma migration started on the production database but didn't complete, leaving it in a "failed" state. Prisma refuses to apply new migrations when there are failed ones.

## Solution

### Option 1: Resolve via Database (RECOMMENDED)

1. Connect to your Neon database:
```bash
psql "postgresql://neondb_owner:...@ep-gentle-silence-af4jt3px.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
```

2. Run the resolution script:
```sql
-- Mark migration as complete
UPDATE "_prisma_migrations"
SET
    finished_at = NOW(),
    applied_steps_count = 1,
    logs = 'Migration resolved manually'
WHERE migration_name = '20251021072919_add_rating_distribution'
  AND finished_at IS NULL;

-- Apply the actual column (safe - uses IF NOT EXISTS)
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "ratingDistribution" JSONB;
COMMENT ON COLUMN "companies"."ratingDistribution" IS 'Google rating distribution: {"5": 350, "4": 80, "3": 30, "2": 10, "1": 6}';
```

3. Verify:
```sql
SELECT migration_name, finished_at, applied_steps_count
FROM "_prisma_migrations"
WHERE migration_name = '20251021072919_add_rating_distribution';
```

4. Trigger new Vercel deployment:
```bash
git commit --allow-empty -m "chore: trigger deployment after migration fix"
git push origin main
```

### Option 2: Reset Migration (DESTRUCTIVE - USE WITH CAUTION)

If Option 1 doesn't work:

```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back 20251021072919_add_rating_distribution

# Then trigger deployment
git push origin main
```

### Option 3: Baseline (If all else fails)

```bash
# Create a baseline of current schema
npx prisma migrate resolve --applied 20251021072919_add_rating_distribution

# Push to Vercel
git push origin main
```

## After Fix

Once fixed, Vercel build should show:
```
✔ 5 migrations found in prisma/migrations
✔ All migrations have been applied
✔ Next.js build successful
```

## Prevention

To prevent this in the future:

1. **Always test migrations locally first**
2. **Use migration preview:**
   ```bash
   npx prisma migrate dev --create-only
   npx prisma migrate deploy # after review
   ```
3. **Enable Prisma migration locking** (add to schema.prisma):
   ```prisma
   generator client {
     provider = "prisma-client-js"
     previewFeatures = ["postgresqlExtensions"]
   }
   ```

## Files Created
- `scripts/resolve-failed-migration.sql` - SQL script to resolve the issue
- This documentation file

## Next Steps
1. Run the SQL script on production database
2. Verify migration is marked as complete
3. Push empty commit to trigger Vercel deployment
4. Monitor build logs to confirm success
