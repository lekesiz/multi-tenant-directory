import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const reportSchema = z.object({
  reason: z.enum(['spam', 'offensive', 'fake', 'other']),
  description: z.string().max(500).optional(),
});

// Report a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const reviewId = parseInt(params.reviewId);
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'ID de review invalide' },
        { status: 400 }
      );
    }

    // Get reporter IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Validate input
    const body = await request.json();
    const validatedData = reportSchema.parse(body);

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

    // Check if user already reported this review
    const existingReport = await prisma.reviewReport.findFirst({
      where: {
        reviewId,
        reporterIp: ip,
        status: 'pending',
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'Vous avez déjà signalé cette review' },
        { status: 400 }
      );
    }

    // Create report
    const report = await prisma.reviewReport.create({
      data: {
        reviewId,
        reporterIp: ip,
        reason: validatedData.reason,
        description: validatedData.description,
      },
    });

    // Check if review should be auto-hidden based on report count
    const reportCount = await prisma.reviewReport.count({
      where: {
        reviewId,
        status: 'pending',
      },
    });

    // Auto-hide if 5 or more reports
    if (reportCount >= 5) {
      await prisma.review.update({
        where: { id: reviewId },
        data: { isApproved: false },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Signalement enregistré',
    });
  } catch (error) {
    console.error('Report error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors du signalement' },
      { status: 500 }
    );
  }
}

// Get report reasons for UI
export async function GET() {
  return NextResponse.json({
    reasons: [
      { value: 'spam', label: 'Spam ou publicité' },
      { value: 'offensive', label: 'Contenu offensant ou inapproprié' },
      { value: 'fake', label: 'Faux avis' },
      { value: 'other', label: 'Autre raison' },
    ],
  });
}