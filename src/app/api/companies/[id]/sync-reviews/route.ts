import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Update company rating
    await prisma.company.update({
      where: { id: companyId },
      data: {
        rating: place.rating || null,
        reviewCount: place.user_ratings_total || 0,
      },
    });

    // Delete existing Google reviews for this company
    await prisma.review.deleteMany({
      where: {
        companyId,
        source: 'google',
      },
    });

    // Create new reviews
    const createdReviews = [];
    for (const review of googleReviews) {
      const created = await prisma.review.create({
        data: {
          companyId,
          authorName: review.author_name,
          authorPhoto: review.profile_photo_url || null,
          rating: review.rating,
          comment: review.comment || '',
          source: 'google',
          reviewDate: new Date(review.time * 1000),
        },
      });
      createdReviews.push(created);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${createdReviews.length} reviews from Google`,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      reviews: createdReviews,
    });
  } catch (error) {
    console.error('Error syncing reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

