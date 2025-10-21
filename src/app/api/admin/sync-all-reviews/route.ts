import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncAllCompaniesReviews } from '@/lib/google-places';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if Google Maps API key is configured
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 503 }
      );
    }

    // Perform the batch sync
    const result = await syncAllCompaniesReviews();

    return NextResponse.json({
      success: result.success,
      totalReviewsAdded: result.totalReviewsAdded,
      companiesProcessed: result.companiesProcessed,
    });
  } catch (error) {
    logger.error('Sync all reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to sync reviews' },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return sync configuration status
    return NextResponse.json({
      apiKeyConfigured: !!process.env.GOOGLE_MAPS_API_KEY,
      cronEnabled: !!process.env.GOOGLE_SYNC_CRON_ENABLED,
      lastSyncTime: process.env.GOOGLE_SYNC_LAST_RUN || null,
    });
  } catch (error) {
    logger.error('Get sync status error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}