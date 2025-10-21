import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenant, getDomainId } from '@/lib/api-guard';
import { requireAdmin } from '@/lib/auth-guard';

// GET /api/companies/[id] - Şirket detayını getir
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Resolve tenant
    const tenant = await resolveTenant(request);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid tenant domain' },
        { status: 400 }
      );
    }

    const { id } = await context.params;
    const companyId = parseInt(id);

    // Şirketi getir
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        content: {
          where: {
            domainId: getDomainId(tenant),
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
    const visibleContent = company.content.find(
      (c) => c.domainId === getDomainId(tenant) && c.isVisible
    );

    if (!visibleContent) {
      return NextResponse.json(
        { error: 'Company not available on this domain' },
        { status: 403 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    logger.error('Error fetching company:', error);
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
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await context.params;
    const companyId = parseInt(id);
    const body = await request.json();

    // Convert latitude/longitude strings to floats
    const updateData: any = { ...body };
    if (body.latitude !== undefined) {
      updateData.latitude = body.latitude === '' ? null : parseFloat(body.latitude);
    }
    if (body.longitude !== undefined) {
      updateData.longitude = body.longitude === '' ? null : parseFloat(body.longitude);
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });

    return NextResponse.json(company);
  } catch (error) {
    logger.error('Error updating company:', error);
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
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await context.params;
    const companyId = parseInt(id);

    await prisma.company.delete({
      where: { id: companyId },
    });

    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    logger.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

