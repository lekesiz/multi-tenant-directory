import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/companies/[id]/content - Şirketin tüm domain içeriklerini getir
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const companyId = parseInt(id);

    const contents = await prisma.companyContent.findMany({
      where: { companyId },
      include: {
        domain: true,
      },
    });

    return NextResponse.json(contents);
  } catch (error) {
    logger.error('Error fetching company content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/companies/[id]/content - Şirket için domain içeriği oluştur/güncelle
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const companyId = parseInt(id);
    const body = await request.json();
    const {
      domainId,
      isVisible,
      customDescription,
      customImages,
      promotions,
      metaTitle,
      metaDescription,
      priority,
      featuredUntil,
    } = body;

    // Convert featuredUntil to Date if provided
    const featuredUntilDate = featuredUntil ? new Date(featuredUntil) : null;

    // Upsert: Varsa güncelle, yoksa oluştur
    const content = await prisma.companyContent.upsert({
      where: {
        companyId_domainId: {
          companyId,
          domainId,
        },
      },
      update: {
        isVisible,
        customDescription,
        customImages,
        promotions,
        metaTitle,
        metaDescription,
        priority: priority !== undefined ? priority : 0,
        featuredUntil: featuredUntilDate,
      },
      create: {
        companyId,
        domainId,
        isVisible,
        customDescription,
        customImages,
        promotions,
        metaTitle,
        metaDescription,
        priority: priority || 0,
        featuredUntil: featuredUntilDate,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    logger.error('Error creating/updating company content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

