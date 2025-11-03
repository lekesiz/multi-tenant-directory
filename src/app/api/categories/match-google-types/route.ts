import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/categories/match-google-types
 * Match Google Place types to our categories
 * This is used when importing companies from Google
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { googleTypes } = body;

    if (!googleTypes || !Array.isArray(googleTypes)) {
      return NextResponse.json(
        { error: 'googleTypes array is required' },
        { status: 400 }
      );
    }

    // Find all categories that match any of the Google types
    const matchedCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        googleTypes: {
          hasSome: googleTypes,
        },
      },
      include: {
        parent: true,
      },
      orderBy: [
        { parentId: 'desc' }, // Prefer child categories (more specific)
        { order: 'asc' },
      ],
    });

    // If no exact match found, try to find parent categories
    if (matchedCategories.length === 0) {
      const parentCategories = await prisma.category.findMany({
        where: {
          isActive: true,
          parentId: null,
        },
        include: {
          children: {
            where: {
              isActive: true,
              googleTypes: {
                hasSome: googleTypes,
              },
            },
          },
        },
      });

      const parentsWithMatchingChildren = parentCategories.filter(
        (cat) => cat.children.length > 0
      );

      if (parentsWithMatchingChildren.length > 0) {
        return NextResponse.json({
          matched: parentsWithMatchingChildren,
          matchedCount: parentsWithMatchingChildren.length,
          suggested: parentsWithMatchingChildren[0],
        });
      }
    }

    // Return the best match (most specific / child category preferred)
    return NextResponse.json({
      matched: matchedCategories,
      matchedCount: matchedCategories.length,
      suggested: matchedCategories[0] || null,
    });
  } catch (error) {
    logger.error('Error matching Google types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
