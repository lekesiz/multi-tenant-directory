-- AlterTable
ALTER TABLE "companies" ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

-- Add comment
COMMENT ON COLUMN "companies"."lastSyncedAt" IS 'Last time Google reviews were synced';

