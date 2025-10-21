-- AlterTable
ALTER TABLE "companies" ADD COLUMN "ratingDistribution" JSONB;

-- Add comment
COMMENT ON COLUMN "companies"."ratingDistribution" IS 'Google rating distribution: {"5": 350, "4": 80, "3": 30, "2": 10, "1": 6}';

