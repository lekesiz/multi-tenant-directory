-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('announcement', 'event', 'offer', 'update', 'story', 'news');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('draft', 'scheduled', 'published', 'archived');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "type" "ActivityType" NOT NULL,
    "featuredImage" TEXT,
    "images" TEXT[],
    "videoUrl" TEXT,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiGeneratedContent" TEXT,
    "aiGeneratedImageUrl" TEXT,
    "aiGeneratedVideoUrl" TEXT,
    "aiModel" TEXT,
    "status" "ActivityStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "sharedOnFacebook" BOOLEAN NOT NULL DEFAULT false,
    "sharedOnTwitter" BOOLEAN NOT NULL DEFAULT false,
    "sharedOnLinkedIn" BOOLEAN NOT NULL DEFAULT false,
    "sharedOnInstagram" BOOLEAN NOT NULL DEFAULT false,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activities_slug_key" ON "activities"("slug");

-- CreateIndex
CREATE INDEX "activities_companyId_idx" ON "activities"("companyId");

-- CreateIndex
CREATE INDEX "activities_slug_idx" ON "activities"("slug");

-- CreateIndex
CREATE INDEX "activities_status_idx" ON "activities"("status");

-- CreateIndex
CREATE INDEX "activities_publishedAt_idx" ON "activities"("publishedAt");

-- CreateIndex
CREATE INDEX "activities_type_idx" ON "activities"("type");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");

-- CreateIndex
CREATE INDEX "activities_companyId_status_publishedAt_idx" ON "activities"("companyId", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "activities_tags_idx" ON "activities" USING GIN ("tags");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
