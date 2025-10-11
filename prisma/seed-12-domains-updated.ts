import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌐 Starting 12 domains seed...');

  // Domain listesi
  const domains = [
    {
      name: 'bischwiller.pro',
      siteTitle: 'Bischwiller.PRO - Les Professionnels de Bischwiller',
      siteDescription: 'Trouvez les meilleurs professionnels à Bischwiller. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#3B82F6',
    },
    {
      name: 'bouxwiller.pro',
      siteTitle: 'Bouxwiller.PRO - Les Professionnels de Bouxwiller',
      siteDescription: 'Trouvez les meilleurs professionnels à Bouxwiller. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#10B981',
    },
    {
      name: 'brumath.pro',
      siteTitle: 'Brumath.PRO - Les Professionnels de Brumath',
      siteDescription: 'Trouvez les meilleurs professionnels à Brumath. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#8B5CF6',
    },
    {
      name: 'haguenau.pro',
      siteTitle: 'Haguenau.PRO - Les Professionnels de Haguenau',
      siteDescription: 'Trouvez les meilleurs professionnels à Haguenau. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#EF4444',
    },
    {
      name: 'hoerdt.pro',
      siteTitle: 'Hœrdt.PRO - Les Professionnels de Hœrdt',
      siteDescription: 'Trouvez les meilleurs professionnels à Hœrdt. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#F59E0B',
    },
    {
      name: 'ingwiller.pro',
      siteTitle: 'Ingwiller.PRO - Les Professionnels d\'Ingwiller',
      siteDescription: 'Trouvez les meilleurs professionnels à Ingwiller. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#EC4899',
    },
    {
      name: 'saverne.pro',
      siteTitle: 'Saverne.PRO - Les Professionnels de Saverne',
      siteDescription: 'Trouvez les meilleurs professionnels à Saverne. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#6366F1',
    },
    {
      name: 'schiltigheim.pro',
      siteTitle: 'Schiltigheim.PRO - Les Professionnels de Schiltigheim',
      siteDescription: 'Trouvez les meilleurs professionnels à Schiltigheim. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#14B8A6',
    },
    {
      name: 'schweighouse.pro',
      siteTitle: 'Schweighouse-sur-Moder.PRO - Les Professionnels',
      siteDescription: 'Trouvez les meilleurs professionnels à Schweighouse-sur-Moder. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#F97316',
    },
    {
      name: 'souffelweyersheim.pro',
      siteTitle: 'Souffelweyersheim.PRO - Les Professionnels',
      siteDescription: 'Trouvez les meilleurs professionnels à Souffelweyersheim. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#A855F7',
    },
    {
      name: 'soufflenheim.pro',
      siteTitle: 'Soufflenheim.PRO - Les Professionnels de Soufflenheim',
      siteDescription: 'Trouvez les meilleurs professionnels à Soufflenheim. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#06B6D4',
    },
    {
      name: 'wissembourg.pro',
      siteTitle: 'Wissembourg.PRO - Les Professionnels de Wissembourg',
      siteDescription: 'Trouvez les meilleurs professionnels à Wissembourg. Annuaire complet des entreprises locales.',
      isActive: true,
      primaryColor: '#84CC16',
    },
  ];

  // Domain'leri oluştur veya güncelle
  for (const domain of domains) {
    const existingDomain = await prisma.domain.findUnique({
      where: { name: domain.name },
    });

    if (existingDomain) {
      console.log(`✅ Domain already exists: ${domain.name}`);
      await prisma.domain.update({
        where: { name: domain.name },
        data: {
          siteTitle: domain.siteTitle,
          siteDescription: domain.siteDescription,
          isActive: domain.isActive,
          primaryColor: domain.primaryColor,
        },
      });
      console.log(`   Updated: ${domain.siteTitle}`);
    } else {
      await prisma.domain.create({
        data: domain,
      });
      console.log(`✅ Created domain: ${domain.name}`);
    }
  }

  console.log('✅ 12 domains seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

