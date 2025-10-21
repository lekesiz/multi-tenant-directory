import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

const auth = () => getServerSession(authOptions);

// Verify or unverify a review
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    // Check auth
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { reviewId: reviewIdParam } = await params;
    const reviewId = parseInt(reviewIdParam);
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'ID de review invalide' },
        { status: 400 }
      );
    }

    // Check if review exists and belongs to a company owned by the business owner
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        company: {
          ownerships: {
            some: {
              ownerId: session.user.id,
              verified: true,
            },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    // Toggle verification status
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        isVerified: !review.isVerified,
        verifiedAt: !review.isVerified ? new Date() : null,
        verifiedBy: !review.isVerified ? session.user.id : null,
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview.id,
        isVerified: updatedReview.isVerified,
        verifiedAt: updatedReview.verifiedAt,
      },
    });
  } catch (error) {
    logger.error('Verify review error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}