import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenant, getDomainId } from '@/lib/api-guard';
import { requireAdmin } from '@/lib/auth-guard';

// GET /api/companies - Şirketleri listele (domain'e göre filtreleme)
export async function GET(request: NextRequest) {
  try {
    // Resolve tenant from request
    const tenant = await resolveTenant(request);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid tenant domain' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    // Şirketleri getir
    const companies = await prisma.company.findMany({
      where: {
        content: {
          some: {
            domainId: getDomainId(tenant),
            isVisible: true,
          },
        },
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(category && {
          categories: {
            has: category,
          },
        }),
      },
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
          take: 5,
        },
      },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/companies - Yeni şirket ekle (Admin only)
export async function POST(request: NextRequest) {
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const {
      name,
      slug,
      googlePlaceId,
      address,
      city,
      postalCode,
      phone,
      email,
      website,
      latitude,
      longitude,
      categories,
      logoUrl,
      coverImageUrl,
    } = body;

    // Şirket oluştur
    const company = await prisma.company.create({
      data: {
        name,
        slug,
        googlePlaceId,
        address,
        city,
        postalCode,
        phone,
        email,
        website,
        latitude,
        longitude,
        categories: categories || [],
        logoUrl,
        coverImageUrl,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

