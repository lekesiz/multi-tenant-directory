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

// GET /api/v1/companies - List companies
export async function GET(request: Request) {
  const startTime = Date.now();
  let businessOwnerId = '';
  let statusCode = 200;

  try {
    const validation = await validateApiRequest(request);
    
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
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check read permission
    if (!validation.permissions.includes('read')) {
      statusCode = 403;
      return NextResponse.json(
        { error: 'Insufficient permissions. Read access required.' },
        { status: 403 }
      );
    }

    // Build where clause
    const where: any = {};
    
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    if (category) {
      where.categories = { has: category };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get companies
    const companies = await prisma.company.findMany({
      where,
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
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { rating: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.company.count({ where });

    const response = NextResponse.json({
      companies,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '1000');
    response.headers.set('X-RateLimit-Remaining', validation.rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', validation.rateLimit.resetTime.toString());

    return response;

  } catch (error) {
    console.error('API v1 companies error:', error);
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
        endpoint: '/api/v1/companies',
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