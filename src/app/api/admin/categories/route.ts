import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.businessCategory.findMany({
      orderBy: {
        frenchName: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

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
    const { googleCategory, frenchName, icon } = body;

    if (!googleCategory || !frenchName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if googleCategory already exists
    const existing = await prisma.businessCategory.findUnique({
      where: { googleCategory },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this googleCategory already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.businessCategory.create({
      data: {
        googleCategory,
        frenchName,
        icon: icon || '🏪',
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

