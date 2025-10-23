import { logger } from '@/lib/logger';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Şirketleri getir (optimized with pagination and selective fields)
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
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
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        postalCode: true,
        phone: true,
        email: true,
        website: true,
        latitude: true,
        longitude: true,
        categories: true,
        logoUrl: true,
        coverImageUrl: true,
        rating: true,
        reviewCount: true,
        isFeatured: true,
        content: {
          where: {
            domainId: getDomainId(tenant),
          },
          select: {
            id: true,
            customDescription: true,
            customImages: true,
            promotions: true,
            priority: true,
            specialOffers: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: {
                isApproved: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
      ],
      take: limit,
      skip: skip,
    });

    // Get total count for pagination
    const total = await prisma.company.count({
      where: {
        isActive: true,
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
    });

    return NextResponse.json({
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching companies:', error);
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

    // Resolve tenant from request
    const tenant = await resolveTenant(request);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid tenant domain' },
        { status: 400 }
      );
    }

    const domainId = getDomainId(tenant);

    // Slug'ın unique olduğundan emin ol
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.company.findUnique({ where: { slug: uniqueSlug } })) {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    // Şirket oluştur
    const company = await prisma.company.create({
      data: {
        name,
        slug: uniqueSlug,
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

    // CompanyContent oluştur (şirketin domain'de görünmesi için)
    await prisma.companyContent.create({
      data: {
        companyId: company.id,
        domainId: domainId,
        isVisible: true,
        priority: 0,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    logger.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

