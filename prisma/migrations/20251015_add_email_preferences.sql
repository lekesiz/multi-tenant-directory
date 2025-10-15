-- Add email preferences to business_owners table
ALTER TABLE "business_owners" 
ADD COLUMN IF NOT EXISTS "emailNewReview" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "emailReviewReply" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "emailWeeklyDigest" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "emailMarketing" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "unsubscribeToken" TEXT;

-- Generate unique tokens for existing rows
UPDATE "business_owners" 
SET "unsubscribeToken" = gen_random_uuid()::text 
WHERE "unsubscribeToken" IS NULL;

-- Make unsubscribeToken NOT NULL after populating
ALTER TABLE "business_owners" 
ALTER COLUMN "unsubscribeToken" SET NOT NULL;

-- Add unique constraint and index
ALTER TABLE "business_owners" 
ADD CONSTRAINT "business_owners_unsubscribeToken_key" UNIQUE ("unsubscribeToken");

CREATE INDEX IF NOT EXISTS "business_owners_unsubscribeToken_idx" ON "business_owners"("unsubscribeToken");