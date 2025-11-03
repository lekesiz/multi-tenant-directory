import { logger } from '@/lib/logger';
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

    // Format opening hours from BusinessHours object
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    const openingHoursSpec: any[] = [];

    if (company.hours) {
      days.forEach((day) => {
        const dayHours = company.hours?.[day as keyof typeof company.hours] as any;
        if (dayHours && !dayHours.closed) {
          openingHoursSpec.push({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
            opens: dayHours.open,
            closes: dayHours.close,
          });
        }
      });
    }

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
        openingHoursSpecification: openingHoursSpec,
      },
      timezone: company.hours?.timezone || 'Europe/Paris',
      dateModified: new Date().toISOString(),
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
    logger.error('Error fetching hours:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const revalidate = 86400; // 24 hours
