import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

/**
 * GET /api/categories
 * Get all categories with optional hierarchy
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeChildren = searchParams.get('includeChildren') === 'true';
    const parentId = searchParams.get('parentId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: any = {};

    if (activeOnly) {
      where.isActive = true;
    }

    if (parentId === 'null' || parentId === '') {
      // Get only parent categories
      where.parentId = null;
    } else if (parentId) {
      // Get categories with specific parent
      where.parentId = parseInt(parentId);
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: includeChildren
          ? {
              where: activeOnly ? { isActive: true } : undefined,
              orderBy: { order: 'asc' },
            }
          : false,
        _count: {
          select: {
            companyCategories: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Create a new category (Admin only)
 */
export async function POST(request: NextRequest) {
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const {
      slug,
      name,
      nameFr,
      nameEn,
      nameDe,
      description,
      icon,
      color,
      parentId,
      googleTypes,
      isActive,
      order,
    } = body;

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        slug,
        name,
        nameFr,
        nameEn,
        nameDe,
        description,
        icon,
        color,
        parentId: parentId ? parseInt(parentId) : null,
        googleTypes: googleTypes || [],
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    logger.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
