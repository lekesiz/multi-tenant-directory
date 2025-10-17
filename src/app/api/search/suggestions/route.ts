import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function getDomainFromHost(host: string) {
  let domain = host.split(':')[0];
  domain = domain.replace('www.', '');
  return await prisma.domain.findUnique({
    where: { name: domain },
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const headersList = await headers();
    const host = headersList.get('host') || 'haguenau.pro';
    const currentDomain = await getDomainFromHost(host);

    if (!currentDomain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Build where clause
    const whereClause: any = {
      content: {
        some: {
          domainId: currentDomain.id,
          isVisible: true,
        },
      },
    };

    // If category filter provided
    if (category) {
      whereClause.categories = {
        has: category,
      };
    }

    // Search by name or city
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { city: { contains: query, mode: 'insensitive' } },
      { categories: { has: query } },
    ];

    // Fetch companies
    const companies = await prisma.company.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        categories: true,
        rating: true,
        reviewCount: true,
      },
      take: limit,
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
        { name: 'asc' },
      ],
    });

    // Format suggestions
    const suggestions = companies.map((company) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      city: company.city,
      category: company.categories[0] || null,
      rating: company.rating,
      reviewCount: company.reviewCount,
      label: `${company.name}${company.city ? ` - ${company.city}` : ''}${
        company.categories.length > 0 ? ` (${company.categories[0]})` : ''
      }`,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
