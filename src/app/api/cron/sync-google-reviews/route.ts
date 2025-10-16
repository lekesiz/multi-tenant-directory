import { NextRequest, NextResponse } from 'next/server';
import { syncAllCompaniesReviews } from '@/lib/google-places';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution time

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = (await headers()).get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if cron is enabled
    if (process.env.GOOGLE_SYNC_CRON_ENABLED !== 'true') {
      return NextResponse.json({
        success: true,
        message: 'Cron job is disabled',
      });
    }

    // Check if Google Maps API key is configured
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not configured');
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 503 }
      );
    }

    console.log('Starting Google Reviews sync cron job...');
    
    // Perform the sync
    const result = await syncAllCompaniesReviews();

    console.log('Google Reviews sync completed:', {
      totalReviewsAdded: result.totalReviewsAdded,
      companiesProcessed: result.companiesProcessed,
    });

    // Log the sync time for monitoring
    const syncTime = new Date().toISOString();

    return NextResponse.json({
      success: result.success,
      totalReviewsAdded: result.totalReviewsAdded,
      companiesProcessed: result.companiesProcessed,
      syncTime,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}