import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

const auth = () => getServerSession(authOptions);

// Approve or reject a review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! },
    });

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - Admin requis' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reviewId, action, reason } = body;

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide' },
        { status: 400 }
      );
    }

    // Get review
    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
      include: {
        company: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Approve review
      const updatedReview = await prisma.review.update({
        where: { id: review.id },
        data: {
          isApproved: true,
        },
      });

      // Update company rating and review count
      const approvedReviews = await prisma.review.findMany({
        where: {
          companyId: review.companyId,
          isApproved: true,
        },
        select: {
          rating: true,
        },
      });

      const avgRating =
        approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
        approvedReviews.length;

      await prisma.company.update({
        where: { id: review.companyId },
        data: {
          rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
          reviewCount: approvedReviews.length,
        },
      });

      // TODO: Send notification email to reviewer
      // TODO: Send notification to business owner

      return NextResponse.json({
        success: true,
        message: 'Avis approuvé et publié',
        review: updatedReview,
      });
    } else {
      // Reject review
      await prisma.review.update({
        where: { id: review.id },
        data: {
          isApproved: false,
        },
      });

      // TODO: Send notification email to reviewer with reason

      return NextResponse.json({
        success: true,
        message: 'Avis rejeté',
        reason: reason || 'Non conforme aux règles de la plateforme',
      });
    }
  } catch (error) {
    console.error('Moderate review error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modération' },
      { status: 500 }
    );
  }
}

// Get pending reviews
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! },
    });

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - Admin requis' },
        { status: 403 }
      );
    }

    // Get pending reviews
    const pendingReviews = await prisma.review.findMany({
      where: {
        isApproved: false,
        source: 'manual', // Only manual reviews need moderation
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      count: pendingReviews.length,
      reviews: pendingReviews.map((review) => ({
        id: review.id,
        authorName: review.authorName,
        authorEmail: review.authorEmail,
        rating: review.rating,
        comment: review.comment,
        photos: review.photos,
        createdAt: review.createdAt,
        company: {
          id: review.company.id,
          name: review.company.name,
          slug: review.company.slug,
          city: review.company.city,
        },
      })),
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}
