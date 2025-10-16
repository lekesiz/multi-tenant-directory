import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const voteSchema = z.object({
  isHelpful: z.boolean(),
});

// Vote on a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId: reviewIdParam } = await params;
    const reviewId = parseInt(reviewIdParam);
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'ID de review invalide' },
        { status: 400 }
      );
    }

    // Get voter IP and session
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const sessionId = request.cookies.get('sessionId')?.value || null;

    // Validate input
    const body = await request.json();
    const validatedData = voteSchema.parse(body);

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review non trouvée' },
        { status: 404 }
      );
    }

    // Check if user already voted
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_voterIp: {
          reviewId,
          voterIp: ip,
        },
      },
    });

    if (existingVote) {
      // Update existing vote if different
      if (existingVote.isHelpful !== validatedData.isHelpful) {
        await prisma.reviewVote.update({
          where: { id: existingVote.id },
          data: {
            isHelpful: validatedData.isHelpful,
            voterSession: sessionId,
          },
        });

        // Update helpful count
        const helpfulVotes = await prisma.reviewVote.count({
          where: {
            reviewId,
            isHelpful: true,
          },
        });

        await prisma.review.update({
          where: { id: reviewId },
          data: { helpfulCount: helpfulVotes },
        });

        return NextResponse.json({
          success: true,
          message: 'Vote mis à jour',
          helpfulCount: helpfulVotes,
        });
      } else {
        return NextResponse.json(
          { error: 'Vous avez déjà voté pour cette review' },
          { status: 400 }
        );
      }
    }

    // Create new vote
    await prisma.reviewVote.create({
      data: {
        reviewId,
        voterIp: ip,
        voterSession: sessionId,
        isHelpful: validatedData.isHelpful,
      },
    });

    // Update helpful count
    const helpfulVotes = await prisma.reviewVote.count({
      where: {
        reviewId,
        isHelpful: true,
      },
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: helpfulVotes },
    });

    return NextResponse.json({
      success: true,
      message: 'Vote enregistré',
      helpfulCount: helpfulVotes,
    });
  } catch (error) {
    console.error('Vote error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors du vote' },
      { status: 500 }
    );
  }
}

// Get vote status for current user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId: reviewIdParam } = await params;
    const reviewId = parseInt(reviewIdParam);
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'ID de review invalide' },
        { status: 400 }
      );
    }

    // Get voter IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check if user voted
    const vote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_voterIp: {
          reviewId,
          voterIp: ip,
        },
      },
    });

    // Get helpful count
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { helpfulCount: true },
    });

    return NextResponse.json({
      hasVoted: !!vote,
      isHelpful: vote?.isHelpful || null,
      helpfulCount: review?.helpfulCount || 0,
    });
  } catch (error) {
    console.error('Get vote error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du vote' },
      { status: 500 }
    );
  }
}