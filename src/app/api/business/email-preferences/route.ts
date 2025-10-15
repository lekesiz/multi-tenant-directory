import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

// Validation schema
const preferencesSchema = z.object({
  emailNewReview: z.boolean().optional(),
  emailReviewReply: z.boolean().optional(),
  emailWeeklyDigest: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
});

// Get email preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.businessOwner) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const businessOwner = await prisma.businessOwner.findUnique({
      where: { id: session.businessOwner.id },
      select: {
        emailNewReview: true,
        emailReviewReply: true,
        emailWeeklyDigest: true,
        emailMarketing: true,
      },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      preferences: businessOwner,
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des préférences' },
      { status: 500 }
    );
  }
}

// Update email preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.businessOwner) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Validate input
    const body = await request.json();
    const validatedData = preferencesSchema.parse(body);

    // Update preferences
    const updatedOwner = await prisma.businessOwner.update({
      where: { id: session.businessOwner.id },
      data: validatedData,
      select: {
        emailNewReview: true,
        emailReviewReply: true,
        emailWeeklyDigest: true,
        emailMarketing: true,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: updatedOwner,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des préférences' },
      { status: 500 }
    );
  }
}