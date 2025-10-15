import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const unsubscribeSchema = z.object({
  token: z.string(),
  type: z.enum(['all', 'newReview', 'reviewReply', 'weeklyDigest', 'marketing']).optional(),
});

// Handle unsubscribe via GET (from email links)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const type = searchParams.get('type') || 'all';

    if (!token) {
      return NextResponse.redirect(
        new URL('/unsubscribe/error', request.url)
      );
    }

    // Find business owner by unsubscribe token
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!businessOwner) {
      return NextResponse.redirect(
        new URL('/unsubscribe/error', request.url)
      );
    }

    // Update preferences based on type
    const updateData: any = {};
    switch (type) {
      case 'newReview':
        updateData.emailNewReview = false;
        break;
      case 'reviewReply':
        updateData.emailReviewReply = false;
        break;
      case 'weeklyDigest':
        updateData.emailWeeklyDigest = false;
        break;
      case 'marketing':
        updateData.emailMarketing = false;
        break;
      case 'all':
      default:
        updateData.emailNewReview = false;
        updateData.emailReviewReply = false;
        updateData.emailWeeklyDigest = false;
        updateData.emailMarketing = false;
        break;
    }

    await prisma.businessOwner.update({
      where: { id: businessOwner.id },
      data: updateData,
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/unsubscribe/success?type=${type}`, request.url)
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.redirect(
      new URL('/unsubscribe/error', request.url)
    );
  }
}

// Handle unsubscribe via POST (from dashboard)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = unsubscribeSchema.parse(body);

    // Find business owner by unsubscribe token
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { unsubscribeToken: validatedData.token },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 404 }
      );
    }

    // Update preferences based on type
    const updateData: any = {};
    switch (validatedData.type) {
      case 'newReview':
        updateData.emailNewReview = false;
        break;
      case 'reviewReply':
        updateData.emailReviewReply = false;
        break;
      case 'weeklyDigest':
        updateData.emailWeeklyDigest = false;
        break;
      case 'marketing':
        updateData.emailMarketing = false;
        break;
      case 'all':
      default:
        updateData.emailNewReview = false;
        updateData.emailReviewReply = false;
        updateData.emailWeeklyDigest = false;
        updateData.emailMarketing = false;
        break;
    }

    const updatedOwner = await prisma.businessOwner.update({
      where: { id: businessOwner.id },
      data: updateData,
      select: {
        email: true,
        emailNewReview: true,
        emailReviewReply: true,
        emailWeeklyDigest: true,
        emailMarketing: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Préférences mises à jour',
      preferences: updatedOwner,
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la désinscription' },
      { status: 500 }
    );
  }
}