import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileUser } from '@/lib/mobile-auth';
import { addDays, subDays, format } from 'date-fns';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // 7, 30, 90 days
    
    // Authenticate user
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify company ownership
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        companyId: parseInt(companyId),
        ownerId: authResult.user.userId,
      },
    });

    if (!ownership) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette entreprise' },
        { status: 403 }
      );
    }

    const days = parseInt(period);
    const startDate = subDays(new Date(), days);
    const endDate = new Date();

    // Get analytics data
    const analytics = await prisma.companyAnalytics.findMany({
      where: {
        companyId: parseInt(companyId),
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Get company basic info
    const company = await prisma.company.findUnique({
      where: { id: parseInt(companyId) },
      select: {
        name: true,
        rating: true,
        reviewCount: true,
      },
    });

    // Calculate totals and trends
    const totalViews = analytics.reduce((sum, day) => sum + day.profileViews, 0);
    const totalClicks = analytics.reduce((sum, day) => 
      sum + day.phoneClicks + day.websiteClicks + day.emailClicks + day.directionsClicks, 0
    );
    const totalUniqueVisitors = analytics.reduce((sum, day) => sum + day.uniqueVisitors, 0);

    // Calculate conversion rate
    const conversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    // Calculate trends (compare with previous period)
    const previousStartDate = subDays(startDate, days);
    const previousEndDate = startDate;
    
    const previousAnalytics = await prisma.companyAnalytics.findMany({
      where: {
        companyId: parseInt(companyId),
        date: {
          gte: previousStartDate,
          lt: previousEndDate,
        },
      },
    });

    const previousViews = previousAnalytics.reduce((sum, day) => sum + day.profileViews, 0);
    const previousClicks = previousAnalytics.reduce((sum, day) => 
      sum + day.phoneClicks + day.websiteClicks + day.emailClicks + day.directionsClicks, 0
    );

    const viewsTrend = previousViews > 0 ? ((totalViews - previousViews) / previousViews) * 100 : 0;
    const clicksTrend = previousClicks > 0 ? ((totalClicks - previousClicks) / previousClicks) * 100 : 0;

    // Format daily data for charts
    const dailyData = analytics.map(day => ({
      date: format(day.date, 'yyyy-MM-dd'),
      views: day.profileViews,
      clicks: day.phoneClicks + day.websiteClicks + day.emailClicks + day.directionsClicks,
      phoneClicks: day.phoneClicks,
      websiteClicks: day.websiteClicks,
      emailClicks: day.emailClicks,
      directionsClicks: day.directionsClicks,
      uniqueVisitors: day.uniqueVisitors,
    }));

    // Action breakdown
    const actionBreakdown = {
      phone: analytics.reduce((sum, day) => sum + day.phoneClicks, 0),
      website: analytics.reduce((sum, day) => sum + day.websiteClicks, 0),
      email: analytics.reduce((sum, day) => sum + day.emailClicks, 0),
      directions: analytics.reduce((sum, day) => sum + day.directionsClicks, 0),
    };

    // Top performing days
    const topDays = analytics
      .sort((a, b) => b.profileViews - a.profileViews)
      .slice(0, 5)
      .map(day => ({
        date: format(day.date, 'yyyy-MM-dd'),
        views: day.profileViews,
        clicks: day.phoneClicks + day.websiteClicks + day.emailClicks + day.directionsClicks,
      }));

    return NextResponse.json({
      success: true,
      company: {
        name: company?.name,
        rating: company?.rating,
        reviewCount: company?.reviewCount,
      },
      period: {
        days,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      },
      summary: {
        totalViews,
        totalClicks,
        totalUniqueVisitors,
        conversionRate: Math.round(conversionRate * 100) / 100,
        trends: {
          views: Math.round(viewsTrend * 100) / 100,
          clicks: Math.round(clicksTrend * 100) / 100,
        },
      },
      dailyData,
      actionBreakdown,
      topDays,
    });

  } catch (error) {
    logger.error('Mobile analytics error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des analytics' },
      { status: 500 }
    );
  }
}