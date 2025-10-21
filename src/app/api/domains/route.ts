import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/domains - Tüm domain'leri listele
export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(domains);
  } catch (error) {
    logger.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/domains - Yeni domain ekle (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, isActive, settings } = body;

    const domain = await prisma.domain.create({
      data: {
        name,
        isActive: isActive ?? true,
        settings: settings || {},
      },
    });

    return NextResponse.json(domain, { status: 201 });
  } catch (error) {
    logger.error('Error creating domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

