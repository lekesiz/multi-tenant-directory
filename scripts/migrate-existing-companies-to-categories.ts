import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migrate existing companies to the new category system
 * Maps old string[] categories to new Category relationships
 */
async function main() {
  console.log('🔄 Starting company category migration...\n');

  // Get all companies with their old categories
  const companies = await prisma.company.findMany({
    where: {
      categories: {
        isEmpty: false, // Only companies that have categories
      },
    },
    select: {
      id: true,
      name: true,
      categories: true,
    },
  });

  console.log(`Found ${companies.length} companies with categories\n`);

  // Get all categories with their Google type mappings
  const allCategories = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      googleTypes: true,
      parentId: true,
    },
  });

  let totalMapped = 0;
  let totalSkipped = 0;

  // Manual category name mapping (old string names to new slugs)
  const categoryMapping: Record<string, string> = {
    'Restaurant': 'restaurant',
    'Café & Bar': 'cafe',
    'Café': 'cafe',
    'Bar': 'bar',
    'Boulangerie': 'boulangerie',
    'Pâtisserie': 'boulangerie',
    'Fast Food': 'fast-food',
    'Alimentation': 'alimentation',
    'Pharmacie': 'pharmacie',
    'Parapharmacie': 'pharmacie',
    'Santé': 'sante',
    'Médecin': 'medecin',
    'Dentiste': 'dentiste',
    'Soins Dentaires': 'dentiste',
    'Orthodontie': 'dentiste',
    'Beauté & Bien-être': 'coiffeur',
    'Coiffure': 'coiffeur',
    'Salon de Coiffure': 'coiffeur',
    'Coiffure Femme': 'coiffeur',
    'Coiffure Homme': 'coiffeur',
    'Automobile': 'garage',
    'Garage': 'garage',
    'Garage Automobile': 'garage',
    'Mécanique': 'garage',
    'Carrosserie': 'garage',
    'Commerce': 'commerces',
    'Artisan': 'services',
    'Services': 'services',
    'Plombier': 'plombier',
    'Chauffagiste': 'plombier',
    'Sanitaire': 'plombier',
    'Plomberie': 'plombier',
    'Électricien': 'electricien',
    'Installation Électrique': 'electricien',
    'Dépannage Électrique': 'electricien',
    'Loisirs & Culture': 'loisirs',
    'Éducation & Formation': 'education',
    'École': 'ecole',
    'Université': 'universite',
    'Hébergement': 'hebergement',
    'Hôtel': 'hotel',
    'Immobilier & Finance': 'services',
    'Vêtements': 'vetements',
    'Électronique': 'electronique',
    'Informatique': 'electronique',
    'Supermarché': 'supermarche',
    'Épicerie Bio': 'supermarche',
    'Alimentation Bio': 'supermarche',
    'Fleuriste': 'commerces',
    'Décoration Florale': 'commerces',
    'Librairie': 'commerces',
    'Papeterie': 'commerces',
    'Sport': 'sport',
    'Gym': 'sport',
    'Cinéma': 'cinema',
  };

  for (const company of companies) {
    console.log(`\n📍 ${company.name}`);
    console.log(`   Old categories: ${company.categories.join(', ')}`);

    // Find matching categories based on manual mapping
    const matchedCategories = allCategories.filter((cat) =>
      company.categories.some((oldCat) => categoryMapping[oldCat] === cat.slug)
    );

    if (matchedCategories.length === 0) {
      console.log(`   ⚠️  No matching categories found`);
      totalSkipped++;
      continue;
    }

    // Prefer child categories (more specific)
    const sortedCategories = matchedCategories.sort((a, b) => {
      if (a.parentId && !b.parentId) return -1;
      if (!a.parentId && b.parentId) return 1;
      return 0;
    });

    console.log(`   ✅ Matched: ${sortedCategories.map((c) => c.name).join(', ')}`);

    // Create CompanyCategory relationships
    for (let i = 0; i < sortedCategories.length && i < 3; i++) {
      const category = sortedCategories[i];

      try {
        await prisma.companyCategory.upsert({
          where: {
            companyId_categoryId: {
              companyId: company.id,
              categoryId: category.id,
            },
          },
          create: {
            companyId: company.id,
            categoryId: category.id,
            isPrimary: i === 0, // First match is primary
          },
          update: {
            isPrimary: i === 0,
          },
        });
      } catch (error) {
        console.log(`   ❌ Error creating relationship: ${error}`);
      }
    }

    totalMapped++;
  }

  console.log(`\n\n📊 Migration Summary:`);
  console.log(`   ✅ Successfully mapped: ${totalMapped} companies`);
  console.log(`   ⚠️  Skipped: ${totalSkipped} companies`);
  console.log(`\n✨ Migration complete!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
