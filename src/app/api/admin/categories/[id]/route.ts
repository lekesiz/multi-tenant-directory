import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: idParam } = await context.params;
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
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
      order,
    } = body;

    if (!slug || !name) {
      return NextResponse.json(
        { error: 'Slug and name are required' },
        { status: 400 }
      );
    }

    // Check if slug is taken by another category
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: 'This slug is already in use by another category' },
        { status: 400 }
      );
    }

    // Validate parent category
    if (parentId) {
      if (parentId === id) {
        return NextResponse.json(
          { error: 'A category cannot be its own parent' },
          { status: 400 }
        );
      }

      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }

      // Prevent nested subcategories
      if (parentCategory.parentId) {
        return NextResponse.json(
          { error: 'Cannot make this category a subcategory of a subcategory' },
          { status: 400 }
        );
      }

      // Check if any of this category's children would create a circular reference
      const children = await prisma.category.findMany({
        where: { parentId: id },
      });

      if (children.length > 0 && parentId) {
        return NextResponse.json(
          { error: 'Cannot set a parent for a category that already has children' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        slug,
        name,
        nameFr: nameFr || null,
        nameEn: nameEn || null,
        nameDe: nameDe || null,
        description: description || null,
        icon: icon || undefined,
        color: color || undefined,
        parentId: parentId || null,
        googleTypes: googleTypes || undefined,
        order: order !== undefined ? order : undefined,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    logger.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: idParam } = await context.params;
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category has any children
    const childrenCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete a category that has subcategories. Delete the subcategories first.' },
        { status: 400 }
      );
    }

    // Check if category is used by any companies
    const companyUsageCount = await prisma.companyCategory.count({
      where: { categoryId: id },
    });

    if (companyUsageCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It is used by ${companyUsageCount} company(ies).` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

