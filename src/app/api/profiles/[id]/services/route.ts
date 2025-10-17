import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * Company Services/Categories JSON API
 * Returns available services and categories in schema.org format
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
      select: {
        id: true,
        name: true,
        slug: true,
        categories: true,
        content: {
          where: { domainId: domainRecord.id },
          select: {
            customFields: true,
            customDescription: true,
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

    const content = company.content[0];
    const customFields = (content?.customFields as any) || {};

    // Extract services from custom fields and categories
    const services = [
      ...company.categories.map((cat) => ({
        '@type': 'Service',
        name: cat,
        provider: company.name,
        areaServed: {
          '@type': 'Place',
          name: 'Alsace-Moselle',
          addressCountry: 'FR',
        },
      })),
      ...(customFields.services
        ? Array.isArray(customFields.services)
          ? customFields.services.map((svc: any) => ({
              '@type': 'Service',
              name: typeof svc === 'string' ? svc : svc.name,
              description: typeof svc === 'string' ? undefined : svc.description,
              provider: company.name,
            }))
          : []
        : []),
    ];

    // Extract price range if available
    const priceRange = customFields.priceRange || customFields.pricing;

    // Get related companies by category
    const relatedCompanies = await prisma.company.findMany({
      where: {
        NOT: { id: company.id },
        categories: {
          hasSome: company.categories,
        },
        content: {
          some: {
            domainId: domainRecord.id,
            isVisible: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 5,
    });

    const response = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${baseUrl}/api/profiles/${id}/services`,
      name: `Services provided by ${company.name}`,
      description: `Complete service and category information for ${company.name}`,
      mainEntity: {
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}/companies/${company.slug}`,
        name: company.name,
        description: content?.customDescription || undefined,
        categories: company.categories,
      },
      itemListElement: services,
      priceRange: priceRange || undefined,
      relatedBusinesses: relatedCompanies.map((rc) => ({
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}/companies/${rc.slug}`,
        name: rc.name,
      })),
      dateModified: new Date().toISOString(),
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
        'Cache-Control': 'public, max-age=3600', // 1 hour
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Content-License': 'CC-BY-4.0',
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const revalidate = 3600; // 1 hour
