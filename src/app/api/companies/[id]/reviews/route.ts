import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        companyId,
        isApproved: true,
        isActive: true, // Only show active reviews
      },
      select: {
        id: true,
        authorName: true,
        authorPhoto: true,
        rating: true,
        comment: true, // Original comment
        commentFr: true, // French version (use this for display)
        source: true,
        reviewDate: true,
        originalLanguage: true,
      },
      orderBy: {
        reviewDate: 'desc',
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

