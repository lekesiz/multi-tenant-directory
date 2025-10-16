import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileUser } from '@/lib/mobile-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    
    // Authenticate user
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get detailed company information
    const company = await prisma.company.findUnique({
      where: { id: parseInt(companyId) },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            reply: true,
          },
        },
        hours: true,
        photos: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        analytics: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: { date: 'desc' },
        },
        coupons: {
          where: {
            isActive: true,
            validUntil: {
              gt: new Date(),
            },
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    // Check if user owns this company
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        companyId: company.id,
        ownerId: authResult.user.userId,
      },
    });

    if (!ownership) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette entreprise' },
        { status: 403 }
      );
    }

    // Calculate analytics summary
    const totalViews = company.analytics.reduce((sum, day) => sum + day.profileViews, 0);
    const totalClicks = company.analytics.reduce((sum, day) => 
      sum + day.phoneClicks + day.websiteClicks + day.emailClicks + day.directionsClicks, 0
    );
    const avgRating = company.rating || 0;
    const reviewCount = company.reviewCount || 0;

    // Format response for mobile app
    const mobileCompanyData = {
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
      rating: avgRating,
      reviewCount,
      
      // Analytics summary
      analytics: {
        totalViews,
        totalClicks,
        conversionRate: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0',
        last30Days: company.analytics.slice(0, 30),
      },
      
      // Recent reviews
      recentReviews: company.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        content: review.content,
        authorName: review.authorName,
        createdAt: review.createdAt,
        hasReply: !!review.reply,
        replyContent: review.reply?.content,
      })),
      
      // Business hours
      businessHours: company.hours ? {
        monday: company.hours.monday,
        tuesday: company.hours.tuesday,
        wednesday: company.hours.wednesday,
        thursday: company.hours.thursday,
        friday: company.hours.friday,
        saturday: company.hours.saturday,
        sunday: company.hours.sunday,
      } : null,
      
      // Photos
      photos: company.photos.map(photo => ({
        id: photo.id,
        url: photo.url,
        caption: photo.caption,
        isPrimary: photo.isPrimary,
      })),
      
      // Active coupons
      activeCoupons: company.coupons.map(coupon => ({
        id: coupon.id,
        title: coupon.title,
        description: coupon.description,
        discount: coupon.discount,
        code: coupon.code,
        expiresAt: coupon.validUntil,
      })),
    };

    return NextResponse.json({
      success: true,
      company: mobileCompanyData,
    });

  } catch (error) {
    console.error('Mobile company details error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des détails de l\'entreprise' },
      { status: 500 }
    );
  }
}