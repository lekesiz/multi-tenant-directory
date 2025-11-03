import { logger } from '@/lib/logger';
import { PrismaClient } from '@prisma/client';
import { translateToFrench, detectLanguage } from './translation';
import { searchBySiret, extractCompanyData, type AnnuaireCompany } from './annuaire-api';

const prisma = new PrismaClient();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

/**
 * Parse Google's weekday_text format to our BusinessHours format
 * Example: ["Monday: 9:00 AM – 6:00 PM", "Tuesday: Closed", ...]
 */
export function parseGoogleBusinessHours(weekdayText: string[]) {
  const daysMap: Record<string, string> = {
    'Monday': 'monday',
    'Tuesday': 'tuesday',
    'Wednesday': 'wednesday',
    'Thursday': 'thursday',
    'Friday': 'friday',
    'Saturday': 'saturday',
    'Sunday': 'sunday',
    'Lundi': 'monday',
    'Mardi': 'tuesday',
    'Mercredi': 'wednesday',
    'Jeudi': 'thursday',
    'Vendredi': 'friday',
    'Samedi': 'saturday',
    'Dimanche': 'sunday',
  };

  const hours: Record<string, any> = {};

  weekdayText.forEach((text) => {
    // Parse "Monday: 9:00 AM – 6:00 PM" or "Monday: Closed"
    const match = text.match(/^([^:]+):\s*(.+)$/);
    if (!match) return;

    const [, dayName, timeStr] = match;
    const dayKey = daysMap[dayName.trim()];
    if (!dayKey) return;

    // Check if closed
    if (timeStr.toLowerCase().includes('closed') || timeStr.toLowerCase().includes('fermé')) {
      hours[dayKey] = { closed: true, shifts: [] };
      return;
    }

    // Parse time range: "9:00 AM – 6:00 PM" or "9:00 – 18:00"
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})\s*(?:AM|PM)?\s*[–-]\s*(\d{1,2}:\d{2})\s*(?:AM|PM)?/i);
    if (timeMatch) {
      let [, openTime, closeTime] = timeMatch;

      // Convert 12-hour to 24-hour if needed
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        openTime = convertTo24Hour(openTime, timeStr.includes('AM', timeStr.indexOf(openTime)));
        closeTime = convertTo24Hour(closeTime, timeStr.includes('PM', timeStr.indexOf(closeTime)));
      }

      hours[dayKey] = {
        closed: false,
        shifts: [{ open: openTime, close: closeTime }]
      };
    }
  });

  return hours;
}

/**
 * Convert 12-hour time to 24-hour format
 */
function convertTo24Hour(time: string, isPM: boolean): string {
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;

  if (isPM && hours !== 12) {
    hour24 = hours + 12;
  } else if (!isPM && hours === 12) {
    hour24 = 0;
  }

  return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

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
      // Skip empty reviews first
      if (!googleReview.text || googleReview.text.trim().length === 0) {
        logger.warn(`Skipping empty review from ${googleReview.author_name}`);
        continue;
      }

      // Check if review already exists (by author name, text hash, and time)
      // This prevents duplicate reviews even if text content is modified
      const reviewDate = new Date(googleReview.time * 1000);
      const existingReview = await prisma.review.findFirst({
        where: {
          companyId,
          authorName: googleReview.author_name,
          source: 'google',
          reviewDate: reviewDate,
        },
      });

      if (existingReview) {
        // Review already exists - PRESERVE original content, don't update
        logger.info(`Review from ${googleReview.author_name} already exists, skipping to preserve content`);
        continue;
      }

      // New review - process and save
      const detectedLanguage = googleReview.language || 'fr';

      // IMPORTANT: Store original text as-is, NEVER modify it
      // Most reviews in Haguenau are already in French
      // commentFr will be same as original for French/German reviews
      let commentFrench = googleReview.text;

      // Only translate if language is NOT French or German
      const shouldTranslate = detectedLanguage !== 'fr' && detectedLanguage !== 'de';
      if (shouldTranslate) {
        try {
          commentFrench = await translateToFrench(googleReview.text, detectedLanguage);
          logger.info(`Translated review from ${detectedLanguage} to French`);
        } catch (translateError) {
          logger.error(`Translation failed for review, using original:`, translateError);
          commentFrench = googleReview.text; // Fallback to original
        }
      }

      await prisma.review.create({
        data: {
          companyId,
          authorName: googleReview.author_name,
          authorPhoto: googleReview.profile_photo_url,
          rating: googleReview.rating,
          comment: googleReview.text, // ALWAYS store Google's original text unchanged
          commentFr: commentFrench, // French version (same or translated)
          originalLanguage: detectedLanguage,
          source: 'google',
          reviewDate: reviewDate,
          isApproved: true,
          isActive: true,
        },
      });
      reviewsAdded++;
      logger.info(`Added new review from ${googleReview.author_name} (${detectedLanguage})`);
    }

    // Calculate rating distribution from reviews
    const ratingDistribution = calculateRatingDistribution(placeDetails.reviews);

    // Parse and sync business hours from Google if available
    let parsedHours = null;
    if (placeDetails.opening_hours?.weekday_text && placeDetails.opening_hours.weekday_text.length > 0) {
      try {
        parsedHours = parseGoogleBusinessHours(placeDetails.opening_hours.weekday_text);

        // Sync to BusinessHours table
        await prisma.businessHours.upsert({
          where: { companyId },
          update: {
            monday: parsedHours.monday || null,
            tuesday: parsedHours.tuesday || null,
            wednesday: parsedHours.wednesday || null,
            thursday: parsedHours.thursday || null,
            friday: parsedHours.friday || null,
            saturday: parsedHours.saturday || null,
            sunday: parsedHours.sunday || null,
          },
          create: {
            companyId,
            monday: parsedHours.monday || null,
            tuesday: parsedHours.tuesday || null,
            wednesday: parsedHours.wednesday || null,
            thursday: parsedHours.thursday || null,
            friday: parsedHours.friday || null,
            saturday: parsedHours.saturday || null,
            sunday: parsedHours.sunday || null,
            specialHours: [],
          },
        });

        logger.info(`Synced business hours for company ${companyId} from Google`);
      } catch (error) {
        logger.error('Error syncing business hours:', error);
        // Don't fail the entire sync if hours sync fails
      }
    }

    // Update company rating, review count, rating distribution, and business hours
    await prisma.company.update({
      where: { id: companyId },
      data: {
        rating: placeDetails.rating,
        reviewCount: placeDetails.user_ratings_total || 0,
        ratingDistribution: ratingDistribution as any,
        businessHours: parsedHours as any,
        lastSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Successfully synced ${reviewsAdded} new reviews${parsedHours ? ' and business hours' : ''}`,
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

/**
 * Create company profile from SIRET number
 * Combines Annuaire des Entreprises + Google Places data
 *
 * Flow:
 * 1. Fetch official data from Annuaire (government)
 * 2. Search Google Maps using company name + address
 * 3. Fetch Google Place details (reviews, hours, photos)
 * 4. Return combined data ready for AI enhancement
 */
export async function createCompanyFromSiret(siret: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    annuaire: ReturnType<typeof extractCompanyData>;
    google?: PlaceDetails;
    googlePlaceId?: string;
  };
}> {
  try {
    logger.info('Creating company from SIRET', { siret });

    // Step 1: Fetch from Annuaire des Entreprises
    const annuaireCompany = await searchBySiret(siret);

    if (!annuaireCompany) {
      return {
        success: false,
        message: 'Aucune entreprise trouvée avec ce SIRET dans l\'Annuaire des Entreprises',
      };
    }

    // Extract and format Annuaire data
    const annuaireData = extractCompanyData(annuaireCompany);
    logger.info('Annuaire data extracted', {
      siren: annuaireData.siren,
      siret: annuaireData.siret,
      name: annuaireData.name,
      city: annuaireData.city,
    });

    // Step 2: Search Google Maps using company name + address
    const searchQuery = annuaireData.address
      ? `${annuaireData.name}, ${annuaireData.address}`
      : `${annuaireData.name}, ${annuaireData.city}`;

    logger.info('Searching Google Maps', { query: searchQuery });

    const googleSearch = await searchPlace(
      annuaireData.name,
      annuaireData.address || undefined
    );

    if (!googleSearch) {
      // No Google Place found - return Annuaire data only
      logger.warn('No Google Place found for company', {
        name: annuaireData.name,
        address: annuaireData.address
      });

      return {
        success: true,
        message: 'Entreprise trouvée dans l\'Annuaire mais pas sur Google Maps',
        data: {
          annuaire: annuaireData,
        },
      };
    }

    logger.info('Google Place found', {
      placeId: googleSearch.place_id,
      name: googleSearch.name
    });

    // Step 3: Fetch Google Place details
    const googleDetails = await getPlaceDetails(googleSearch.place_id);

    if (!googleDetails) {
      return {
        success: true,
        message: 'Entreprise trouvée mais impossible de récupérer les détails Google',
        data: {
          annuaire: annuaireData,
          googlePlaceId: googleSearch.place_id,
        },
      };
    }

    logger.info('Google Place details fetched', {
      placeId: googleDetails.place_id,
      reviewCount: googleDetails.reviews?.length || 0,
      hasPhotos: !!googleDetails.photos?.length,
      hasHours: !!googleDetails.opening_hours,
    });

    // Return combined data
    return {
      success: true,
      message: 'Entreprise trouvée avec succès dans l\'Annuaire et sur Google Maps',
      data: {
        annuaire: annuaireData,
        google: googleDetails,
        googlePlaceId: googleDetails.place_id,
      },
    };

  } catch (error) {
    logger.error('Error creating company from SIRET', { error, siret });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue',
    };
  }
}

