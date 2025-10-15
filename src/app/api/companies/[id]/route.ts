import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setTenantContext, clearTenantContext } from '@/lib/prisma-middleware';
import { upstashApiRateLimit, upstashCompanyRateLimit, checkUpstashConfig } from '@/lib/upstash-rate-limit';
import { apiRateLimit } from '@/lib/rate-limit';

// GET /api/companies/[id] - Şirket detayını getir
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitResponse = checkUpstashConfig() 
      ? await upstashApiRateLimit(request)
      : await apiRateLimit(request);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const domain = request.headers.get('x-tenant-domain') || '';
    const { id } = await context.params;
    const companyId = parseInt(id);

    // Set tenant context for RLS
    setTenantContext(domain, 'user');

    // Domain'i bul
    const domainRecord = await prisma.domain.findUnique({
      where: { name: domain },
    });

    if (!domainRecord) {
      clearTenantContext();
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // RLS ile şirketi getir - artık otomatik tenant filtrelemesi yapılacak
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        content: true, // RLS policies will filter this automatically
        reviews: {
          orderBy: {
            reviewDate: 'desc',
          },
        },
      },
    });

    clearTenantContext();

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found or not available on this domain' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    clearTenantContext();
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
    // Apply stricter rate limiting for modifications
    const rateLimitResponse = checkUpstashConfig() 
      ? await upstashCompanyRateLimit(request)
      : await apiRateLimit(request);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await context.params;
    const companyId = parseInt(id);
    const body = await request.json();

    // Set admin context for RLS bypass
    setTenantContext('', 'admin');

    const company = await prisma.company.update({
      where: { id: companyId },
      data: body,
    });

    clearTenantContext();
    return NextResponse.json(company);
  } catch (error) {
    clearTenantContext();
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
    // Apply stricter rate limiting for deletions
    const rateLimitResponse = checkUpstashConfig() 
      ? await upstashCompanyRateLimit(request)
      : await apiRateLimit(request);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await context.params;
    const companyId = parseInt(id);

    // Set admin context for RLS bypass
    setTenantContext('', 'admin');

    await prisma.company.delete({
      where: { id: companyId },
    });

    clearTenantContext();
    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    clearTenantContext();
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

