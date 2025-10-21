import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET() {
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const pages = await prisma.legalPage.findMany({
      orderBy: { slug: 'asc' },
    });

    return NextResponse.json(pages);
  } catch (error) {
    logger.error('Error fetching legal pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { slug, title, content, domainId, isActive } = body;

    const page = await prisma.legalPage.create({
      data: {
        slug,
        title,
        content,
        domainId: domainId || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    logger.error('Error creating legal page:', error);
    return NextResponse.json(
      { error: 'Failed to create legal page' },
      { status: 500 }
    );
  }
}

