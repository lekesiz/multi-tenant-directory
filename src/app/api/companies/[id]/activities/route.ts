import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { enhanceActivityWithMetadata, incrementActivityViews } from '@/lib/activity-helpers';
import { ActivitiesListResponse, ActivityType, ActivityStatus } from '@/types/activity';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/companies/[id]/activities
 * Public feed of published activities for a company
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
    }

    // Verify company exists and is active
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isActive: true,
      },
    });

    if (!company || !company.isActive) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 per page
    const type = searchParams.get('type') as ActivityType | null;
    const tags = searchParams.getAll('tags');
    const search = searchParams.get('search');

    // Build where clause - only show published activities
    const where: any = {
      companyId,
      status: 'published',
      // Only show non-expired activities
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };

    if (type) {
      where.type = type;
    }

    if (tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.activity.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Fetch activities
    const activities = await prisma.activity.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        type: true,
        postType: true,
        status: true,
        imageUrl: true,
        imageCaption: true,
        videoUrl: true,
        videoThumbnail: true,
        mediaUrls: true,
        tags: true,
        category: true,
        views: true,
        likes: true,
        shares: true,
        comments: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        publishedAt: true,
        authorName: true,
        createdAt: true,
        updatedAt: true,
        companyId: true,
        sharedOn: true,
        aiGenerated: true,
        aiModel: true,
        // Don't expose sensitive fields
        authorId: false,
        aiPrompt: false,
        scheduledFor: false,
        expiresAt: false,
      } as any,
    });

    // Enhance with metadata and company info
    const enhancedActivities = await Promise.all(
      activities.map((a) => enhanceActivityWithMetadata(a as any, false))
    );

    // Add company info to each activity
    enhancedActivities.forEach((activity) => {
      activity.company = {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
      };
    });

    const response: ActivitiesListResponse = {
      activities: enhancedActivities,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      success: true,
    };

    // Set cache headers (cache for 5 minutes)
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return NextResponse.json(response, { headers });
  } catch (error) {
    logger.error('Error fetching public activities:', error);
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
 * POST /api/companies/[id]/activities/[activityId]/view
 * Increment view count for an activity (could be a separate endpoint)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
    }

    const body = await req.json();
    const { activityId } = body;

    if (!activityId) {
      return NextResponse.json({ error: 'Activity ID required' }, { status: 400 });
    }

    // Verify activity belongs to company and is published
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        companyId,
        status: 'published',
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Increment view count
    await incrementActivityViews(activityId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error incrementing activity views:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
