/**
 * Script to fix invalid company slugs
 *
 * This script:
 * 1. Finds companies with invalid slugs (empty, null, or non-URL-safe)
 * 2. Generates proper slugs from company names
 * 3. Handles duplicate slugs by appending numbers
 * 4. Updates companies in the database
 *
 * Run: npx tsx fix-slugs.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Keep only alphanumeric, spaces, and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}

async function fixSlugs() {
  console.log('🔍 Finding companies with invalid or missing slugs...\n');

  // Get all companies
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  console.log(`Found ${companies.length} total companies\n`);

  const problematicCompanies: typeof companies = [];
  const existingSlugs = new Set<string>();

  // First pass: collect existing valid slugs
  for (const company of companies) {
    if (company.slug && company.slug.trim().length > 0) {
      existingSlugs.add(company.slug);
    }
  }

  // Second pass: identify problematic companies
  for (const company of companies) {
    // Check for various invalid slug conditions
    const hasSpace = company.slug && company.slug.includes(' ');
    const hasUppercase = company.slug && company.slug !== company.slug.toLowerCase();
    const hasSpecialChars = company.slug && /[^a-z0-9-]/.test(company.slug);
    const isEmpty = !company.slug || company.slug.trim().length === 0;
    const tooShort = company.slug && company.slug.length < 2;
    const notSlugified = company.slug && company.slug !== slugify(company.slug);

    const hasInvalidSlug =
      isEmpty ||
      tooShort ||
      hasSpace ||
      hasUppercase ||
      hasSpecialChars ||
      notSlugified;

    if (hasInvalidSlug) {
      problematicCompanies.push(company);
      console.log(`   ⚠️  ID ${company.id}: "${company.slug}" ${
        hasSpace ? '[has spaces]' :
        hasUppercase ? '[has uppercase]' :
        hasSpecialChars ? '[has special chars]' :
        isEmpty ? '[empty]' :
        tooShort ? '[too short]' :
        '[not properly slugified]'
      }`);
    }
  }

  console.log(`\n${problematicCompanies.length} companies need slug fixes:\n`);

  if (problematicCompanies.length === 0) {
    console.log('✅ All companies have valid slugs!');
    return;
  }

  // Fix each problematic company
  for (const company of problematicCompanies) {
    console.log(`\n📝 Company ID ${company.id}: ${company.name}`);
    console.log(`   Current slug: "${company.slug}"`);

    // Generate base slug from company name
    let newSlug = slugify(company.name);

    // If still empty after slugification, use company ID
    if (!newSlug || newSlug.length === 0) {
      newSlug = `company-${company.id}`;
    }

    // Handle duplicates by appending number
    let finalSlug = newSlug;
    let counter = 1;

    while (existingSlugs.has(finalSlug)) {
      finalSlug = `${newSlug}-${counter}`;
      counter++;
    }

    console.log(`   New slug: "${finalSlug}"`);

    try {
      // Update the company
      await prisma.company.update({
        where: { id: company.id },
        data: { slug: finalSlug },
      });

      // Add to existing slugs set
      existingSlugs.add(finalSlug);

      console.log(`   ✅ Updated successfully`);
    } catch (error) {
      console.error(`   ❌ Error updating: ${error}`);
    }
  }

  console.log(`\n\n✨ Slug fix complete!`);
  console.log(`Fixed ${problematicCompanies.length} companies`);
}

fixSlugs()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
