#!/usr/bin/env tsx
/**
 * Script de synchronisation automatique des avis Google
 * Ce script synchronise les avis Google pour toutes les entreprises ou une entreprise spécifique
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

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

interface PlaceDetails {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: GoogleReview[];
}

async function searchPlace(name: string, address?: string): Promise<string | null> {
  try {
    const query = address ? `${name}, ${address}` : name;
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      query
    )}&inputtype=textquery&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
      return data.candidates[0].place_id;
    }

    return null;
  } catch (error) {
    console.error('Error searching place:', error);
    return null;
  }
}

async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,rating,user_ratings_total,reviews&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return data.result;
    }

    console.error('Error getting place details:', data.status, data.error_message);
    return null;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

async function syncCompanyReviews(companyId: number): Promise<number> {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      console.error(`Company ${companyId} not found`);
      return 0;
    }

    console.log(`\n📍 Synchronisation: ${company.name}`);

    let placeId = company.googlePlaceId;

    // Si pas de Place ID, rechercher
    if (!placeId) {
      console.log('   Recherche du lieu sur Google Maps...');
      placeId = await searchPlace(company.name, company.address || undefined);
      
      if (!placeId) {
        console.log('   ❌ Lieu non trouvé sur Google Maps');
        return 0;
      }

      console.log('   ✅ Place ID trouvé:', placeId);

      // Mettre à jour le Place ID
      await prisma.company.update({
        where: { id: companyId },
        data: { googlePlaceId: placeId },
      });
    }

    // Récupérer les détails et avis
    console.log('   Récupération des avis...');
    const placeDetails = await getPlaceDetails(placeId);

    if (!placeDetails || !placeDetails.reviews) {
      console.log('   ⚠️  Aucun avis trouvé');
      return 0;
    }

    console.log(`   Trouvé ${placeDetails.reviews.length} avis`);

    // Synchroniser les avis
    let reviewsAdded = 0;

    for (const googleReview of placeDetails.reviews) {
      if (!googleReview.text || googleReview.text.trim().length === 0) {
        continue;
      }

      const reviewDate = new Date(googleReview.time * 1000);
      
      // Vérifier si l'avis existe déjà
      const existingReview = await prisma.review.findFirst({
        where: {
          companyId,
          authorName: googleReview.author_name,
          source: 'google',
          reviewDate: reviewDate,
        },
      });

      if (existingReview) {
        continue;
      }

      // Créer le nouvel avis
      await prisma.review.create({
        data: {
          companyId,
          authorName: googleReview.author_name,
          authorPhoto: googleReview.profile_photo_url,
          rating: googleReview.rating,
          comment: googleReview.text,
          commentFr: googleReview.text, // On garde l'original pour l'instant
          originalLanguage: googleReview.language || 'en',
          source: 'google',
          reviewDate: reviewDate,
          isApproved: true,
          isActive: true,
        },
      });
      
      reviewsAdded++;
    }

    // Mettre à jour les statistiques de l'entreprise
    await prisma.company.update({
      where: { id: companyId },
      data: {
        rating: placeDetails.rating,
        reviewCount: placeDetails.user_ratings_total || 0,
        lastSyncedAt: new Date(),
      },
    });

    console.log(`   ✅ ${reviewsAdded} nouveaux avis ajoutés`);
    return reviewsAdded;

  } catch (error) {
    console.error(`Error syncing company ${companyId}:`, error);
    return 0;
  }
}

async function main() {
  console.log('🔄 Démarrage de la synchronisation des avis Google\n');
  console.log('━'.repeat(80));

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ ERREUR: GOOGLE_MAPS_API_KEY non configurée');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const companyId = args[0] ? parseInt(args[0]) : null;

  if (companyId) {
    // Synchroniser une entreprise spécifique
    console.log(`Mode: Synchronisation de l'entreprise ID ${companyId}`);
    const added = await syncCompanyReviews(companyId);
    console.log('\n━'.repeat(80));
    console.log(`\n✅ Synchronisation terminée: ${added} avis ajoutés`);
  } else {
    // Synchroniser toutes les entreprises
    console.log('Mode: Synchronisation de toutes les entreprises');
    
    const companies = await prisma.company.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    console.log(`Nombre d'entreprises: ${companies.length}\n`);

    let totalAdded = 0;
    let processed = 0;

    for (const company of companies) {
      const added = await syncCompanyReviews(company.id);
      totalAdded += added;
      processed++;

      // Rate limiting: attendre 200ms entre chaque requête
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n━'.repeat(80));
    console.log(`\n✅ Synchronisation terminée:`);
    console.log(`   Entreprises traitées: ${processed}`);
    console.log(`   Total avis ajoutés: ${totalAdded}`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
