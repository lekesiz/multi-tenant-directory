import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * Company Business Hours JSON API
 * Returns opening hours in schema.org OpeningHoursSpecification format
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const headersList = await headers();
    const host = headersList.get('host') || 'haguenau.pro';

    let domain = host.split(':')[0];
    domain = domain.replace('www.', '');

    // Get domain record
    const domainRecord = await prisma.domain.findUnique({
      where: { name: domain },
    });

    if (!domainRecord) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    const baseUrl = `https://${domain}`;

    // Find company
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { googlePlaceId: id },
          { id: isNaN(parseInt(id)) ? undefined : parseInt(id) },
        ],
        content: {
          some: {
            domainId: domainRecord.id,
            isVisible: true,
          },
        },
      },
      include: {
        hours: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Format opening hours
    const openingHours = company.hours.map((h: any) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.openTime,
      closes: h.closeTime,
      validFrom: new Date().toISOString().split('T')[0],
      validThrough: undefined, // Ongoing until changed
    }));

    // Group by day for more efficient storage
    const groupedByDay: { [key: string]: any } = {};
    company.hours.forEach((h: any) => {
      const key = `${h.openTime}-${h.closeTime}`;
      if (!groupedByDay[key]) {
        groupedByDay[key] = {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [],
          opens: h.openTime,
          closes: h.closeTime,
        };
      }
      groupedByDay[key].dayOfWeek.push(h.dayOfWeek);
    });

    const response = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${baseUrl}/api/profiles/${id}/hours`,
      name: `Opening Hours for ${company.name}`,
      description: `Business hours for ${company.name}`,
      mainEntity: {
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}/companies/${company.slug}`,
        name: company.name,
        openingHoursSpecification: Object.values(groupedByDay),
      },
      detailedSchedule: openingHours,
      totalResults: company.hours.length,
      dateModified: new Date().toISOString(),
      timezone: 'Europe/Paris',
      country: 'FR',
      license: 'CC-BY-4.0',
      attribution: {
        name: domain,
        url: baseUrl,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=86400', // 24 hours (hours don't change often)
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Content-License': 'CC-BY-4.0',
      },
    });
  } catch (error) {
    console.error('Error fetching hours:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const revalidate = 86400; // 24 hours
