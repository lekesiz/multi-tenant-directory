import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { createActivitySchema, listActivitiesQuerySchema } from '@/lib/validations/activity';
import {
  getBusinessOwnerCompanyId,
  generateUniqueSlug,
  checkActivityRateLimit,
  enhanceActivityWithMetadata,
} from '@/lib/activity-helpers';
import { ActivitiesListResponse, ActivityResponse } from '@/types/activity';

/**
 * POST /api/business/activities
 * Create a new activity
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business owner's company
    const companyId = await getBusinessOwnerCompanyId(session.user.id);
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get subscription tier
    const owner = await prisma.businessOwner.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    });

    // Check rate limits
    const rateLimit = await checkActivityRateLimit(
      session.user.id,
      owner?.subscriptionTier || 'free'
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = createActivitySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Generate unique slug
    const slug = await generateUniqueSlug(data.title, companyId);

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        companyId,
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        type: data.type,
        status: data.status || 'draft',
        featuredImage: data.imageUrl || null,
        images: data.mediaUrls || [],
        videoUrl: data.videoUrl || null,
        tags: data.tags || [],
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.excerpt,
        keywords: data.metaKeywords || [],
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        publishedAt: data.status === 'published' ? new Date() : null,
      },
    });

    const enhanced = await enhanceActivityWithMetadata(activity, true);

    const response: ActivityResponse = {
      activity: enhanced,
      success: true,
      message: 'Activity created successfully',
    };

    logger.info('Activity created', {
      activityId: activity.id,
      companyId,
      userId: session.user.id,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('Error creating activity:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/business/activities
 * List activities for business owner
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business owner's company
    const companyId = await getBusinessOwnerCompanyId(session.user.id);
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      companyId,
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      search: searchParams.get('search') || undefined,
      tags: searchParams.getAll('tags'),
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const validation = listActivitiesQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          issues: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const query = validation.data;

    // Build where clause
    const where: any = {
      companyId: query.companyId,
    };

    if (query.status) {
      where.status = { in: query.status };
    }

    if (query.type) {
      where.type = { in: query.type };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tags && query.tags.length > 0) {
      where.tags = { hasSome: query.tags };
    }

    if (query.startDate) {
      where.createdAt = { gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(query.endDate),
      };
    }

    // Get total count
    const total = await prisma.activity.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(total / query.limit);
    const skip = (query.page - 1) * query.limit;

    // Fetch activities
    const activities = await prisma.activity.findMany({
      where,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip,
      take: query.limit,
    });

    // Enhance with metadata
    const enhancedActivities = await Promise.all(
      activities.map((a) => enhanceActivityWithMetadata(a, true))
    );

    const response: ActivitiesListResponse = {
      activities: enhancedActivities,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error listing activities:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
