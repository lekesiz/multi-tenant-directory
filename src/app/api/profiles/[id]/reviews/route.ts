import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * Company Reviews JSON API
 * Returns aggregated reviews in schema.org Review format
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
        reviews: {
          where: { isApproved: true },
          orderBy: { reviewDate: 'desc' },
          take: 50,
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Format reviews
    const reviews = company.reviews.map((review) => ({
      '@type': 'Review',
      '@id': `${baseUrl}/reviews/${review.id}`,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment || 'No comment provided',
      author: {
        '@type': 'Person',
        name: review.authorName,
        image: review.authorPhoto || undefined,
      },
      datePublished: review.reviewDate.toISOString(),
      source: review.source,
      inLanguage: 'fr',
    }));

    const response = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${baseUrl}/api/profiles/${id}/reviews`,
      name: `Reviews for ${company.name}`,
      description: `${company.reviews.length} reviews for ${company.name}`,
      itemListElement: reviews,
      totalResults: company.reviews.length,
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
        'Cache-Control': 'public, max-age=1800', // 30 minutes
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Content-License': 'CC-BY-4.0',
      },
    });
  } catch (error) {
    logger.error('Error fetching reviews:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const revalidate = 1800; // 30 minutes
