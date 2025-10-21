import { logger } from '@/lib/logger';
import { PrismaClient } from '@prisma/client';
import { translateToFrench, detectLanguage } from './translation';

const prisma = new PrismaClient();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  reviews?: GoogleReview[];
  opening_hours?: {
    periods: any[];
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

interface GoogleReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface RatingDistribution {
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

/**
 * Search for a place by name and address
 */
export async function searchPlace(
  name: string,
  address?: string
): Promise<PlaceSearchResult | null> {
  try {
    const query = address ? `${name}, ${address}` : name;
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      query
    )}&inputtype=textquery&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
      return data.candidates[0];
    }

    return null;
  } catch (error) {
    logger.error('Error searching place:', error);
    return null;
  }
}

/**
 * Get place details including reviews
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,website,geometry,rating,user_ratings_total,reviews,opening_hours,photos&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return data.result;
    }

    return null;
  } catch (error) {
    logger.error('Error getting place details:', error);
    return null;
  }
}

/**
 * Sync reviews from Google Places to database
 */
export async function syncCompanyReviews(companyId: number): Promise<{
  success: boolean;
  message: string;
  reviewsAdded: number;
}> {
  try {
    // Get company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return {
        success: false,
        message: 'Company not found',
        reviewsAdded: 0,
      };
    }

    let placeId = company.googlePlaceId;

    // If no Place ID, search for it
    if (!placeId) {
      const searchResult = await searchPlace(company.name, company.address || undefined);
      
      if (!searchResult) {
        return {
          success: false,
          message: 'Could not find place on Google Maps',
          reviewsAdded: 0,
        };
      }

      placeId = searchResult.place_id;

      // Update company with Place ID
      await prisma.company.update({
        where: { id: companyId },
        data: {
          googlePlaceId: placeId,
          latitude: searchResult.geometry.location.lat,
          longitude: searchResult.geometry.location.lng,
          rating: searchResult.rating,
          reviewCount: searchResult.user_ratings_total || 0,
        },
      });
    }

    // Get place details with reviews
    const placeDetails = await getPlaceDetails(placeId);

    if (!placeDetails || !placeDetails.reviews) {
      return {
        success: false,
        message: 'No reviews found for this place',
        reviewsAdded: 0,
      };
    }

    // Sync reviews with translation
    let reviewsAdded = 0;

    for (const googleReview of placeDetails.reviews) {
      // Check if review already exists (by author name and time)
      const existingReview = await prisma.review.findFirst({
        where: {
          companyId,
          authorName: googleReview.author_name,
          source: 'google',
          reviewDate: new Date(googleReview.time * 1000),
        },
      });

      if (!existingReview) {
        // Skip empty reviews
        if (!googleReview.text || googleReview.text.trim().length === 0) {
          logger.warn(`Skipping empty review from ${googleReview.author_name}`);
          continue;
        }

        // Use original text as-is (most reviews in Haguenau region are already in French)
        // Only translate if explicitly needed in future
        const detectedLanguage = googleReview.language || 'fr';
        const shouldTranslate = detectedLanguage !== 'fr' && detectedLanguage !== 'de';

        let commentFrench = googleReview.text;
        if (shouldTranslate) {
          // Only translate for non-French/German reviews
          commentFrench = await translateToFrench(googleReview.text, detectedLanguage);
        }

        await prisma.review.create({
          data: {
            companyId,
            authorName: googleReview.author_name,
            authorPhoto: googleReview.profile_photo_url,
            rating: googleReview.rating,
            comment: googleReview.text, // Store original as-is
            commentFr: commentFrench, // Store French version (same or translated)
            originalLanguage: detectedLanguage,
            source: 'google',
            reviewDate: new Date(googleReview.time * 1000),
            isApproved: true,
            isActive: true,
          },
        });
        reviewsAdded++;
      }
    }

    // Calculate rating distribution from reviews
    const ratingDistribution = calculateRatingDistribution(placeDetails.reviews);

    // Update company rating, review count, and rating distribution
    await prisma.company.update({
      where: { id: companyId },
      data: {
        rating: placeDetails.rating,
        reviewCount: placeDetails.user_ratings_total || 0,
        ratingDistribution: ratingDistribution as any,
        lastSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Successfully synced ${reviewsAdded} new reviews`,
      reviewsAdded,
    };
  } catch (error) {
    logger.error('Error syncing reviews:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      reviewsAdded: 0,
    };
  }
}

/**
 * Sync reviews for all companies
 */
export async function syncAllCompaniesReviews(): Promise<{
  success: boolean;
  totalReviewsAdded: number;
  companiesProcessed: number;
}> {
  try {
    const companies = await prisma.company.findMany();
    let totalReviewsAdded = 0;
    let companiesProcessed = 0;

    for (const company of companies) {
      const result = await syncCompanyReviews(company.id);
      if (result.success) {
        totalReviewsAdded += result.reviewsAdded;
        companiesProcessed++;
      }
      
      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      success: true,
      totalReviewsAdded,
      companiesProcessed,
    };
  } catch (error) {
    logger.error('Error syncing all reviews:', error);
    return {
      success: false,
      totalReviewsAdded: 0,
      companiesProcessed: 0,
    };
  }
}



/**
 * Calculate rating distribution from Google reviews
 * Note: This calculates distribution from the reviews returned by the API (max 5)
 * For more accurate distribution, we would need to scrape Google Maps
 */
function calculateRatingDistribution(reviews: GoogleReview[]): RatingDistribution {
  const distribution: RatingDistribution = {
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0,
  };

  reviews.forEach((review) => {
    const rating = review.rating || 0;
    if (rating === 5) distribution.five_star++;
    else if (rating === 4) distribution.four_star++;
    else if (rating === 3) distribution.three_star++;
    else if (rating === 2) distribution.two_star++;
    else if (rating === 1) distribution.one_star++;
  });

  return distribution;
}

