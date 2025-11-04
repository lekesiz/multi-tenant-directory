/**
 * Category Migration Script
 * 
 * This script migrates companies from the old Google category system
 * to the new hierarchical category system.
 * 
 * Old system: companies.categories (string array)
 * New system: company_categories junction table
 * 
 * Usage:
 * pnpm tsx scripts/migrate-categories.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping from old Google categories to new hierarchical categories
const CATEGORY_MAPPING: Record<string, string> = {
  // Alimentation (🍽️)
  'restaurant': 'restaurant',
  'cafe': 'cafe',
  'café_&_bar': 'cafe',
  'bar': 'bar',
  'boulangerie': 'boulangerie',
  'pâtisserie': 'boulangerie',
  'fast_food': 'fast-food',
  'food': 'alimentation',
  'meal_takeaway': 'fast-food',
  'meal_delivery': 'fast-food',
  'bakery': 'boulangerie',
  'pizzeria': 'restaurant',
  'glacier': 'alimentation',
  'restaurant_japonais': 'restaurant',
  'restaurant_kebab': 'fast-food',
  'restaurant_gastronomique': 'restaurant',
  'cuisine_alsacienne': 'restaurant',
  'boucherie': 'alimentation',
  'charcuterie': 'alimentation',
  'épicerie_bio': 'supermarche',
  'alimentation_bio': 'supermarche',
  'restauration_rapide': 'fast-food',
  
  // Santé (💊)
  'pharmacy': 'pharmacie',
  'pharmacie': 'pharmacie',
  'parapharmacie': 'pharmacie',
  'doctor': 'medecin',
  'médecin_généraliste': 'medecin',
  'dentist': 'dentiste',
  'dentiste': 'dentiste',
  'orthodontie': 'dentiste',
  'soins_dentaires': 'dentiste',
  'hospital': 'sante',
  'hôpital': 'sante',
  'health': 'sante',
  'santé': 'sante',
  'physiotherapist': 'sante',
  'vétérinaire': 'sante',
  
  // Commerces (🏪)
  'store': 'commerces',
  'commerce': 'commerces',
  'commerce_local': 'commerces',
  'supermarket': 'supermarche',
  'supermarché': 'supermarche',
  'clothing_store': 'vetements',
  'vêtements_homme': 'vetements',
  'vêtements_enfants': 'vetements',
  'shoe_store': 'vetements',
  'magasin_de_chaussures': 'vetements',
  'shopping_mall': 'commerces',
  'convenience_store': 'commerces',
  'grocery_or_supermarket': 'supermarche',
  'magasin_discount': 'supermarche',
  'cosmétiques': 'commerces',
  'fournitures_de_bureau': 'commerces',
  'librairie': 'commerces',
  'jardinerie': 'commerces',
  'tabac': 'commerces',
  'presse': 'commerces',
  'tabac_presse_du_centre': 'commerces',
  
  // Services (🔧)
  'plumber': 'services',
  'plombier': 'services',
  'electrician': 'services',
  'électricien': 'services',
  'dépannage_électrique': 'services',
  'installation_électrique': 'services',
  'car_repair': 'services',
  'garage_automobile': 'services',
  'mécanique': 'services',
  'carrosserie': 'services',
  'equipement_automobile': 'services',
  'car_dealer': 'services',
  'automobile': 'services',
  'locksmith': 'services',
  'painter': 'services',
  'roofing_contractor': 'services',
  'general_contractor': 'services',
  'artisan': 'services',
  'chauffagiste': 'services',
  'sanitaire': 'services',
  'cordonnerie': 'services',
  'cuisines_et_ameublement': 'services',
  
  // Loisirs (🎭)
  'movie_theater': 'loisirs',
  'museum': 'loisirs',
  'gym': 'loisirs',
  'spa': 'loisirs',
  'beauty_salon': 'loisirs',
  'beauté_&_bien-être': 'loisirs',
  'institut_de_beauté': 'loisirs',
  'hair_care': 'loisirs',
  'coiffure': 'loisirs',
  'salon_de_coiffure': 'loisirs',
  'coiffure_femme': 'loisirs',
  'coiffure_homme': 'loisirs',
  'loisirs_&_culture': 'loisirs',
  'bibliothèque': 'loisirs',
  'fleuriste': 'loisirs',
  'décoration_florale': 'loisirs',
  'artisanat_alsacien': 'loisirs',
  
  // Hébergement (🏨)
  'real_estate_agency': 'hebergement',
  'immobilier_&_finance': 'hebergement',
  'moving_company': 'hebergement',
  'banque': 'hebergement',
  'assurance': 'hebergement',
  'hôtel': 'hotel',
  'hébergement': 'hebergement',
  
  // Éducation & Services (🏫)
  'establishment': 'services',
  'point_of_interest': 'services',
  'éducation_&_formation': 'education',
  'informatique': 'services',
  'industrie': 'services',
  'téléphonie': 'electronique',
  'optique': 'services',
};

async function main() {
  console.log('🚀 Starting category migration...\n');

  // Get all categories from new system
  const allCategories = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      parentId: true,
    },
  });

  console.log(`✅ Found ${allCategories.length} categories in new system\n`);

  // Create a map for quick lookup
  const categoryBySlug = new Map(
    allCategories.map(cat => [cat.slug, cat])
  );

  // Get all companies with their old categories
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      categories: true,
    },
    where: {
      categories: {
        isEmpty: false,
      },
    },
  });

  console.log(`📊 Found ${companies.length} companies with categories\n`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const stats = {
    totalMappings: 0,
    unmappedCategories: new Set<string>(),
  };

  // Process each company
  for (const company of companies) {
    try {
      const newCategoryIds = new Set<number>();

      // Map old categories to new ones
      for (const oldCategory of company.categories) {
        const normalizedOld = oldCategory.toLowerCase().replace(/\s+/g, '_');
        const newSlug = CATEGORY_MAPPING[normalizedOld];

        if (newSlug) {
          const newCategory = categoryBySlug.get(newSlug);
          if (newCategory) {
            newCategoryIds.add(newCategory.id);
            stats.totalMappings++;
          } else {
            console.warn(`⚠️  Category slug "${newSlug}" not found in database`);
            stats.unmappedCategories.add(oldCategory);
          }
        } else {
          // Try direct slug match
          const directMatch = categoryBySlug.get(normalizedOld);
          if (directMatch) {
            newCategoryIds.add(directMatch.id);
            stats.totalMappings++;
          } else {
            // Try partial match (contains)
            let found = false;
            for (const [slug, category] of categoryBySlug.entries()) {
              if (normalizedOld.includes(slug) || slug.includes(normalizedOld)) {
                newCategoryIds.add(category.id);
                stats.totalMappings++;
                found = true;
                break;
              }
            }
            
            if (!found) {
              // No mapping found - assign to "Autres"
              const autresCategory = categoryBySlug.get('autres');
              if (autresCategory) {
                newCategoryIds.add(autresCategory.id);
                stats.totalMappings++;
              }
              stats.unmappedCategories.add(oldCategory);
            }
          }
        }
      }

      if (newCategoryIds.size === 0) {
        console.log(`⏭️  Skipping ${company.name} - no valid categories`);
        skippedCount++;
        continue;
      }

      // Create company_categories entries
      for (const categoryId of newCategoryIds) {
        await prisma.companyCategory.upsert({
          where: {
            companyId_categoryId: {
              companyId: company.id,
              categoryId: categoryId,
            },
          },
          create: {
            companyId: company.id,
            categoryId: categoryId,
          },
          update: {}, // No update needed if already exists
        });
      }

      migratedCount++;
      
      if (migratedCount % 10 === 0) {
        console.log(`✅ Migrated ${migratedCount}/${companies.length} companies...`);
      }

    } catch (error) {
      console.error(`❌ Error migrating ${company.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 Migration Complete!\n');
  console.log('Statistics:');
  console.log(`  ✅ Successfully migrated: ${migratedCount} companies`);
  console.log(`  ⏭️  Skipped: ${skippedCount} companies`);
  console.log(`  ❌ Errors: ${errorCount} companies`);
  console.log(`  🔗 Total category mappings: ${stats.totalMappings}`);
  
  if (stats.unmappedCategories.size > 0) {
    console.log(`\n⚠️  Unmapped categories (assigned to "Autres"):`);
    Array.from(stats.unmappedCategories).forEach(cat => {
      console.log(`    - ${cat}`);
    });
  }

  // Show category distribution
  console.log('\n📈 Category Distribution:');
  const distribution = await prisma.companyCategory.groupBy({
    by: ['categoryId'],
    _count: true,
  });

  for (const dist of distribution) {
    const category = allCategories.find(c => c.id === dist.categoryId);
    if (category) {
      const indent = category.parentId ? '  └─ ' : '';
      console.log(`  ${indent}${category.name}: ${dist._count} companies`);
    }
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
