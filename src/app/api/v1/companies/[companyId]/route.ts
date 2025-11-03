import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { ApiKeyService, RateLimitService, ApiAnalyticsService } from '@/lib/api-ecosystem';
import { prisma } from '@/lib/prisma';

// Middleware to validate API key and check rate limits
async function validateApiRequest(request: Request) {
  const apiKey = request.headers.get('X-API-Key');
  const userAgent = request.headers.get('User-Agent');
  const forwarded = request.headers.get('X-Forwarded-For');
  const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('X-Real-IP') || 'unknown';

  if (!apiKey) {
    return {
      error: 'API key required. Include X-API-Key header.',
      status: 401,
    };
  }

  const validation = await ApiKeyService.validateApiKey(apiKey);
  if (!validation) {
    return {
      error: 'Invalid or revoked API key',
      status: 401,
    };
  }

  // Check rate limit
  const rateLimit = await RateLimitService.checkRateLimit(apiKey);
  if (!rateLimit.allowed) {
    return {
      error: 'Rate limit exceeded',
      status: 429,
      headers: {
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      },
    };
  }

  return {
    businessOwnerId: validation.businessOwnerId,
    permissions: validation.permissions,
    rateLimit,
    userAgent,
    ipAddress,
  };
}

// GET /api/v1/companies/[companyId] - Get company by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const startTime = Date.now();
  let businessOwnerId = '';
  let statusCode = 200;

  try {
    const validation = await validateApiRequest(request);
    const { companyId } = await params;
    
    if ('error' in validation) {
      statusCode = validation.status || 401;
      const response = NextResponse.json({ error: validation.error }, { status: validation.status || 401 });
      
      if (validation.headers) {
        Object.entries(validation.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }
      
      return response;
    }

    businessOwnerId = validation.businessOwnerId;

    // Check read permission
    if (!validation.permissions.includes('read')) {
      statusCode = 403;
      return NextResponse.json(
        { error: 'Insufficient permissions. Read access required.' },
        { status: 403 }
      );
    }

    // Get company with related data
    const company = await prisma.company.findUnique({
      where: { id: parseInt(companyId) },
      include: {
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            authorName: true,
            rating: true,
            comment: true,
            reviewDate: true,
            isVerified: true,
            helpfulCount: true,
            reply: {
              select: {
                content: true,
                createdAt: true,
              }
            }
          }
        },
        photos: {
          take: 10,
          orderBy: { order: 'asc' },
          select: {
            id: true,
            url: true,
            thumbnail: true,
            caption: true,
            type: true,
          }
        },
        hours: {
          select: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
            specialHours: true,
            timezone: true,
          }
        },
        analytics: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          select: {
            date: true,
            profileViews: true,
            phoneClicks: true,
            websiteClicks: true,
            emailClicks: true,
            directionsClicks: true,
          }
        }
      }
    });

    if (!company) {
      statusCode = 404;
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Calculate analytics summary
    const analyticsSum = company.analytics.reduce((acc, day) => ({
      totalViews: acc.totalViews + day.profileViews,
      totalPhoneClicks: acc.totalPhoneClicks + day.phoneClicks,
      totalWebsiteClicks: acc.totalWebsiteClicks + day.websiteClicks,
      totalEmailClicks: acc.totalEmailClicks + day.emailClicks,
      totalDirectionsClicks: acc.totalDirectionsClicks + day.directionsClicks,
    }), {
      totalViews: 0,
      totalPhoneClicks: 0,
      totalWebsiteClicks: 0,
      totalEmailClicks: 0,
      totalDirectionsClicks: 0,
    });

    const response = NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        address: company.address,
        city: company.city,
        postalCode: company.postalCode,
        phone: company.phone,
        email: company.email,
        website: company.website,
        latitude: company.latitude,
        longitude: company.longitude,
        categories: company.categories,
        logoUrl: company.logoUrl,
        coverImageUrl: company.coverImageUrl,
        rating: company.rating,
        reviewCount: company.reviewCount,
        businessHours: company.hours,
        recentReviews: company.reviews,
        photos: company.photos,
        analytics: analyticsSum,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      }
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '1000');
    response.headers.set('X-RateLimit-Remaining', validation.rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', validation.rateLimit.resetTime.toString());

    return response;

  } catch (error) {
    logger.error('API v1 company detail error:', error);
    statusCode = 500;
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );

  } finally {
    // Record API usage
    if (businessOwnerId) {
      const responseTime = Date.now() - startTime;
      await ApiAnalyticsService.recordApiRequest({
        businessOwnerId,
        endpoint: `/api/v1/companies/${(await params).companyId}`,
        method: 'GET',
        statusCode,
        responseTime,
        userAgent: request.headers.get('User-Agent') || undefined,
        ipAddress: request.headers.get('X-Forwarded-For')?.split(',')[0] || 
                  request.headers.get('X-Real-IP') || 
                  undefined,
      });
    }
  }
}