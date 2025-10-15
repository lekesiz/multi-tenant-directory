import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setTenantContext, clearTenantContext } from '@/lib/prisma-middleware';

// GET /api/companies/[id]/content - Şirketin tüm domain içeriklerini getir (Admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const companyId = parseInt(id);

    // Set admin context for cross-tenant access
    setTenantContext('', 'admin');

    const contents = await prisma.companyContent.findMany({
      where: { companyId },
      include: {
        domain: true,
      },
    });

    clearTenantContext();
    return NextResponse.json(contents);
  } catch (error) {
    clearTenantContext();
    console.error('Error fetching company content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/companies/[id]/content - Şirket için domain içeriği oluştur/güncelle (Admin only)
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
    } = body;

    // Set admin context for RLS bypass
    setTenantContext('', 'admin');

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

    clearTenantContext();
    return NextResponse.json(content);
  } catch (error) {
    clearTenantContext();
    console.error('Error creating/updating company content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

