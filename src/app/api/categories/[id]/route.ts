import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

/**
 * GET /api/categories/[id]
 * Get a single category by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        parent: true,
        children: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            companyCategories: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    logger.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[id]
 * Update a category (Admin only)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await context.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

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

    // Check if slug is taken by another category
    if (slug) {
      const existing = await prisma.category.findUnique({
        where: { slug },
      });

      if (existing && existing.id !== categoryId) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Prevent circular parent-child relationships
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parseInt(parentId) },
        include: { parent: true },
      });

      if (parent?.parentId === categoryId) {
        return NextResponse.json(
          { error: 'Cannot create circular parent-child relationship' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
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
        googleTypes: googleTypes || undefined,
        isActive,
        order,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    logger.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete a category (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await context.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category has children
    const childCount = await prisma.category.count({
      where: { parentId: categoryId },
    });

    if (childCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with children. Delete children first or set them to another parent.' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
