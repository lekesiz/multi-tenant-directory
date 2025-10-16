import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// Advanced search with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get current domain
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const domain = host.replace('www.', '');

    // Get current domain from database
    const currentDomain = await prisma.domain.findUnique({
      where: { name: domain },
    });

    if (!currentDomain) {
      return NextResponse.json(
        { error: 'Domain non configuré' },
        { status: 404 }
      );
    }

    // Parse filters
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const openNow = searchParams.get('openNow') === 'true';
    const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance, rating, distance, name
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10'); // km
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Build where clause
    const whereClause: any = {
      content: {
        some: {
          domainId: currentDomain.id,
          isVisible: true,
        },
      },
    };

    // Text search (name, categories, address, city)
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { categories: { hasSome: [query] } },
        { address: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (category) {
      whereClause.categories = { has: category };
    }

    // Rating filter
    if (minRating > 0) {
      whereClause.rating = { gte: minRating };
    }

    // Open now filter
    if (openNow) {
      // Get current day and time
      const now = new Date();
      const dayOfWeek = now.toLocaleLowerCase('en-US', { weekday: 'long' });
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      // This is complex - for now, we'll just filter companies that have hours set
      whereClause.hours = { isNot: null };
    }

    // Distance filter (if lat/lng provided)
    if (lat !== 0 && lng !== 0) {
      // Calculate bounding box for radius
      const latDelta = radius / 111; // 1 degree ≈ 111km
      const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

      whereClause.latitude = {
        gte: lat - latDelta,
        lte: lat + latDelta,
      };
      whereClause.longitude = {
        gte: lng - lngDelta,
        lte: lng + lngDelta,
      };
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }];
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'distance':
        // Distance sorting requires custom logic after fetch
        orderBy = { id: 'asc' };
        break;
      default:
        // Relevance: prioritize rating and review count
        orderBy = [
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { name: 'asc' },
        ];
    }

    // Fetch companies
    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where: whereClause,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
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
          rating: true,
          reviewCount: true,
          content: {
            where: {
              domainId: currentDomain.id,
            },
            select: {
              customDescription: true,
            },
          },
        },
      }),
      prisma.company.count({ where: whereClause }),
    ]);

    // Calculate distance if lat/lng provided
    let companiesWithDistance = companies.map((company) => {
      let distance: number | null = null;

      if (lat !== 0 && lng !== 0 && company.latitude && company.longitude) {
        // Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = ((company.latitude - lat) * Math.PI) / 180;
        const dLng = ((company.longitude - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((company.latitude * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = R * c;
      }

      return {
        ...company,
        distance,
        description: company.content[0]?.customDescription || null,
      };
    });

    // Sort by distance if requested
    if (sortBy === 'distance' && lat !== 0 && lng !== 0) {
      companiesWithDistance = companiesWithDistance.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    // Remove content field from response
    const results = companiesWithDistance.map(({ content, ...company }) => company);

    return NextResponse.json({
      success: true,
      results,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      filters: {
        query,
        category,
        minRating,
        openNow,
        sortBy,
        radius,
      },
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}

// Get all available categories for filters
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const domain = host.replace('www.', '');

    const currentDomain = await prisma.domain.findUnique({
      where: { name: domain },
    });

    if (!currentDomain) {
      return NextResponse.json(
        { error: 'Domain non configuré' },
        { status: 404 }
      );
    }

    // Get all unique categories
    const companies = await prisma.company.findMany({
      where: {
        content: {
          some: {
            domainId: currentDomain.id,
            isVisible: true,
          },
        },
      },
      select: {
        categories: true,
      },
    });

    // Flatten and count categories
    const categoryCount: Record<string, number> = {};
    companies.forEach((company) => {
      company.categories.forEach((cat) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    });

    // Sort by count
    const categories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      success: true,
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}
