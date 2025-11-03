import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      database: 'pending',
      redis: 'pending',
    },
    tables: {
      // Core tables
      companies: false,
      domains: false,
      reviews: false,
      business_categories: false,
      company_content: false,
      // Lead management tables
      leads: false,
      lead_assignments: false,
      consent_logs: false,
      company_scores: false,
      certificates: false,
      communication_logs: false,
    },
    stats: {
      totalCompanies: 0,
      totalDomains: 0,
      totalReviews: 0,
      totalLeads: 0,
    }
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = 'ok';

    // Check each critical table
    try {
      await prisma.company.findFirst();
      checks.tables.companies = true;
      checks.stats.totalCompanies = await prisma.company.count();
    } catch (error) {
      // Table doesn't exist or other error
    }

    try {
      await prisma.domain.findFirst();
      checks.tables.domains = true;
      checks.stats.totalDomains = await prisma.domain.count();
    } catch (error) {
      // Table doesn't exist or other error
    }

    try {
      await prisma.review.findFirst();
      checks.tables.reviews = true;
      checks.stats.totalReviews = await prisma.review.count();
    } catch (error) {
      // Table doesn't exist or other error
    }

    try {
      await prisma.businessCategory.findFirst();
      checks.tables.business_categories = true;
    } catch (error) {
      // Table doesn't exist or other error
    }

    try {
      await prisma.companyContent.findFirst();
      checks.tables.company_content = true;
    } catch (error) {
      // Table doesn't exist or other error
    }

    // Check lead management tables
    try {
      await prisma.lead.findFirst();
      checks.tables.leads = true;
      checks.stats.totalLeads = await prisma.lead.count();
    } catch (error) {
      // Table doesn't exist or other error
    }

    try {
      await prisma.leadAssignment.findFirst();
      checks.tables.lead_assignments = true;
    } catch (error) {
      // Table doesn't exist or other error
    }

    try {
      await prisma.consentLog.findFirst();
      checks.tables.consent_logs = true;
    } catch (error) {
      // Table doesn't exist or other error
    }

    try {
      await prisma.companyScore.findFirst();
      checks.tables.company_scores = true;
    } catch (error) {
      // Table doesn't exist or other error
    }

    try {
      await prisma.certificate.findFirst();
      checks.tables.certificates = true;
    } catch (error) {
      // Table doesn't exist or other error
    }

    try {
      await prisma.communicationLog.findFirst();
      checks.tables.communication_logs = true;
    } catch (error) {
      // Table doesn't exist or other error
    }

  } catch (error) {
    checks.status = 'error';
    checks.checks.database = 'error';
  }

  // Redis check (if configured)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      });
      
      if (response.ok) {
        checks.checks.redis = 'ok';
      } else {
        checks.checks.redis = 'error';
      }
    } catch (error) {
      checks.checks.redis = 'error';
    }
  } else {
    checks.checks.redis = 'not configured';
  }

  // Determine overall status
  const criticalTables = [
    checks.tables.companies,
    checks.tables.domains,
    checks.tables.reviews,
  ];

  const leadTables = [
    checks.tables.leads,
    checks.tables.lead_assignments,
    checks.tables.consent_logs,
  ];

  if (checks.checks.database !== 'ok' || criticalTables.some(t => !t)) {
    checks.status = 'critical';
  } else if (leadTables.some(t => !t)) {
    checks.status = 'degraded';
  }

  const responseTime = Date.now() - startTime;

  return NextResponse.json(
    {
      ...checks,
      responseTime: `${responseTime}ms`,
    },
    {
      status: checks.status === 'ok' ? 200 : checks.status === 'degraded' ? 206 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

