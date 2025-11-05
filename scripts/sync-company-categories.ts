/**
 * Script to synchronize existing company categories from the categories array field
 * to the CompanyCategory junction table.
 * 
 * This ensures that all companies with categories in their categories[] field
 * are properly linked in the CompanyCategory table.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncCompanyCategories() {
  console.log('🔄 Starting company categories synchronization...\n');

  try {
    // Get all companies with categories
    const companies = await prisma.company.findMany({
      where: {
        categories: {
          isEmpty: false,
        },
      },
      select: {
        id: true,
        name: true,
        categories: true,
        companyCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    console.log(`Found ${companies.length} companies with categories\n`);

    let syncedCount = 0;
    let errorCount = 0;

    for (const company of companies) {
      try {
        console.log(`Processing: ${company.name} (ID: ${company.id})`);
        console.log(`  Categories: ${company.categories.join(', ')}`);

        // Get category IDs from slugs
        const categoryRecords = await prisma.category.findMany({
          where: {
            slug: {
              in: company.categories,
            },
          },
          select: {
            id: true,
            slug: true,
            nameFr: true,
          },
        });

        if (categoryRecords.length === 0) {
          console.log(`  ⚠️  No matching categories found in database`);
          errorCount++;
          continue;
        }

        console.log(`  Found ${categoryRecords.length} matching categories:`);
        categoryRecords.forEach(cat => {
          console.log(`    - ${cat.nameFr} (${cat.slug})`);
        });

        // Get existing associations
        const existingCategoryIds = company.companyCategories.map(cc => cc.category.id);
        const newCategoryIds = categoryRecords.map(cat => cat.id);

        // Find categories to add
        const categoriesToAdd = categoryRecords.filter(
          cat => !existingCategoryIds.includes(cat.id)
        );

        if (categoriesToAdd.length === 0) {
          console.log(`  ✅ Already synced (${existingCategoryIds.length} associations exist)`);
        } else {
          // Delete all existing associations first
          await prisma.companyCategory.deleteMany({
            where: {
              companyId: company.id,
            },
          });

          // Create new associations
          await prisma.companyCategory.createMany({
            data: categoryRecords.map((cat, index) => ({
              companyId: company.id,
              categoryId: cat.id,
              isPrimary: index === 0, // First category is primary
            })),
            skipDuplicates: true,
          });

          console.log(`  ✅ Synced ${categoriesToAdd.length} new associations`);
          syncedCount++;
        }

        console.log('');
      } catch (error) {
        console.error(`  ❌ Error processing company ${company.id}:`, error);
        errorCount++;
        console.log('');
      }
    }

    console.log('\n📊 Synchronization Summary:');
    console.log(`  Total companies processed: ${companies.length}`);
    console.log(`  Successfully synced: ${syncedCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log('\n✅ Synchronization completed!');

  } catch (error) {
    console.error('❌ Fatal error during synchronization:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
syncCompanyCategories();
