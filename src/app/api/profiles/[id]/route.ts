import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Company Profile JSON API
 * Returns full company profile with schema.org LocalBusiness structure
 * Designed for AI/LLM extraction and aggregation
 */

const profileResponseSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('LocalBusiness'),
  '@id': z.string().url(),
  name: z.string(),
  description: z.string().optional(),
  image: z.object({
    '@type': z.literal('ImageObject'),
    url: z.string().url(),
    name: z.string(),
  }).optional(),
  logo: z.object({
    '@type': z.literal('ImageObject'),
    url: z.string().url(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  url: z.string().url(),
  sameAs: z.array(z.string().url()).optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.object({
    '@type': z.literal('PostalAddress'),
    streetAddress: z.string(),
    addressLocality: z.string(),
    postalCode: z.string().optional(),
    addressCountry: z.literal('FR'),
  }),
  foundingDate: z.string().optional(),
  numberOfEmployees: z.number().optional(),
  areaServed: z.array(z.string()).optional(),
  availableLanguage: z.array(z.string()).optional(),
  priceRange: z.string().optional(),
  aggregateRating: z.object({
    '@type': z.literal('AggregateRating'),
    ratingValue: z.number().min(1).max(5),
    reviewCount: z.number(),
    bestRating: z.literal(5),
    worstRating: z.literal(1),
  }).optional(),
  openingHoursSpecification: z.array(z.object({
    '@type': z.literal('OpeningHoursSpecification'),
    dayOfWeek: z.array(z.string()),
    opens: z.string().time().optional(),
    closes: z.string().time().optional(),
  })).optional(),
  acceptsReservations: z.boolean().optional(),
  paymentAccepted: z.array(z.string()).optional(),
  additionalType: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  dateModified: z.string().datetime(),
  dateCreated: z.string().datetime(),
  license: z.literal('CC-BY-4.0'),
  attributionUrl: z.string().url(),
});

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
        { error: 'Domain not found', id },
        { status: 404 }
      );
    }

    const baseUrl = `https://${domain}`;

    // Find company by ID or Google Place ID
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
        content: {
          where: {
            domainId: domainRecord.id,
          },
          select: {
            customDescription: true,
            customFields: true,
            customImages: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          select: {
            rating: true,
          },
        },
        hours: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found', id },
        { status: 404 }
      );
    }

    const content = company.content[0];
    const customFields = (content?.customFields as any) || {};

    // Calculate aggregate rating
    const aggregateRating = company.reviews.length > 0
      ? {
          '@type': 'AggregateRating' as const,
          ratingValue: Number(
            (company.reviews.reduce((sum, r) => sum + r.rating, 0) /
              company.reviews.length).toFixed(1)
          ),
          reviewCount: company.reviews.length,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

    // Build social media links
    const socialLinks = [
      ...(company.website ? [`${company.website}`] : []),
      ...(customFields.facebook ? [`${customFields.facebook}`] : []),
      ...(customFields.instagram ? [`${customFields.instagram}`] : []),
      ...(customFields.linkedin ? [`${customFields.linkedin}`] : []),
    ];

    // Build profile response
    const profile = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${baseUrl}/companies/${company.slug}`,
      name: company.name,
      description: content?.customDescription || (company as any).description || undefined,
      image: company.coverImageUrl ? {
        '@type': 'ImageObject',
        url: company.coverImageUrl,
        name: company.name,
      } : undefined,
      logo: company.logoUrl ? {
        '@type': 'ImageObject',
        url: company.logoUrl,
        width: 200,
        height: 200,
      } : undefined,
      url: `${baseUrl}/companies/${company.slug}`,
      sameAs: socialLinks.length > 0 ? socialLinks : undefined,
      telephone: company.phone || undefined,
      email: company.email || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: company.address,
        addressLocality: company.city,
        postalCode: company.postalCode || undefined,
        addressCountry: 'FR',
      },
      foundingDate: company.createdAt.toISOString().split('T')[0],
      areaServed: company.city ? [company.city] : undefined,
      availableLanguage: ['fr', 'de', 'en'],
      aggregateRating,
      priceRange: company.subscriptionTier ? `€${company.subscriptionTier}` : undefined,
      openingHoursSpecification: company.hours
        ? (() => {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
            const specs: any[] = [];
            days.forEach((day) => {
              const dayHours = (company.hours as any)?.[day];
              if (dayHours && !dayHours.closed) {
                specs.push({
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: [day.charAt(0).toUpperCase() + day.slice(1)],
                  opens: dayHours.open,
                  closes: dayHours.close,
                });
              }
            });
            return specs.length > 0 ? specs : undefined;
          })()
        : undefined,
      keywords: [...company.categories, company.city].filter(Boolean),
      dateModified: company.updatedAt.toISOString(),
      dateCreated: company.createdAt.toISOString(),
      license: 'CC-BY-4.0',
      attributionUrl: `${baseUrl}/attribution`,
    };

    // Remove undefined fields
    const cleanedProfile = Object.fromEntries(
      Object.entries(profile).filter(([_, v]) => v !== undefined)
    );

    return NextResponse.json(cleanedProfile, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 1 hour
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Content-License': 'CC-BY-4.0',
        'Last-Modified': company.updatedAt.toUTCString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching company profile:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const revalidate = 3600; // 1 hour
