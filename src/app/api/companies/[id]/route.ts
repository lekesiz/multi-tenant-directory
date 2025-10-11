import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/companies/[id] - Şirket detayını getir
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const domain = request.headers.get('x-tenant-domain') || '';
    const { id } = await context.params;
    const companyId = parseInt(id);

    // Domain'i bul
    const domainRecord = await prisma.domain.findUnique({
      where: { name: domain },
    });

    if (!domainRecord) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // Şirketi getir
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        content: {
          where: {
            domainId: domainRecord.id,
          },
        },
        reviews: {
          orderBy: {
            reviewDate: 'desc',
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Bu domain'de görünür mü kontrol et
    const isVisible = company.content.some(
      (c) => c.domainId === domainRecord.id && c.isVisible
    );

    if (!isVisible) {
      return NextResponse.json(
        { error: 'Company not available on this domain' },
        { status: 403 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id] - Şirketi güncelle (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const companyId = parseInt(id);
    const body = await request.json();

    const company = await prisma.company.update({
      where: { id: companyId },
      data: body,
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Şirketi sil (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const companyId = parseInt(id);

    await prisma.company.delete({
      where: { id: companyId },
    });

    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

