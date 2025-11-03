import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { translateToFrench } from '@/lib/translation';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    // Get company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (!company.googlePlaceId) {
      return NextResponse.json(
        {
          error: 'Google Place ID manquant',
          message: 'Cette entreprise n\'est pas encore liée à Google Maps. Veuillez d\'abord ajouter un Google Place ID dans les paramètres de l\'entreprise.',
          needsPlaceId: true
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Fetch place details from Google
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${company.googlePlaceId}&fields=rating,user_ratings_total,reviews&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: `Google API error: ${data.status}` },
        { status: 500 }
      );
    }

    const place = data.result;
    const googleReviews = place.reviews || [];

    // Update company rating and last sync time
    await prisma.company.update({
      where: { id: companyId },
      data: {
        rating: place.rating || null,
        reviewCount: place.user_ratings_total || 0,
        lastSyncedAt: new Date(),
      },
    });

    // Sync reviews with translation and deduplication
    let reviewsAdded = 0;
    let reviewsUpdated = 0;

    for (const googleReview of googleReviews) {
      if (!googleReview.text?.trim()) {
        continue; // Skip reviews without text
      }

      // Check if review already exists
      const existingReview = await prisma.review.findFirst({
        where: {
          companyId,
          authorName: googleReview.author_name,
          source: 'google',
          reviewDate: new Date(googleReview.time * 1000),
        },
      });

      // Detect language and translate if needed
      const detectedLanguage = googleReview.language || 'fr';
      const shouldTranslate = detectedLanguage !== 'fr' && detectedLanguage !== 'de';

      let commentFrench = googleReview.text;
      if (shouldTranslate) {
        try {
          commentFrench = await translateToFrench(googleReview.text, detectedLanguage);
        } catch (error) {
          logger.error('Translation error, using original text:', error);
          commentFrench = googleReview.text;
        }
      }

      if (!existingReview) {
        // Create new review
        await prisma.review.create({
          data: {
            companyId,
            authorName: googleReview.author_name,
            authorPhoto: googleReview.profile_photo_url || null,
            rating: googleReview.rating,
            comment: googleReview.text,
            commentFr: commentFrench,
            originalLanguage: detectedLanguage,
            source: 'google',
            reviewDate: new Date(googleReview.time * 1000),
            isApproved: true,
            isActive: true,
          },
        });
        reviewsAdded++;
      } else if (!existingReview.commentFr || existingReview.comment !== googleReview.text) {
        // Update existing review if text changed or translation missing
        await prisma.review.update({
          where: { id: existingReview.id },
          data: {
            comment: googleReview.text,
            commentFr: commentFrench,
            originalLanguage: detectedLanguage,
            rating: googleReview.rating,
          },
        });
        reviewsUpdated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced reviews: ${reviewsAdded} new, ${reviewsUpdated} updated`,
      reviewsAdded,
      reviewsUpdated,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
    });
  } catch (error) {
    logger.error('Error syncing reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

