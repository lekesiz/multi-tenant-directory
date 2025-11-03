import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { z } from 'zod';
import { sendReviewAlertEmail } from '@/lib/emails/send';

// Validation schema
const reviewSchema = z.object({
  companyId: z.number().int().positive(),
  authorName: z.string().min(2).max(100),
  authorEmail: z.string().email().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(2000).optional(),
});

// Submit a new review
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract text fields
    const companyId = parseInt(formData.get('companyId') as string);
    const authorName = formData.get('authorName') as string;
    const authorEmail = formData.get('authorEmail') as string;
    const rating = parseInt(formData.get('rating') as string);
    const comment = formData.get('comment') as string;

    // Validate basic fields
    const validatedData = reviewSchema.parse({
      companyId,
      authorName,
      authorEmail: authorEmail || undefined,
      rating,
      comment: comment || undefined,
    });

    // Verify company exists and get business owners
    const company = await prisma.company.findUnique({
      where: { id: validatedData.companyId },
      include: {
        ownerships: {
          where: { verified: true },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                emailNewReview: true,
                unsubscribeToken: true,
              },
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

    // Handle photo uploads (max 5)
    const photoUrls: string[] = [];
    const photoFiles: File[] = [];

    // Collect photo files
    for (let i = 0; i < 5; i++) {
      const photo = formData.get(`photo${i}`) as File | null;
      if (photo && photo.size > 0) {
        // Validate file type
        if (!photo.type.startsWith('image/')) {
          return NextResponse.json(
            { error: `Photo ${i + 1} doit être une image` },
            { status: 400 }
          );
        }

        // Validate file size (max 5MB)
        if (photo.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: `Photo ${i + 1} dépasse 5MB` },
            { status: 400 }
          );
        }

        photoFiles.push(photo);
      }
    }

    // Upload photos to Vercel Blob
    for (const photo of photoFiles) {
      try {
        const blob = await put(`reviews/${Date.now()}-${photo.name}`, photo, {
          access: 'public',
          addRandomSuffix: true,
        });
        photoUrls.push(blob.url);
      } catch (uploadError) {
        logger.error('Photo upload error:', uploadError);
        // Continue without this photo
      }
    }

    // Create review (pending approval by default)
    const review = await prisma.review.create({
      data: {
        companyId: validatedData.companyId,
        authorName: validatedData.authorName,
        authorEmail: validatedData.authorEmail,
        rating: validatedData.rating,
        comment: validatedData.comment,
        photos: photoUrls,
        source: 'manual',
        isApproved: false, // Requires admin approval
      },
    });

    // Send notification emails to business owners
    const emailPromises = company.ownerships
      .filter((ownership) => ownership.owner.emailNewReview) // Only send to those who opted in
      .map((ownership) => {
        return sendReviewAlertEmail({
          businessOwnerName: `${ownership.owner.firstName || ''} ${ownership.owner.lastName || ''}`.trim() || undefined,
          companyName: company.name,
          companySlug: company.slug,
          reviewAuthor: validatedData.authorName,
          reviewRating: validatedData.rating,
          reviewComment: validatedData.comment,
          reviewDate: new Date(),
          reviewId: review.id,
          unsubscribeToken: ownership.owner.unsubscribeToken,
        }).catch((error) => {
          logger.error('Failed to send review notification email:', error);
          // Don't throw, continue with other emails
        });
      });

    // Send emails in parallel but don't wait for them
    Promise.all(emailPromises).catch((error) => {
      logger.error('Error sending review notification emails:', error);
    });

    return NextResponse.json({
      success: true,
      message:
        'Merci pour votre avis ! Il sera publié après validation par notre équipe.',
      review: {
        id: review.id,
        rating: review.rating,
        photoCount: photoUrls.length,
      },
    });
  } catch (error) {
    logger.error('Submit review error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la soumission de l\'avis' },
      { status: 500 }
    );
  }
}
