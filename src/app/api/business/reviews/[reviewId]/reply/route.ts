import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

const auth = () => getServerSession(authOptions);
import { z } from 'zod';

// Validation schema
const replySchema = z.object({
  content: z.string().min(10).max(1000),
});

// Create or update review reply
export async function POST(
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

    // Validate input
    const body = await request.json();
    const validatedData = replySchema.parse(body);

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
      include: {
        reply: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    // Create or update reply
    if (review.reply) {
      // Update existing reply
      const updatedReply = await prisma.reviewReply.update({
        where: { id: review.reply.id },
        data: {
          content: validatedData.content,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        reply: updatedReply,
      });
    } else {
      // Create new reply
      const newReply = await prisma.reviewReply.create({
        data: {
          reviewId,
          ownerId: session.user.id,
          content: validatedData.content,
        },
      });

      // TODO: Send email notification to reviewer if email is available
      // This would require storing reviewer email in the Review model

      return NextResponse.json({
        success: true,
        reply: newReply,
      });
    }
  } catch (error) {
    console.error('Review reply error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la réponse à la review' },
      { status: 500 }
    );
  }
}

// Delete review reply
export async function DELETE(
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

    // Check if reply exists and belongs to the business owner
    const reply = await prisma.reviewReply.findFirst({
      where: {
        reviewId,
        ownerId: session.user.id,
      },
    });

    if (!reply) {
      return NextResponse.json(
        { error: 'Réponse non trouvée' },
        { status: 404 }
      );
    }

    // Delete the reply
    await prisma.reviewReply.delete({
      where: { id: reply.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Réponse supprimée',
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}