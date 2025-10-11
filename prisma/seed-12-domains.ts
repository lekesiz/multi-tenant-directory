import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 12 domain listesi
const DOMAINS = [
  {
    name: 'haguenau.pro',
    siteTitle: 'Haguenau.PRO',
    siteDescription: 'Les Professionnels de Haguenau - Trouvez les meilleurs professionnels à Haguenau',
    primaryColor: '#3B82F6',
  },
  {
    name: 'bischwiller.pro',
    siteTitle: 'Bischwiller.PRO',
    siteDescription: 'Les Professionnels de Bischwiller - Trouvez les meilleurs professionnels à Bischwiller',
    primaryColor: '#10B981',
  },
  {
    name: 'bouxwiller.pro',
    siteTitle: 'Bouxwiller.PRO',
    siteDescription: 'Les Professionnels de Bouxwiller - Trouvez les meilleurs professionnels à Bouxwiller',
    primaryColor: '#8B5CF6',
  },
  {
    name: 'brumath.pro',
    siteTitle: 'Brumath.PRO',
    siteDescription: 'Les Professionnels de Brumath - Trouvez les meilleurs professionnels à Brumath',
    primaryColor: '#F59E0B',
  },
  {
    name: 'hoerdt.pro',
    siteTitle: 'Hoerdt.PRO',
    siteDescription: 'Les Professionnels de Hoerdt - Trouvez les meilleurs professionnels à Hoerdt',
    primaryColor: '#EF4444',
  },
  {
    name: 'ingwiller.pro',
    siteTitle: 'Ingwiller.PRO',
    siteDescription: 'Les Professionnels de Ingwiller - Trouvez les meilleurs professionnels à Ingwiller',
    primaryColor: '#06B6D4',
  },
  {
    name: 'saverne.pro',
    siteTitle: 'Saverne.PRO',
    siteDescription: 'Les Professionnels de Saverne - Trouvez les meilleurs professionnels à Saverne',
    primaryColor: '#EC4899',
  },
  {
    name: 'schiltigheim.pro',
    siteTitle: 'Schiltigheim.PRO',
    siteDescription: 'Les Professionnels de Schiltigheim - Trouvez les meilleurs professionnels à Schiltigheim',
    primaryColor: '#6366F1',
  },
  {
    name: 'schweighouse.pro',
    siteTitle: 'Schweighouse.PRO',
    siteDescription: 'Les Professionnels de Schweighouse - Trouvez les meilleurs professionnels à Schweighouse',
    primaryColor: '#14B8A6',
  },
  {
    name: 'souffelweyersheim.pro',
    siteTitle: 'Souffelweyersheim.PRO',
    siteDescription: 'Les Professionnels de Souffelweyersheim - Trouvez les meilleurs professionnels à Souffelweyersheim',
    primaryColor: '#F97316',
  },
  {
    name: 'soufflenheim.pro',
    siteTitle: 'Soufflenheim.PRO',
    siteDescription: 'Les Professionnels de Soufflenheim - Trouvez les meilleurs professionnels à Soufflenheim',
    primaryColor: '#84CC16',
  },
  {
    name: 'wissembourg.pro',
    siteTitle: 'Wissembourg.PRO',
    siteDescription: 'Les Professionnels de Wissembourg - Trouvez les meilleurs professionnels à Wissembourg',
    primaryColor: '#A855F7',
  },
];

async function main() {
  console.log('🌱 Starting 12 domains seed...\n');

  // 1. Create all domains
  console.log('📍 Creating domains...');
  const createdDomains = [];
  
  for (const domainData of DOMAINS) {
    const domain = await prisma.domain.upsert({
      where: { name: domainData.name },
      update: {
        siteTitle: domainData.siteTitle,
        siteDescription: domainData.siteDescription,
        primaryColor: domainData.primaryColor,
        isActive: true,
      },
      create: {
        name: domainData.name,
        siteTitle: domainData.siteTitle,
        siteDescription: domainData.siteDescription,
        primaryColor: domainData.primaryColor,
        isActive: true,
      },
    });
    
    createdDomains.push(domain);
    console.log(`  ✅ ${domain.name}`);
  }

  console.log(`\n✅ ${createdDomains.length} domains created\n`);

  // 2. Get all existing companies
  console.log('🏢 Linking companies to domains...');
  const companies = await prisma.company.findMany();
  
  if (companies.length === 0) {
    console.log('⚠️  No companies found. Run seed-simple.ts first to create companies.');
    return;
  }

  console.log(`  Found ${companies.length} companies\n`);

  // 3. Link each company to all domains
  let linkedCount = 0;
  
  for (const company of companies) {
    for (const domain of createdDomains) {
      await prisma.companyContent.upsert({
        where: {
          companyId_domainId: {
            companyId: company.id,
            domainId: domain.id,
          },
        },
        update: {
          isVisible: true,
        },
        create: {
          companyId: company.id,
          domainId: domain.id,
          isVisible: true,
          customDescription: `${company.name} à ${domain.siteTitle?.replace('.PRO', '')}`,
        },
      });
      linkedCount++;
    }
    console.log(`  ✅ ${company.name} linked to all domains`);
  }

  console.log(`\n✅ ${linkedCount} company-domain links created`);

  // 4. Statistics
  console.log('\n📊 Statistics:');
  console.log(`  - Domains: ${createdDomains.length}`);
  console.log(`  - Companies: ${companies.length}`);
  console.log(`  - Links: ${linkedCount}`);
  console.log(`  - Average companies per domain: ${(linkedCount / createdDomains.length).toFixed(1)}`);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n🌐 Domains ready:');
  createdDomains.forEach(d => {
    console.log(`  - https://${d.name}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

