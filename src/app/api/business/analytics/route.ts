import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

const auth = () => getServerSession(authOptions);

// Get business analytics summary
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.businessOwner) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get business owner's company
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        ownerId: session.businessOwner.id,
        verified: true,
      },
      include: {
        company: {
          include: {
            analytics: {
              orderBy: { date: 'desc' },
              take: 30, // Last 30 days
            },
            reviews: {
              where: {
                isApproved: true,
              },
              select: {
                id: true,
                rating: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!ownership) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    const company = ownership.company;

    // Calculate summary statistics
    const totalViews = company.analytics.reduce(
      (sum, day) => sum + day.profileViews,
      0
    );
    const totalPhoneClicks = company.analytics.reduce(
      (sum, day) => sum + day.phoneClicks,
      0
    );
    const totalWebsiteClicks = company.analytics.reduce(
      (sum, day) => sum + day.websiteClicks,
      0
    );
    const totalDirectionClicks = company.analytics.reduce(
      (sum, day) => sum + day.directionsClicks,
      0
    );

    // Calculate trends (compare last 7 days vs previous 7 days)
    const last7Days = company.analytics.slice(0, 7);
    const previous7Days = company.analytics.slice(7, 14);

    const last7DaysViews = last7Days.reduce(
      (sum, day) => sum + day.profileViews,
      0
    );
    const previous7DaysViews = previous7Days.reduce(
      (sum, day) => sum + day.profileViews,
      0
    );

    const viewsTrend =
      previous7DaysViews > 0
        ? ((last7DaysViews - previous7DaysViews) / previous7DaysViews) * 100
        : 0;

    // Recent reviews
    const recentReviews = company.reviews
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    // Response data
    return NextResponse.json({
      success: true,
      summary: {
        totalViews,
        totalPhoneClicks,
        totalWebsiteClicks,
        totalDirectionClicks,
        viewsTrend: Math.round(viewsTrend),
        averageRating: company.rating || 0,
        totalReviews: company.reviewCount || 0,
      },
      daily: company.analytics.map((day) => ({
        date: day.date,
        views: day.profileViews,
        phoneClicks: day.phoneClicks,
        websiteClicks: day.websiteClicks,
        directionClicks: day.directionsClicks,
        searchAppearances: day.sourceSearch,
      })),
      recentReviews: recentReviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        createdAt: review.createdAt,
      })),
    });
  } catch (error) {
    logger.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

// Track view/click event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, eventType } = body;

    if (!companyId || !eventType) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: parseInt(companyId) },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    // Get today's date (YYYY-MM-DD)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update or create today's analytics record
    const updateData: any = {};

    switch (eventType) {
      case 'view':
        updateData.profileViews = { increment: 1 };
        break;
      case 'phone_click':
        updateData.phoneClicks = { increment: 1 };
        break;
      case 'website_click':
        updateData.websiteClicks = { increment: 1 };
        break;
      case 'direction_click':
        updateData.directionsClicks = { increment: 1 };
        break;
      case 'search_appearance':
        updateData.sourceSearch = { increment: 1 };
        break;
      default:
        return NextResponse.json(
          { error: 'Type d\'événement invalide' },
          { status: 400 }
        );
    }

    await prisma.companyAnalytics.upsert({
      where: {
        companyId_date: {
          companyId: company.id,
          date: today,
        },
      },
      update: updateData,
      create: {
        companyId: company.id,
        date: today,
        profileViews: eventType === 'view' ? 1 : 0,
        phoneClicks: eventType === 'phone_click' ? 1 : 0,
        websiteClicks: eventType === 'website_click' ? 1 : 0,
        directionsClicks: eventType === 'direction_click' ? 1 : 0,
        sourceSearch: eventType === 'search_appearance' ? 1 : 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Track event error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de l\'événement' },
      { status: 500 }
    );
  }
}
