import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newDomains = [
  { name: 'bas-rhin.pro', siteTitle: 'Bas-Rhin.PRO', siteDescription: 'Annuaire des Professionnels du Bas-Rhin', city: 'Bas-Rhin' },
  { name: 'bischwiller.pro', siteTitle: 'Bischwiller.PRO', siteDescription: 'Les Professionnels de Bischwiller', city: 'Bischwiller' },
  { name: 'bouxwiller.pro', siteTitle: 'Bouxwiller.PRO', siteDescription: 'Les Professionnels de Bouxwiller', city: 'Bouxwiller' },
  { name: 'brumath.pro', siteTitle: 'Brumath.PRO', siteDescription: 'Les Professionnels de Brumath', city: 'Brumath' },
  { name: 'erstein.pro', siteTitle: 'Erstein.PRO', siteDescription: 'Les Professionnels d\'Erstein', city: 'Erstein' },
  { name: 'geispolsheim.pro', siteTitle: 'Geispolsheim.PRO', siteDescription: 'Les Professionnels de Geispolsheim', city: 'Geispolsheim' },
  { name: 'haguenau.pro', siteTitle: 'Haguenau.PRO', siteDescription: 'Les Professionnels de Haguenau', city: 'Haguenau' },
  { name: 'hoerdt.pro', siteTitle: 'Hoerdt.PRO', siteDescription: 'Les Professionnels de Hoerdt', city: 'Hoerdt' },
  { name: 'illkirch.pro', siteTitle: 'Illkirch.PRO', siteDescription: 'Les Professionnels d\'Illkirch-Graffenstaden', city: 'Illkirch-Graffenstaden' },
  { name: 'ingwiller.pro', siteTitle: 'Ingwiller.PRO', siteDescription: 'Les Professionnels d\'Ingwiller', city: 'Ingwiller' },
  { name: 'ittenheim.pro', siteTitle: 'Ittenheim.PRO', siteDescription: 'Les Professionnels d\'Ittenheim', city: 'Ittenheim' },
  { name: 'ostwald.pro', siteTitle: 'Ostwald.PRO', siteDescription: 'Les Professionnels d\'Ostwald', city: 'Ostwald' },
  { name: 'saverne.pro', siteTitle: 'Saverne.PRO', siteDescription: 'Les Professionnels de Saverne', city: 'Saverne' },
  { name: 'schiltigheim.pro', siteTitle: 'Schiltigheim.PRO', siteDescription: 'Les Professionnels de Schiltigheim', city: 'Schiltigheim' },
  { name: 'schweighouse.pro', siteTitle: 'Schweighouse.PRO', siteDescription: 'Les Professionnels de Schweighouse-sur-Moder', city: 'Schweighouse-sur-Moder' },
  { name: 'souffelweyersheim.pro', siteTitle: 'Souffelweyersheim.PRO', siteDescription: 'Les Professionnels de Souffelweyersheim', city: 'Souffelweyersheim' },
  { name: 'soufflenheim.pro', siteTitle: 'Soufflenheim.PRO', siteDescription: 'Les Professionnels de Soufflenheim', city: 'Soufflenheim' },
  { name: 'vendenheim.pro', siteTitle: 'Vendenheim.PRO', siteDescription: 'Les Professionnels de Vendenheim', city: 'Vendenheim' },
  { name: 'wissembourg.pro', siteTitle: 'Wissembourg.PRO', siteDescription: 'Les Professionnels de Wissembourg', city: 'Wissembourg' },
  { name: 'mutzig.pro', siteTitle: 'Mutzig.PRO', siteDescription: 'Les Professionnels de Mutzig', city: 'Mutzig' },
];

async function main() {
  console.log('🌱 Creating 20 new domains...\n');

  // Önce eski domain'leri sil
  console.log('🗑️  Deleting old domains...');
  await prisma.companyContent.deleteMany({});
  await prisma.domain.deleteMany({});
  console.log('✅ Old domains deleted\n');

  // Yeni domain'leri oluştur
  for (const domainData of newDomains) {
    const domain = await prisma.domain.create({
      data: {
        name: domainData.name,
        siteTitle: domainData.siteTitle,
        siteDescription: domainData.siteDescription,
        primaryColor: '#2563EB',
        settings: {
          contactEmail: `contact@${domainData.name}`,
          city: domainData.city,
        },
      },
    });

    console.log(`  ✅ Created: ${domain.name}`);
  }

  console.log(`\n✅ ${newDomains.length} domains created successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
