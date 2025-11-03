#!/usr/bin/env tsx

/**
 * Intelligent Company Assignment Script
 *
 * This script automatically assigns companies to domains based on postal codes.
 * It creates CompanyContent records for companies that match the domain's city.
 */

import { prisma } from '../src/lib/prisma';

// Domain to postal code mapping
const DOMAIN_POSTAL_CODE_MAP: Record<string, string[]> = {
  'bas-rhin.pro': ['67000'], // General Bas-Rhin area
  'erstein.pro': ['67150'], // Erstein
  'geispolsheim.pro': ['67118'], // Geispolsheim
  'gries.pro': ['67240'], // Gries (shares with Bischwiller area)
  'illkirch.pro': ['67400'], // Illkirch-Graffenstaden
  'ittenheim.pro': ['67117'], // Ittenheim
  'mutzig.pro': ['67190'], // Mutzig
  'ostwald.pro': ['67540'], // Ostwald
  'vendenheim.pro': ['67550'], // Vendenheim
};

interface AssignmentResult {
  domain: string;
  assigned: number;
  skipped: number;
  companies: string[];
}

async function autoAssignCompanies(dryRun: boolean = true): Promise<AssignmentResult[]> {
  console.log('🚀 Starting intelligent company assignment...\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes will be made)' : '✅ LIVE (assignments will be created)'}\n`);
  console.log('='.repeat(80));

  const results: AssignmentResult[] = [];

  // Get all empty domains
  const emptyDomains = await prisma.domain.findMany({
    where: {
      name: {
        in: Object.keys(DOMAIN_POSTAL_CODE_MAP),
      },
    },
    include: {
      _count: {
        select: {
          content: true,
        },
      },
    },
  });

  console.log(`\n📋 Found ${emptyDomains.length} domains to process\n`);

  for (const domain of emptyDomains) {
    const postalCodes = DOMAIN_POSTAL_CODE_MAP[domain.name];

    if (!postalCodes || postalCodes.length === 0) {
      console.log(`⚠️  ${domain.name}: No postal codes configured, skipping`);
      continue;
    }

    console.log(`\n🌐 Processing: ${domain.name}`);
    console.log(`   Postal codes: ${postalCodes.join(', ')}`);
    console.log(`   Current companies: ${domain._count.content}`);

    // Find companies matching postal codes
    const matchingCompanies = await prisma.company.findMany({
      where: {
        postalCode: {
          in: postalCodes,
        },
      },
      select: {
        id: true,
        name: true,
        city: true,
        postalCode: true,
        content: {
          where: {
            domainId: domain.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    console.log(`   📦 Found ${matchingCompanies.length} companies with matching postal codes`);

    let assigned = 0;
    let skipped = 0;
    const assignedCompanies: string[] = [];

    for (const company of matchingCompanies) {
      // Skip if already assigned
      if (company.content.length > 0) {
        skipped++;
        continue;
      }

      if (!dryRun) {
        // Create assignment
        await prisma.companyContent.create({
          data: {
            companyId: company.id,
            domainId: domain.id,
            isVisible: true,
          },
        });
      }

      assigned++;
      assignedCompanies.push(`${company.name} (${company.postalCode})`);

      // Log first 5 companies
      if (assigned <= 5) {
        console.log(`   ✅ ${dryRun ? 'Would assign' : 'Assigned'}: ${company.name} (${company.postalCode} - ${company.city})`);
      }
    }

    if (assigned > 5) {
      console.log(`   ... and ${assigned - 5} more companies`);
    }

    console.log(`   📊 Summary: ${assigned} assigned, ${skipped} already assigned`);

    results.push({
      domain: domain.name,
      assigned,
      skipped,
      companies: assignedCompanies,
    });
  }

  return results;
}

async function generateReport(results: AssignmentResult[]) {
  console.log('\n');
  console.log('='.repeat(80));
  console.log('📊 FINAL REPORT');
  console.log('='.repeat(80));

  let totalAssigned = 0;
  let totalSkipped = 0;

  results.forEach(result => {
    totalAssigned += result.assigned;
    totalSkipped += result.skipped;

    console.log(`\n${result.domain}:`);
    console.log(`  ✅ Assigned: ${result.assigned}`);
    console.log(`  ⏭️  Skipped: ${result.skipped}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log(`📈 TOTALS:`);
  console.log(`   Total companies assigned: ${totalAssigned}`);
  console.log(`   Total companies skipped: ${totalSkipped}`);
  console.log('='.repeat(80));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');

  if (dryRun) {
    console.log('💡 Running in DRY RUN mode. Use --apply to actually make changes.\n');
  }

  try {
    const results = await autoAssignCompanies(dryRun);
    await generateReport(results);

    if (dryRun) {
      console.log('\n💡 To apply these changes, run: npm run assign-companies --apply\n');
    } else {
      console.log('\n✅ All assignments completed successfully!\n');

      // Verify final state
      console.log('🔍 Verifying assignments...');
      const domains = await prisma.domain.findMany({
        where: {
          name: {
            in: Object.keys(DOMAIN_POSTAL_CODE_MAP),
          },
        },
        include: {
          _count: {
            select: {
              content: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      console.log('\n📊 DOMAIN STATUS:');
      domains.forEach(d => {
        const status = d._count.content > 0 ? '✅' : '🔴';
        console.log(`   ${status} ${d.name.padEnd(30)} ${d._count.content} companies`);
      });
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
