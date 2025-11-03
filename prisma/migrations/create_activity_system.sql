-- CreateTable
CREATE TABLE IF NOT EXISTS "activities" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "type" TEXT NOT NULL,
    "postType" TEXT NOT NULL DEFAULT 'daily',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "imageUrl" TEXT,
    "imageCaption" TEXT,
    "videoUrl" TEXT,
    "videoThumbnail" TEXT,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiModel" TEXT,
    "aiPrompt" TEXT,
    "sharedOn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "shareUrls" JSONB,
    "lastSharedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publishedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "authorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "activities_companyId_slug_key" ON "activities"("companyId", "slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "activities_companyId_status_idx" ON "activities"("companyId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "activities_companyId_publishedAt_idx" ON "activities"("companyId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "activities_status_scheduledFor_idx" ON "activities"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "activities_type_status_idx" ON "activities"("type", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "activities_slug_idx" ON "activities"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "activities_publishedAt_idx" ON "activities"("publishedAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "activities_views_idx" ON "activities"("views" DESC);

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
