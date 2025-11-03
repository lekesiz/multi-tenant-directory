import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateBusinessDescription } from '@/lib/translation';
import { generateAICacheKey, getOrGenerateAI } from '@/lib/ai-cache';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role?.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyId, name, category, description, location } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Company name and category are required' },
        { status: 400 }
      );
    }

    logger.info(`🤖 Generating SEO content for: ${name} (${category})`);

    // Generate cache key
    const cacheKey = generateAICacheKey('description', companyId || name, {
      category,
      location: location || 'unknown',
    });

    // Generate content using Claude with caching
    const generatedContent = await getOrGenerateAI(
      cacheKey,
      () => generateBusinessDescription({
        name,
        category,
        description,
        location,
      }),
      30 * 24 * 60 * 60 // 30 days TTL
    );

    if (!generatedContent) {
      return NextResponse.json(
        { error: 'Failed to generate content. Please try again.' },
        { status: 500 }
      );
    }

    logger.info(`✅ Content generated for ${name}`);

    return NextResponse.json({
      success: true,
      content: generatedContent,
      message: 'Content generated successfully',
    });
  } catch (error) {
    logger.error('Error generating description:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}
