import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { syncAllCompaniesReviews } from '@/lib/google-places';

/**
 * API Route pour la synchronisation automatique des avis Google
 * Cette route est appelée par Vercel Cron Jobs
 * 
 * Configuration dans vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-reviews",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret CRON pour la sécurité
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron request');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Starting automatic Google Reviews sync via cron');

    // Synchroniser tous les avis
    const result = await syncAllCompaniesReviews();

    logger.info('Cron sync completed', {
      companiesProcessed: result.companiesProcessed,
      totalReviewsAdded: result.totalReviewsAdded,
    });

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      companiesProcessed: result.companiesProcessed,
      totalReviewsAdded: result.totalReviewsAdded,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Error in cron sync:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Permettre aussi les requêtes POST
export async function POST(request: NextRequest) {
  return GET(request);
}
