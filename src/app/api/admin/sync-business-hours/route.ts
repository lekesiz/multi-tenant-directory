import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { syncCompanyReviews } from '@/lib/google-places';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/sync-business-hours
 * Sync business hours from Google Places for all companies or a specific company
 */
export async function POST(request: NextRequest) {
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { companyId, syncAll } = body;

    let companiesProcessed = 0;
    let companiesFailed = 0;
    let results: any[] = [];

    if (companyId) {
      // Sync single company
      logger.info(`Syncing business hours for company ${companyId}`);
      const result = await syncCompanyReviews(parseInt(companyId));

      return NextResponse.json({
        success: result.success,
        message: result.message,
        companiesProcessed: result.success ? 1 : 0,
        companiesFailed: result.success ? 0 : 1,
      });
    }

    if (syncAll) {
      // Sync all companies with Google Place IDs
      const companies = await prisma.company.findMany({
        where: {
          googlePlaceId: {
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          googlePlaceId: true,
        },
      });

      logger.info(`Starting batch sync for ${companies.length} companies with Google Place IDs`);

      for (const company of companies) {
        try {
          const result = await syncCompanyReviews(company.id);

          if (result.success) {
            companiesProcessed++;
            results.push({
              companyId: company.id,
              name: company.name,
              success: true,
              message: result.message,
            });
          } else {
            companiesFailed++;
            results.push({
              companyId: company.id,
              name: company.name,
              success: false,
              message: result.message,
            });
          }

          // Rate limiting: wait 150ms between requests to avoid Google API limits
          await new Promise(resolve => setTimeout(resolve, 150));
        } catch (error) {
          companiesFailed++;
          logger.error(`Error syncing company ${company.id}:`, error);
          results.push({
            companyId: company.id,
            name: company.name,
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Synced business hours for ${companiesProcessed} companies (${companiesFailed} failed)`,
        companiesProcessed,
        companiesFailed,
        totalCompanies: companies.length,
        results: results.slice(0, 50), // Return first 50 results to avoid huge response
      });
    }

    return NextResponse.json(
      { error: 'Please specify either companyId or syncAll' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Error in sync business hours endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync-business-hours
 * Get sync status and configuration
 */
export async function GET() {
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const companiesWithPlaceId = await prisma.company.count({
      where: {
        googlePlaceId: {
          not: null,
        },
      },
    });

    const companiesWithHours = await prisma.businessHours.count();

    const lastSync = await prisma.company.findFirst({
      where: {
        lastSyncedAt: {
          not: null,
        },
      },
      orderBy: {
        lastSyncedAt: 'desc',
      },
      select: {
        lastSyncedAt: true,
        name: true,
      },
    });

    return NextResponse.json({
      status: 'ready',
      companiesWithPlaceId,
      companiesWithHours,
      lastSync: lastSync
        ? {
            company: lastSync.name,
            syncedAt: lastSync.lastSyncedAt,
          }
        : null,
      apiKeyConfigured: !!process.env.GOOGLE_MAPS_API_KEY,
    });
  } catch (error) {
    logger.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
