import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/companies/[id]/content - Şirketin tüm domain içeriklerini getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = parseInt(params.id);

    const contents = await prisma.companyContent.findMany({
      where: { companyId },
      include: {
        domain: true,
      },
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error('Error fetching company content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/companies/[id]/content - Şirket için domain içeriği oluştur/güncelle
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = parseInt(params.id);
    const body = await request.json();
    const {
      domainId,
      isVisible,
      customDescription,
      customImages,
      promotions,
      metaTitle,
      metaDescription,
    } = body;

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
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error creating/updating company content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

