import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateAnalyticsInsights } from '@/lib/ai/business-intelligence';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessData } = body;

    if (!businessData || !businessData.name || !businessData.category || !businessData.metrics) {
      return NextResponse.json(
        { error: 'Business data with name, category, and metrics is required' },
        { status: 400 }
      );
    }

    const insights = await generateAnalyticsInsights(businessData);

    return NextResponse.json({ insights });
  } catch (error) {
    logger.error('Analytics insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics insights' },
      { status: 500 }
    );
  }
}

