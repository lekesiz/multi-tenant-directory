import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

// GET /api/admin/categories/list - Get all categories for dropdown selection
export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        slug: true,
        name: true,
        nameFr: true,
        icon: true,
        parentId: true,
        order: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    logger.error('Error fetching categories list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
