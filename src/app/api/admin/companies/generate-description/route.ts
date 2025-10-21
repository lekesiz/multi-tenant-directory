import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateBusinessDescription } from '@/lib/translation';

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

    const body = await request.json();
    const { companyId, name, category, description, location } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Company name and category are required' },
        { status: 400 }
      );
    }

    logger.info(`🤖 Generating SEO content for: ${name} (${category})`);

    // Generate content using Claude
    const generatedContent = await generateBusinessDescription({
      name,
      category,
      description,
      location,
    });

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
