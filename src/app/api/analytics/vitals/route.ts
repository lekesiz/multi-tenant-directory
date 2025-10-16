import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    // Log Web Vitals metrics
    logger.info('Web Vitals metric', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });

    // TODO: Store in database or send to analytics service
    // Example: Send to Google Analytics, Mixpanel, etc.

    // For now, just log and return success
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Web Vitals error', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log metric' },
      { status: 500 }
    );
  }
}

