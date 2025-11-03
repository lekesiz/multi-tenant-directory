import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/categories/create - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    // Validate parent category exists if parentId provided
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }

      // Prevent nested subcategories (max 2 levels)
      if (parentCategory.parentId) {
        return NextResponse.json(
          { error: 'Cannot create a subcategory of a subcategory. Only 2 levels are supported.' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.create({
      data: {
        slug,
        name,
        nameFr: nameFr || null,
        nameEn: nameEn || null,
        nameDe: nameDe || null,
        description: description || null,
        icon: icon || '📁',
        color: color || '#3B82F6',
        parentId: parentId || null,
        googleTypes: googleTypes || [],
        order: order || 0,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    logger.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
