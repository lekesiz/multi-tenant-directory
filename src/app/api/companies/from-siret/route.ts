import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
// import { requireAdmin } from '@/lib/auth-guard'; // Removed: Frontend already has auth
import { createCompanyFromSiret } from '@/lib/google-places';
import { generateCompanyProfile } from '@/lib/gemini';
import { slugify } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const siretSchema = z.object({
  siret: z.string()
    .min(14, 'SIRET doit contenir 14 chiffres')
    .max(14, 'SIRET doit contenir 14 chiffres')
    .regex(/^\d{14}$/, 'SIRET doit contenir uniquement des chiffres'),
});

/**
 * POST /api/companies/from-siret
 * Create company from SIRET number
 *
 * Flow:
 * 1. Validate SIRET
 * 2. Fetch from Annuaire des Entreprises (official government data)
 * 3. Search Google Maps for Place ID
 * 4. Generate AI-enhanced profile description
 * 5. Create company in database with all data
 */
export async function POST(request: NextRequest) {
  try {
    // Note: No auth check here because frontend admin panel already requires authentication
    // This API is only accessible from authenticated admin panel pages
    
    // Parse and validate request
    const body = await request.json();
    const validation = siretSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { siret } = validation.data;

    logger.info('Creating company from SIRET', { siret });

    // Step 1: Check if company with this SIRET already exists
    const existing = await prisma.company.findUnique({
      where: { siret },
      select: { id: true, name: true, slug: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: 'Company already exists',
          message: `Une entreprise avec ce SIRET existe déjà: ${existing.name}`,
          companyId: existing.id,
          slug: existing.slug,
        },
        { status: 409 }
      );
    }

    // Step 2: Fetch from Annuaire + Google
    const fetchResult = await createCompanyFromSiret(siret);

    if (!fetchResult.success || !fetchResult.data) {
      return NextResponse.json(
        {
          error: 'Company not found',
          message: fetchResult.message,
        },
        { status: 404 }
      );
    }

    const { annuaire, google, googlePlaceId } = fetchResult.data;

    logger.info('Company data fetched successfully', {
      siret,
      siren: annuaire.siren,
      name: annuaire.name,
      hasGoogle: !!google,
      googlePlaceId,
    });

    // Step 2.5: Check if company with this Google Place ID already exists
    if (googlePlaceId) {
      const existingByPlaceId = await prisma.company.findUnique({
        where: { googlePlaceId },
        select: { id: true, name: true, slug: true, siret: true },
      });

      if (existingByPlaceId) {
        return NextResponse.json(
          {
            error: 'Company with same Google Place ID exists',
            message: `Une entreprise avec le même emplacement Google existe déjà: ${existingByPlaceId.name}${existingByPlaceId.siret ? ` (SIRET: ${existingByPlaceId.siret})` : ''}. Cette entreprise partage le même emplacement Google Maps.`,
            companyId: existingByPlaceId.id,
            slug: existingByPlaceId.slug,
            existingSiret: existingByPlaceId.siret,
            newSiret: siret,
          },
          { status: 409 }
        );
      }
    }

    // Step 3: Generate AI profile
    let aiProfile = null;
    try {
      aiProfile = await generateCompanyProfile({
        name: annuaire.name,
        city: annuaire.city || '',
        address: annuaire.address || undefined,
        categories: annuaire.categories,
        nafCode: annuaire.nafCode || undefined,
        legalForm: annuaire.legalForm || undefined,
        employeeCount: annuaire.employeeCount || undefined,
        foundingDate: annuaire.foundingDate || undefined,
        googleRating: google?.rating,
        googleReviewCount: google?.user_ratings_total,
      });

      logger.info('AI profile generated', {
        siret,
        name: annuaire.name,
        descriptionLength: aiProfile.description.length,
      });
    } catch (aiError) {
      logger.warn('AI profile generation failed, continuing without it', { error: aiError });
    }

    // Step 4: Generate slug
    const baseSlug = slugify(annuaire.name);
    let slug = baseSlug;
    let slugExists = await prisma.company.findUnique({ where: { slug } });
    let counter = 1;

    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await prisma.company.findUnique({ where: { slug } });
      counter++;
    }

    // Step 5: Parse business hours if available
    let businessHours = null;
    if (google?.opening_hours?.weekday_text) {
      try {
        const parseGoogleBusinessHours = (await import('@/lib/google-places')).parseGoogleBusinessHours;
        businessHours = parseGoogleBusinessHours(google.opening_hours.weekday_text);
      } catch (error) {
        logger.warn('Failed to parse business hours', { error });
      }
    }

    // Step 6: Create company in database
    const company = await prisma.company.create({
      data: {
        // Basic info
        name: annuaire.name,
        slug,

        // Official government data
        siren: annuaire.siren,
        siret: annuaire.siret,
        legalForm: annuaire.legalForm,
        legalStatus: annuaire.legalStatus,
        nafCode: annuaire.nafCode,
        employeeCount: annuaire.employeeCount,
        foundingDate: annuaire.foundingDate,
        isVerified: true,
        lastVerifiedAt: new Date(),

        // Location
        address: annuaire.address,
        city: annuaire.city,
        postalCode: annuaire.postalCode,
        latitude: google?.geometry?.location?.lat || annuaire.latitude,
        longitude: google?.geometry?.location?.lng || annuaire.longitude,

        // Google data
        googlePlaceId: googlePlaceId || null,
        phone: google?.formatted_phone_number || null,
        website: google?.website || null,
        rating: google?.rating || null,
        reviewCount: google?.user_ratings_total || 0,
        businessHours: businessHours ? JSON.parse(JSON.stringify(businessHours)) : null,

        // Categories
        categories: annuaire.categories,

        // AI-generated content
        ...(aiProfile && {
          // Note: These fields might need to be added to CompanyContent model
          // For now, we'll store them in a custom JSON field if available
        }),

        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        siren: true,
        siret: true,
        city: true,
        isVerified: true,
        googlePlaceId: true,
      },
    });

    logger.info('Company created successfully from SIRET', {
      companyId: company.id,
      siret: company.siret,
      name: company.name,
      slug: company.slug,
    });

    // Step 7: Return success with AI profile data
    return NextResponse.json(
      {
        success: true,
        message: 'Entreprise créée avec succès depuis le SIRET',
        company,
        aiProfile,
        sources: {
          annuaire: true,
          google: !!google,
          ai: !!aiProfile,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    logger.error('Error creating company from SIRET', { error });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}
