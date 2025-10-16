/**
 * Haguenau Businesses Database Import Script
 *
 * Imports enhanced business data into the database using Prisma
 *
 * Input: data/haguenau-businesses-enhanced.json (or processed if no enhancement)
 * Output: Database records + import report
 *
 * Features:
 * - Bulk import with transaction support
 * - Duplicate detection by slug
 * - Association with Haguenau domain
 * - CompanyContent creation for multi-tenant visibility
 * - Detailed import report generation
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface EnhancedBusiness {
  name: string;
  slug: string;
  categories: string[];
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  website?: string;
  latitude: number;
  longitude: number;
  description: string;
  descriptionEnhanced?: string;
  descriptionShort?: string;
  keywords?: string[];
  seoScore?: number;
  hours: any;
}

interface ImportResult {
  business: string;
  slug: string;
  status: 'imported' | 'skipped' | 'failed';
  reason?: string;
  companyId?: number;
}

/**
 * Main import function
 */
async function importBusinesses() {
  console.log('🚀 Starting Haguenau Businesses Database Import...\n');

  // Try to load enhanced data first, fall back to processed data
  let dataPath = path.join(process.cwd(), 'data', 'haguenau-businesses-enhanced.json');
  let usingEnhanced = true;

  if (!fs.existsSync(dataPath)) {
    console.log('⚠️  Enhanced data not found, using processed data instead...');
    dataPath = path.join(process.cwd(), 'data', 'haguenau-businesses-processed.json');
    usingEnhanced = false;

    if (!fs.existsSync(dataPath)) {
      console.error('❌ Error: No data file found!');
      console.error('   Please run process-businesses.ts first.\n');
      process.exit(1);
    }
  }

  const businesses: EnhancedBusiness[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`📄 Loaded ${businesses.length} businesses from ${usingEnhanced ? 'enhanced' : 'processed'} data\n`);

  // Get Haguenau domain
  console.log('🔍 Looking up Haguenau domain...');
  const domain = await prisma.domain.findUnique({
    where: { name: 'haguenau.pro' },
  });

  if (!domain) {
    console.error('❌ Error: Haguenau domain (haguenau.pro) not found in database!');
    console.error('   Please create the domain first.\n');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`✅ Found domain: ${domain.name} (ID: ${domain.id})\n`);

  // Import businesses
  const results: ImportResult[] = [];
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  console.log('📦 Importing businesses...\n');

  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    const progress = `[${i + 1}/${businesses.length}]`;

    try {
      // Check if already exists
      const existing = await prisma.company.findUnique({
        where: { slug: business.slug },
      });

      if (existing) {
        console.log(`${progress} ⏭️  Skipped: ${business.name} (already exists)`);
        results.push({
          business: business.name,
          slug: business.slug,
          status: 'skipped',
          reason: 'Already exists in database',
        });
        skipped++;
        continue;
      }

      // Import company
      const company = await prisma.company.create({
        data: {
          name: business.name,
          slug: business.slug,
          categories: business.categories,
          address: business.address,
          city: business.city,
          postalCode: business.postalCode,
          phone: business.phone,
          website: business.website,
          email: null,
          latitude: business.latitude,
          longitude: business.longitude,
          description: business.descriptionEnhanced || business.description,
          descriptionShort: business.descriptionShort || null,
          keywords: business.keywords || business.categories,
          hours: business.hours,
          rating: 4.5, // Default estimate
          reviewCount: 0,
          verified: false,
          photos: [],
          content: {
            create: {
              domainId: domain.id,
              isVisible: true,
            },
          },
        },
      });

      console.log(`${progress} ✅ Imported: ${business.name} (ID: ${company.id})`);
      results.push({
        business: business.name,
        slug: business.slug,
        status: 'imported',
        companyId: company.id,
      });
      imported++;
    } catch (error) {
      console.error(`${progress} ❌ Failed: ${business.name}`);
      console.error(`   Error: ${error}`);
      results.push({
        business: business.name,
        slug: business.slug,
        status: 'failed',
        reason: error instanceof Error ? error.message : String(error),
      });
      failed++;
    }
  }

  console.log('\n');

  // Generate report
  const reportPath = path.join(process.cwd(), 'HAGUENAU_IMPORT_REPORT.md');
  const report = generateReport(results, {
    total: businesses.length,
    imported,
    skipped,
    failed,
    domainName: domain.name,
    domainId: domain.id,
    usingEnhanced,
  });

  fs.writeFileSync(reportPath, report, 'utf-8');

  // Print summary
  console.log('📊 IMPORT SUMMARY:');
  console.log(`   Total businesses: ${businesses.length}`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}\n`);

  console.log(`📄 Import report saved to: ${reportPath}\n`);

  if (failed > 0) {
    console.log('⚠️  Some businesses failed to import. Check the report for details.\n');
  }

  if (imported > 0) {
    console.log(`✅ Successfully imported ${imported} businesses to haguenau.pro!\n`);
    console.log('🌐 Visit https://haguenau.pro/companies to see them.\n');
  }

  await prisma.$disconnect();
}

/**
 * Generate import report
 */
function generateReport(
  results: ImportResult[],
  stats: {
    total: number;
    imported: number;
    skipped: number;
    failed: number;
    domainName: string;
    domainId: number;
    usingEnhanced: boolean;
  }
): string {
  const now = new Date().toISOString();
  const successRate = ((stats.imported / stats.total) * 100).toFixed(1);

  let report = `# Haguenau Businesses Import Report

**Date:** ${now}
**Domain:** ${stats.domainName} (ID: ${stats.domainId})
**Data Source:** ${stats.usingEnhanced ? 'AI-Enhanced' : 'Processed (No AI)'}

---

## Summary

- **Total Businesses:** ${stats.total}
- **✅ Imported:** ${stats.imported}
- **⏭️ Skipped:** ${stats.skipped}
- **❌ Failed:** ${stats.failed}
- **Success Rate:** ${successRate}%

---

## Imported Businesses

`;

  const imported = results.filter((r) => r.status === 'imported');
  if (imported.length > 0) {
    imported.forEach((r, i) => {
      report += `${i + 1}. **${r.business}** ([slug]: ${r.slug}, [ID]: ${r.companyId})\n`;
    });
  } else {
    report += `*No businesses were imported.*\n`;
  }

  report += `\n---

## Skipped Businesses

`;

  const skipped = results.filter((r) => r.status === 'skipped');
  if (skipped.length > 0) {
    skipped.forEach((r, i) => {
      report += `${i + 1}. **${r.business}** - ${r.reason}\n`;
    });
  } else {
    report += `*No businesses were skipped.*\n`;
  }

  report += `\n---

## Failed Businesses

`;

  const failed = results.filter((r) => r.status === 'failed');
  if (failed.length > 0) {
    failed.forEach((r, i) => {
      report += `${i + 1}. **${r.business}**\n   - Error: ${r.reason}\n`;
    });
  } else {
    report += `*No failures.*\n`;
  }

  report += `\n---

## Next Steps

${
  stats.imported > 0
    ? `
1. ✅ Visit https://${stats.domainName}/companies to view imported businesses
2. ✅ Test search and filtering functionality
3. ✅ Verify GPS coordinates on map view
4. ⏳ Add business images (run download-images.ts if available)
5. ⏳ Encourage users to leave reviews
6. ⏳ Monitor SEO performance in Google Search Console
`
    : `
1. ⚠️ Fix import errors listed above
2. ⚠️ Re-run import script
`
}

---

**Report generated on:** ${now}
`;

  return report;
}

// Execute
importBusinesses().catch((error) => {
  console.error('❌ Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
