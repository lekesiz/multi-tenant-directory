// Migration script for Vercel Functions
// This will be deployed as a Vercel Function to run the migration

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting Lead Management System Migration...');

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ Error: DATABASE_URL environment variable is not set');
      return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    console.log('✅ DATABASE_URL is set');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if leads table already exists
    const existingTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'leads'
    `;

    if (existingTables.length > 0) {
      console.log('✅ Lead management tables already exist');
      return res.status(200).json({ 
        success: true, 
        message: 'Lead management tables already exist' 
      });
    }

    // Run the migration manually
    console.log('📦 Creating lead management tables...');
    
    // Create leads table
    await prisma.$executeRaw`
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
      )
    `;

    // Create lead_assignments table
    await prisma.$executeRaw`
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
      )
    `;

    // Create other tables...
    await prisma.$executeRaw`
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
      )
    `;

    await prisma.$executeRaw`
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
      )
    `;

    await prisma.$executeRaw`
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
      )
    `;

    await prisma.$executeRaw`
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
      )
    `;

    // Create indexes
    await prisma.$executeRaw`CREATE INDEX "leads_tenantId_status_idx" ON "leads"("tenantId", "status")`;
    await prisma.$executeRaw`CREATE INDEX "leads_phone_tenantId_idx" ON "leads"("phone", "tenantId")`;
    await prisma.$executeRaw`CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt" DESC)`;
    await prisma.$executeRaw`CREATE INDEX "leads_categoryId_status_idx" ON "leads"("categoryId", "status")`;
    
    await prisma.$executeRaw`CREATE UNIQUE INDEX "lead_assignments_leadId_companyId_key" ON "lead_assignments"("leadId", "companyId")`;
    await prisma.$executeRaw`CREATE INDEX "lead_assignments_companyId_status_idx" ON "lead_assignments"("companyId", "status")`;
    await prisma.$executeRaw`CREATE INDEX "lead_assignments_leadId_rank_idx" ON "lead_assignments"("leadId", "rank")`;
    await prisma.$executeRaw`CREATE INDEX "lead_assignments_offeredAt_idx" ON "lead_assignments"("offeredAt" DESC)`;

    // Add foreign keys
    await prisma.$executeRaw`ALTER TABLE "leads" ADD CONSTRAINT "leads_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "leads" ADD CONSTRAINT "leads_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "business_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "lead_assignments" ADD CONSTRAINT "lead_assignments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "lead_assignments" ADD CONSTRAINT "lead_assignments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "company_scores" ADD CONSTRAINT "company_scores_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "certificates" ADD CONSTRAINT "certificates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`;

    console.log('✅ Migration completed successfully!');
    console.log('📊 Lead management tables created:');
    console.log('   - leads');
    console.log('   - lead_assignments'); 
    console.log('   - consent_logs');
    console.log('   - company_scores');
    console.log('   - certificates');
    console.log('   - communication_logs');

    await prisma.$disconnect();

    return res.status(200).json({
      success: true,
      message: 'Lead Management System migration completed successfully!',
      tables: ['leads', 'lead_assignments', 'consent_logs', 'company_scores', 'certificates', 'communication_logs']
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await prisma.$disconnect();
    return res.status(500).json({
      error: 'Migration failed',
      details: error.message
    });
  }
}
