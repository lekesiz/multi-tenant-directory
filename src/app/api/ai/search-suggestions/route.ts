import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { generateSearchSuggestions } from '@/lib/ai/user-experience';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const suggestions = await generateSearchSuggestions(query, context);

    return NextResponse.json({ suggestions });
  } catch (error) {
    logger.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate search suggestions' },
      { status: 500 }
    );
  }
}

