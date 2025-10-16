import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateReviewResponse } from '@/lib/ai/content-generation';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessName, reviewText, rating, reviewerName } = body;

    if (!businessName || !reviewText || !rating) {
      return NextResponse.json(
        { error: 'Business name, review text, and rating are required' },
        { status: 400 }
      );
    }

    const response = await generateReviewResponse({
      businessName,
      reviewText,
      rating,
      reviewerName,
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Generate review response error:', error);
    return NextResponse.json(
      { error: 'Failed to generate review response' },
      { status: 500 }
    );
  }
}

