import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenant, getDomainId } from '@/lib/api-guard';
import { requireAdmin } from '@/lib/auth-guard';

/**
 * Parse Google's weekday_text format to our BusinessHours format
 * Example: ["Monday: 9:00 AM – 6:00 PM", "Tuesday: Closed", ...]
 */
function parseGoogleBusinessHours(weekdayText: string[]) {
  const daysMap: Record<string, string> = {
    'Monday': 'monday',
    'Tuesday': 'tuesday',
    'Wednesday': 'wednesday',
    'Thursday': 'thursday',
    'Friday': 'friday',
    'Saturday': 'saturday',
    'Sunday': 'sunday',
    'Lundi': 'monday',
    'Mardi': 'tuesday',
    'Mercredi': 'wednesday',
    'Jeudi': 'thursday',
    'Vendredi': 'friday',
    'Samedi': 'saturday',
    'Dimanche': 'sunday',
  };

  const hours: Record<string, any> = {};

  weekdayText.forEach((text) => {
    // Parse "Monday: 9:00 AM – 6:00 PM" or "Monday: Closed"
    const match = text.match(/^([^:]+):\s*(.+)$/);
    if (!match) return;

    const [, dayName, timeStr] = match;
    const dayKey = daysMap[dayName.trim()];
    if (!dayKey) return;

    // Check if closed
    if (timeStr.toLowerCase().includes('closed') || timeStr.toLowerCase().includes('fermé')) {
      hours[dayKey] = { isOpen: false, openTime: '00:00', closeTime: '00:00' };
      return;
    }

    // Parse time range: "9:00 AM – 6:00 PM" or "9:00 – 18:00"
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})\s*(?:AM|PM)?\s*[–-]\s*(\d{1,2}:\d{2})\s*(?:AM|PM)?/i);
    if (timeMatch) {
      let [, openTime, closeTime] = timeMatch;

      // Convert 12-hour to 24-hour if needed
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        openTime = convertTo24Hour(openTime, timeStr.includes('AM', timeStr.indexOf(openTime)));
        closeTime = convertTo24Hour(closeTime, timeStr.includes('PM', timeStr.indexOf(closeTime)));
      }

      hours[dayKey] = { isOpen: true, openTime, closeTime };
    }
  });

  return hours;
}

/**
 * Convert 12-hour time to 24-hour format
 */
function convertTo24Hour(time: string, isPM: boolean): string {
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;

  if (isPM && hours !== 12) {
    hour24 = hours + 12;
  } else if (!isPM && hours === 12) {
    hour24 = 0;
  }

  return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

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
      businessHours,
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

    // Parse business hours from Google format if provided
    let parsedBusinessHours = null;
    if (businessHours && Array.isArray(businessHours) && businessHours.length > 0) {
      // Google provides weekday_text as array: ["Monday: 9:00 AM – 6:00 PM", ...]
      parsedBusinessHours = parseGoogleBusinessHours(businessHours);
    }

    // Auto-match categories from Google types if provided
    let matchedCategoryIds: number[] = [];
    if (categories && Array.isArray(categories) && categories.length > 0) {
      try {
        const matchedCategories = await prisma.category.findMany({
          where: {
            isActive: true,
            googleTypes: {
              hasSome: categories,
            },
          },
          orderBy: [
            { parentId: 'desc' }, // Prefer child categories (more specific)
            { order: 'asc' },
          ],
          take: 5, // Limit to top 5 matches
        });

        matchedCategoryIds = matchedCategories.map((cat) => cat.id);

        if (matchedCategoryIds.length > 0) {
          logger.info(`Auto-matched ${matchedCategoryIds.length} categories for company: ${name}`);
        }
      } catch (error) {
        logger.error('Error matching categories:', error);
        // Continue without categories if matching fails
      }
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
        businessHours: parsedBusinessHours as any,
      },
    });

    // Create BusinessHours entry if we have hours data
    if (parsedBusinessHours) {
      try {
        await prisma.businessHours.create({
          data: {
            companyId: company.id,
            monday: parsedBusinessHours.monday || null,
            tuesday: parsedBusinessHours.tuesday || null,
            wednesday: parsedBusinessHours.wednesday || null,
            thursday: parsedBusinessHours.thursday || null,
            friday: parsedBusinessHours.friday || null,
            saturday: parsedBusinessHours.saturday || null,
            sunday: parsedBusinessHours.sunday || null,
            specialHours: [],
          },
        });
      } catch (error) {
        logger.error('Error creating business hours:', error);
        // Don't fail company creation if hours fail
      }
    }

    // Create CompanyCategory relationships
    if (matchedCategoryIds.length > 0) {
      try {
        await prisma.companyCategory.createMany({
          data: matchedCategoryIds.map((categoryId, index) => ({
            companyId: company.id,
            categoryId,
            isPrimary: index === 0, // First matched category is primary
          })),
        });
      } catch (error) {
        logger.error('Error creating company categories:', error);
        // Don't fail company creation if category linking fails
      }
    }

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

