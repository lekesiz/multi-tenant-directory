import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authBusinessOptions } from '@/lib/auth-business';
import { z } from 'zod';

// Date range schema
const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period: z.enum(['day', 'week', 'month']).default('day'),
});

// GET analytics data
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authBusinessOptions);
    if (!session || session.user.role !== 'business_owner') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    // Check ownership
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        companyId,
        ownerId: session.user.id,
      },
    });

    if (!ownership) {
      return NextResponse.json(
        { error: 'You do not have permission to view analytics for this company' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      startDate: searchParams.get('startDate') || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      endDate: searchParams.get('endDate') || new Date().toISOString().split('T')[0],
      period: searchParams.get('period') || 'day',
    };

    const validatedParams = dateRangeSchema.parse(params);

    // Fetch analytics data
    const analytics = await prisma.companyAnalytics.findMany({
      where: {
        companyId,
        date: {
          gte: new Date(validatedParams.startDate),
          lte: new Date(validatedParams.endDate),
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate totals
    const totals = analytics.reduce(
      (acc, day) => ({
        profileViews: acc.profileViews + day.profileViews,
        uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
        phoneClicks: acc.phoneClicks + day.phoneClicks,
        websiteClicks: acc.websiteClicks + day.websiteClicks,
        emailClicks: acc.emailClicks + day.emailClicks,
        directionsClicks: acc.directionsClicks + day.directionsClicks,
      }),
      {
        profileViews: 0,
        uniqueVisitors: 0,
        phoneClicks: 0,
        websiteClicks: 0,
        emailClicks: 0,
        directionsClicks: 0,
      }
    );

    // Group by period if needed
    let groupedData = analytics;
    if (validatedParams.period !== 'day') {
      // TODO: Implement weekly/monthly grouping
    }

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
      where: {
        companyId,
        createdAt: {
          gte: new Date(validatedParams.startDate),
          lte: new Date(validatedParams.endDate),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    return NextResponse.json({
      analytics: groupedData,
      totals,
      recentReviews,
      period: validatedParams,
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid date range', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// POST track analytics event
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { event, source = 'organic' } = body;

    // Validate event type
    const validEvents = ['view', 'phone', 'website', 'email', 'directions'];
    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's analytics record
    const analytics = await prisma.companyAnalytics.upsert({
      where: {
        companyId_date: {
          companyId,
          date: today,
        },
      },
      create: {
        companyId,
        date: today,
      },
      update: {},
    });

    // Update the appropriate counter
    const updateData: any = {};
    switch (event) {
      case 'view':
        updateData.profileViews = { increment: 1 };
        // TODO: Track unique visitors using cookies/session
        updateData.uniqueVisitors = { increment: 1 };
        break;
      case 'phone':
        updateData.phoneClicks = { increment: 1 };
        break;
      case 'website':
        updateData.websiteClicks = { increment: 1 };
        break;
      case 'email':
        updateData.emailClicks = { increment: 1 };
        break;
      case 'directions':
        updateData.directionsClicks = { increment: 1 };
        break;
    }

    // Update source metrics
    switch (source) {
      case 'search':
        updateData.sourceSearch = { increment: 1 };
        break;
      case 'direct':
        updateData.sourceDirect = { increment: 1 };
        break;
      case 'referral':
        updateData.sourceReferral = { increment: 1 };
        break;
      default:
        updateData.sourceOrganic = { increment: 1 };
    }

    await prisma.companyAnalytics.update({
      where: { id: analytics.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Event '${event}' tracked successfully`,
    });
  } catch (error) {
    logger.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics event' },
      { status: 500 }
    );
  }
}