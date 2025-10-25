-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "categoryId" INTEGER,
    "postalCode" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "note" TEXT,
    "consentFlags" JSONB NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'web',
    "status" TEXT NOT NULL DEFAULT 'new',
    "budgetBand" TEXT,
    "timeWindow" TEXT,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_assignments" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "offeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'sent',
    "responseTime" INTEGER,
    "declineReason" TEXT,
    "notes" TEXT,

    CONSTRAINT "lead_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_logs" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "userId" TEXT,
    "channel" TEXT NOT NULL,
    "textHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,
    "consentType" TEXT NOT NULL,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_scores" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseSLA" INTEGER NOT NULL DEFAULT 0,
    "acceptanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "certifications" TEXT[],
    "lastComputedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "documentUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_logs" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "companyId" INTEGER,
    "channel" TEXT NOT NULL,
    "templateId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "providerMessageId" TEXT,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT,
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_tenantId_status_idx" ON "leads"("tenantId", "status");

-- CreateIndex
CREATE INDEX "leads_phone_tenantId_idx" ON "leads"("phone", "tenantId");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "leads_categoryId_status_idx" ON "leads"("categoryId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "lead_assignments_leadId_companyId_key" ON "lead_assignments"("leadId", "companyId");

-- CreateIndex
CREATE INDEX "lead_assignments_companyId_status_idx" ON "lead_assignments"("companyId", "status");

-- CreateIndex
CREATE INDEX "lead_assignments_leadId_rank_idx" ON "lead_assignments"("leadId", "rank");

-- CreateIndex
CREATE INDEX "lead_assignments_offeredAt_idx" ON "lead_assignments"("offeredAt" DESC);

-- CreateIndex
CREATE INDEX "consent_logs_leadId_idx" ON "consent_logs"("leadId");

-- CreateIndex
CREATE INDEX "consent_logs_timestamp_idx" ON "consent_logs"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "consent_logs_consentType_idx" ON "consent_logs"("consentType");

-- CreateIndex
CREATE UNIQUE INDEX "company_scores_companyId_key" ON "company_scores"("companyId");

-- CreateIndex
CREATE INDEX "company_scores_qualityScore_idx" ON "company_scores"("qualityScore" DESC);

-- CreateIndex
CREATE INDEX "company_scores_responseSLA_idx" ON "company_scores"("responseSLA" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "certificates_companyId_type_number_key" ON "certificates"("companyId", "type", "number");

-- CreateIndex
CREATE INDEX "certificates_companyId_type_idx" ON "certificates"("companyId", "type");

-- CreateIndex
CREATE INDEX "certificates_validTo_idx" ON "certificates"("validTo" ASC);

-- CreateIndex
CREATE INDEX "communication_logs_leadId_idx" ON "communication_logs"("leadId");

-- CreateIndex
CREATE INDEX "communication_logs_companyId_idx" ON "communication_logs"("companyId");

-- CreateIndex
CREATE INDEX "communication_logs_channel_status_idx" ON "communication_logs"("channel", "status");

-- CreateIndex
CREATE INDEX "communication_logs_sentAt_idx" ON "communication_logs"("sentAt" DESC);

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "business_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_assignments" ADD CONSTRAINT "lead_assignments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_assignments" ADD CONSTRAINT "lead_assignments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_scores" ADD CONSTRAINT "company_scores_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
