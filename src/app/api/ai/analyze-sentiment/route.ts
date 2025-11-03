import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeReviewSentiment } from '@/lib/ai/data-processing';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reviewText, rating } = body;

    if (!reviewText) {
      return NextResponse.json(
        { error: 'Review text is required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeReviewSentiment(reviewText, rating);

    return NextResponse.json({ analysis });
  } catch (error) {
    logger.error('Sentiment analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}

