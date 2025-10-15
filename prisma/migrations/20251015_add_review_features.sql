-- Add new fields to reviews table
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "helpfulCount" INTEGER DEFAULT 0;

-- Create review_replies table
CREATE TABLE IF NOT EXISTS "review_replies" (
    "id" SERIAL PRIMARY KEY,
    "reviewId" INTEGER NOT NULL UNIQUE,
    "ownerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Add indexes for review_replies
CREATE INDEX IF NOT EXISTS "review_replies_reviewId_idx" ON "review_replies"("reviewId");
CREATE INDEX IF NOT EXISTS "review_replies_ownerId_idx" ON "review_replies"("ownerId");

-- Add foreign keys for review_replies
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_reviewId_fkey" 
    FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE;
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_ownerId_fkey" 
    FOREIGN KEY ("ownerId") REFERENCES "business_owners"("id") ON DELETE CASCADE;

-- Create review_votes table
CREATE TABLE IF NOT EXISTS "review_votes" (
    "id" SERIAL PRIMARY KEY,
    "reviewId" INTEGER NOT NULL,
    "voterIp" TEXT NOT NULL,
    "voterSession" TEXT,
    "isHelpful" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add unique constraint and indexes for review_votes
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_reviewId_voterIp_key" UNIQUE ("reviewId", "voterIp");
CREATE INDEX IF NOT EXISTS "review_votes_reviewId_idx" ON "review_votes"("reviewId");
CREATE INDEX IF NOT EXISTS "review_votes_voterIp_idx" ON "review_votes"("voterIp");

-- Add foreign key for review_votes
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_reviewId_fkey" 
    FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE;

-- Create review_reports table
CREATE TABLE IF NOT EXISTS "review_reports" (
    "id" SERIAL PRIMARY KEY,
    "reviewId" INTEGER NOT NULL,
    "reporterIp" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add indexes for review_reports
CREATE INDEX IF NOT EXISTS "review_reports_reviewId_idx" ON "review_reports"("reviewId");
CREATE INDEX IF NOT EXISTS "review_reports_status_idx" ON "review_reports"("status");
CREATE INDEX IF NOT EXISTS "review_reports_createdAt_idx" ON "review_reports"("createdAt" DESC);

-- Add foreign key for review_reports
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_reviewId_fkey" 
    FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE;