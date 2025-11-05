-- AlterTable
ALTER TABLE "categories" ADD COLUMN "googlebusinesscategory" TEXT;

-- Add comment
COMMENT ON COLUMN "categories"."googlebusinesscategory" IS 'Official Google Business Profile category name';
