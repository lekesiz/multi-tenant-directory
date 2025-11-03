-- Resolve failed migration P3009
-- This script marks the failed migration as completed
-- Run this directly on your production database

-- Mark the failed migration as finished
UPDATE "_prisma_migrations"
SET
    finished_at = NOW(),
    applied_steps_count = 1,
    logs = 'Migration resolved manually'
WHERE migration_name = '20251021072919_add_rating_distribution'
  AND finished_at IS NULL;

-- Verify the migration is marked as complete
SELECT
    migration_name,
    started_at,
    finished_at,
    applied_steps_count
FROM "_prisma_migrations"
WHERE migration_name LIKE '202510%'
ORDER BY started_at DESC;

-- Apply the actual SQL from the migration (idempotent)
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "ratingDistribution" JSONB;
COMMENT ON COLUMN "companies"."ratingDistribution" IS 'Google rating distribution: {"5": 350, "4": 80, "3": 30, "2": 10, "1": 6}';
