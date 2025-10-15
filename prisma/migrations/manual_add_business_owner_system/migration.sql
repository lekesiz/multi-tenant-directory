-- CreateTable
CREATE TABLE "business_owners" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "emailVerified" TIMESTAMP(3),
    "phoneVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_ownerships" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_ownerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'gallery',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_hours" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "monday" JSONB,
    "tuesday" JSONB,
    "wednesday" JSONB,
    "thursday" JSONB,
    "friday" JSONB,
    "saturday" JSONB,
    "sunday" JSONB,
    "specialHours" JSONB,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_analytics" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "phoneClicks" INTEGER NOT NULL DEFAULT 0,
    "websiteClicks" INTEGER NOT NULL DEFAULT 0,
    "emailClicks" INTEGER NOT NULL DEFAULT 0,
    "directionsClicks" INTEGER NOT NULL DEFAULT 0,
    "sourceOrganic" INTEGER NOT NULL DEFAULT 0,
    "sourceSearch" INTEGER NOT NULL DEFAULT 0,
    "sourceDirect" INTEGER NOT NULL DEFAULT 0,
    "sourceReferral" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "company_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_owners_email_key" ON "business_owners"("email");

-- CreateIndex
CREATE INDEX "business_owners_email_idx" ON "business_owners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "company_ownerships_companyId_ownerId_key" ON "company_ownerships"("companyId", "ownerId");

-- CreateIndex
CREATE INDEX "company_ownerships_ownerId_idx" ON "company_ownerships"("ownerId");

-- CreateIndex
CREATE INDEX "company_ownerships_companyId_idx" ON "company_ownerships"("companyId");

-- CreateIndex
CREATE INDEX "photos_companyId_order_idx" ON "photos"("companyId", "order");

-- CreateIndex
CREATE INDEX "photos_companyId_type_idx" ON "photos"("companyId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "business_hours_companyId_key" ON "business_hours"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_analytics_companyId_date_key" ON "company_analytics"("companyId", "date");

-- CreateIndex
CREATE INDEX "company_analytics_companyId_date_idx" ON "company_analytics"("companyId", "date" DESC);

-- AddForeignKey
ALTER TABLE "company_ownerships" ADD CONSTRAINT "company_ownerships_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_ownerships" ADD CONSTRAINT "company_ownerships_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "business_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_analytics" ADD CONSTRAINT "company_analytics_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;