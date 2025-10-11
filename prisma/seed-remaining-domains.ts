import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kalan 7 domain için şirketler
const REMAINING_COMPANIES = {
  'bouxwiller.pro': [
    {
      name: 'Restaurant La Couronne',
      slug: 'restaurant-couronne-bouxwiller',
      address: '10 Grand Rue',
      city: 'Bouxwiller',
      postalCode: '67330',
      phone: '03 88 70 12 34',
      email: 'contact@lacouronne-bouxwiller.fr',
      categories: ['Restaurant', 'Cuisine Traditionnelle'],
    },
    {
      name: 'Garage Bouxwiller Auto',
      slug: 'garage-bouxwiller-auto',
      address: '25 Route de Saverne',
      city: 'Bouxwiller',
      postalCode: '67330',
      phone: '03 88 70 45 67',
      email: 'garage.bouxwiller@orange.fr',
      categories: ['Garage', 'Automobile', 'Réparation'],
    },
    {
      name: 'Pharmacie de Bouxwiller',
      slug: 'pharmacie-bouxwiller',
      address: '3 Place du Château',
      city: 'Bouxwiller',
      postalCode: '67330',
      phone: '03 88 70 78 90',
      email: 'pharmacie.bouxwiller@gmail.com',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Coiffure Élégance',
      slug: 'coiffure-elegance-bouxwiller',
      address: '18 Rue du Général Leclerc',
      city: 'Bouxwiller',
      postalCode: '67330',
      phone: '03 88 70 23 45',
      email: 'coiffure.elegance@wanadoo.fr',
      categories: ['Coiffure', 'Beauté'],
    },
    {
      name: 'Boulangerie Pâtisserie Meyer',
      slug: 'boulangerie-meyer-bouxwiller',
      address: '7 Rue Principale',
      city: 'Bouxwiller',
      postalCode: '67330',
      phone: '03 88 70 56 78',
      email: 'boulangerie.meyer@gmail.com',
      categories: ['Boulangerie', 'Pâtisserie', 'Commerce'],
    },
  ],
  'hoerdt.pro': [
    {
      name: 'Restaurant Le Relais',
      slug: 'restaurant-relais-hoerdt',
      address: '12 Rue de Strasbourg',
      city: 'Hoerdt',
      postalCode: '67720',
      phone: '03 88 68 12 34',
      email: 'contact@lerelais-hoerdt.fr',
      categories: ['Restaurant', 'Brasserie'],
    },
    {
      name: 'Garage Hoerdt Service',
      slug: 'garage-hoerdt-service',
      address: '28 Route de Bischwiller',
      city: 'Hoerdt',
      postalCode: '67720',
      phone: '03 88 68 45 67',
      email: 'garage.hoerdt@orange.fr',
      categories: ['Garage', 'Automobile', 'Service'],
    },
    {
      name: 'Pharmacie Hoerdt',
      slug: 'pharmacie-hoerdt',
      address: '5 Place de la Mairie',
      city: 'Hoerdt',
      postalCode: '67720',
      phone: '03 88 68 78 90',
      email: 'pharmacie.hoerdt@gmail.com',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Salon de Coiffure Moderne',
      slug: 'salon-moderne-hoerdt',
      address: '15 Rue du Général de Gaulle',
      city: 'Hoerdt',
      postalCode: '67720',
      phone: '03 88 68 23 45',
      email: 'salon.moderne.hoerdt@wanadoo.fr',
      categories: ['Coiffure', 'Beauté'],
    },
    {
      name: 'Boulangerie Artisanale Hoerdt',
      slug: 'boulangerie-artisanale-hoerdt',
      address: '9 Grand Rue',
      city: 'Hoerdt',
      postalCode: '67720',
      phone: '03 88 68 56 78',
      email: 'boulangerie.hoerdt@gmail.com',
      categories: ['Boulangerie', 'Pâtisserie', 'Commerce'],
    },
  ],
  'ingwiller.pro': [
    {
      name: 'Restaurant Au Lion d\'Or',
      slug: 'restaurant-lion-or-ingwiller',
      address: '14 Rue de la République',
      city: 'Ingwiller',
      postalCode: '67340',
      phone: '03 88 89 12 34',
      email: 'contact@liondor-ingwiller.fr',
      categories: ['Restaurant', 'Hôtel'],
    },
    {
      name: 'Garage Ingwiller Auto',
      slug: 'garage-ingwiller-auto',
      address: '32 Route de Bouxwiller',
      city: 'Ingwiller',
      postalCode: '67340',
      phone: '03 88 89 45 67',
      email: 'garage.ingwiller@orange.fr',
      categories: ['Garage', 'Automobile', 'Réparation'],
    },
    {
      name: 'Pharmacie Ingwiller',
      slug: 'pharmacie-ingwiller',
      address: '6 Place du Marché',
      city: 'Ingwiller',
      postalCode: '67340',
      phone: '03 88 89 78 90',
      email: 'pharmacie.ingwiller@gmail.com',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Coiffure Création Ingwiller',
      slug: 'coiffure-creation-ingwiller',
      address: '20 Grand Rue',
      city: 'Ingwiller',
      postalCode: '67340',
      phone: '03 88 89 23 45',
      email: 'coiffure.creation.ingwiller@wanadoo.fr',
      categories: ['Coiffure', 'Beauté'],
    },
    {
      name: 'Boulangerie Pâtisserie Ingwiller',
      slug: 'boulangerie-patisserie-ingwiller',
      address: '11 Rue Principale',
      city: 'Ingwiller',
      postalCode: '67340',
      phone: '03 88 89 56 78',
      email: 'boulangerie.ingwiller@gmail.com',
      categories: ['Boulangerie', 'Pâtisserie', 'Commerce'],
    },
  ],
  'schweighouse.pro': [
    {
      name: 'Restaurant Le Jardin',
      slug: 'restaurant-jardin-schweighouse',
      address: '8 Rue de la Forêt',
      city: 'Schweighouse-sur-Moder',
      postalCode: '67590',
      phone: '03 88 72 12 34',
      email: 'contact@lejardin-schweighouse.fr',
      categories: ['Restaurant', 'Cuisine Française'],
    },
    {
      name: 'Garage Schweighouse Service',
      slug: 'garage-schweighouse-service',
      address: '22 Route de Haguenau',
      city: 'Schweighouse-sur-Moder',
      postalCode: '67590',
      phone: '03 88 72 45 67',
      email: 'garage.schweighouse@orange.fr',
      categories: ['Garage', 'Automobile', 'Service'],
    },
    {
      name: 'Pharmacie Schweighouse',
      slug: 'pharmacie-schweighouse',
      address: '4 Place de la Mairie',
      city: 'Schweighouse-sur-Moder',
      postalCode: '67590',
      phone: '03 88 72 78 90',
      email: 'pharmacie.schweighouse@gmail.com',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Salon de Beauté Schweighouse',
      slug: 'salon-beaute-schweighouse',
      address: '16 Rue Principale',
      city: 'Schweighouse-sur-Moder',
      postalCode: '67590',
      phone: '03 88 72 23 45',
      email: 'salon.beaute.schweighouse@wanadoo.fr',
      categories: ['Beauté', 'Esthétique', 'Coiffure'],
    },
    {
      name: 'Boulangerie Schweighouse',
      slug: 'boulangerie-schweighouse',
      address: '10 Grand Rue',
      city: 'Schweighouse-sur-Moder',
      postalCode: '67590',
      phone: '03 88 72 56 78',
      email: 'boulangerie.schweighouse@gmail.com',
      categories: ['Boulangerie', 'Pâtisserie', 'Commerce'],
    },
  ],
  'souffelweyersheim.pro': [
    {
      name: 'Restaurant La Table Gourmande',
      slug: 'restaurant-table-gourmande-souffelweyersheim',
      address: '15 Route de Strasbourg',
      city: 'Souffelweyersheim',
      postalCode: '67460',
      phone: '03 88 20 12 34',
      email: 'contact@tablegourmande.fr',
      categories: ['Restaurant', 'Gastronomie'],
    },
    {
      name: 'Garage Auto Expert Souffelweyersheim',
      slug: 'garage-auto-expert-souffelweyersheim',
      address: '38 Avenue de la Liberté',
      city: 'Souffelweyersheim',
      postalCode: '67460',
      phone: '03 88 20 45 67',
      email: 'garage.autoexpert@orange.fr',
      categories: ['Garage', 'Automobile', 'Réparation'],
    },
    {
      name: 'Pharmacie Souffelweyersheim',
      slug: 'pharmacie-souffelweyersheim',
      address: '7 Place de la République',
      city: 'Souffelweyersheim',
      postalCode: '67460',
      phone: '03 88 20 78 90',
      email: 'pharmacie.souffelweyersheim@gmail.com',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Coiffure Studio Souffelweyersheim',
      slug: 'coiffure-studio-souffelweyersheim',
      address: '24 Rue du Général Leclerc',
      city: 'Souffelweyersheim',
      postalCode: '67460',
      phone: '03 88 20 23 45',
      email: 'coiffure.studio.souffel@wanadoo.fr',
      categories: ['Coiffure', 'Beauté'],
    },
    {
      name: 'Boulangerie Pâtisserie Souffelweyersheim',
      slug: 'boulangerie-patisserie-souffelweyersheim',
      address: '12 Grand Rue',
      city: 'Souffelweyersheim',
      postalCode: '67460',
      phone: '03 88 20 56 78',
      email: 'boulangerie.souffel@gmail.com',
      categories: ['Boulangerie', 'Pâtisserie', 'Commerce'],
    },
  ],
  'soufflenheim.pro': [
    {
      name: 'Restaurant Au Bœuf',
      slug: 'restaurant-boeuf-soufflenheim',
      address: '9 Rue Principale',
      city: 'Soufflenheim',
      postalCode: '67620',
      phone: '03 88 86 12 34',
      email: 'contact@auboeuf-soufflenheim.fr',
      categories: ['Restaurant', 'Cuisine Traditionnelle'],
    },
    {
      name: 'Garage Soufflenheim Auto',
      slug: 'garage-soufflenheim-auto',
      address: '26 Route de Haguenau',
      city: 'Soufflenheim',
      postalCode: '67620',
      phone: '03 88 86 45 67',
      email: 'garage.soufflenheim@orange.fr',
      categories: ['Garage', 'Automobile', 'Service'],
    },
    {
      name: 'Pharmacie Soufflenheim',
      slug: 'pharmacie-soufflenheim',
      address: '3 Place de la Mairie',
      city: 'Soufflenheim',
      postalCode: '67620',
      phone: '03 88 86 78 90',
      email: 'pharmacie.soufflenheim@gmail.com',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Coiffure Moderne Soufflenheim',
      slug: 'coiffure-moderne-soufflenheim',
      address: '17 Grand Rue',
      city: 'Soufflenheim',
      postalCode: '67620',
      phone: '03 88 86 23 45',
      email: 'coiffure.moderne.soufflenheim@wanadoo.fr',
      categories: ['Coiffure', 'Beauté'],
    },
    {
      name: 'Boulangerie Artisanale Soufflenheim',
      slug: 'boulangerie-artisanale-soufflenheim',
      address: '8 Rue du Marché',
      city: 'Soufflenheim',
      postalCode: '67620',
      phone: '03 88 86 56 78',
      email: 'boulangerie.soufflenheim@gmail.com',
      categories: ['Boulangerie', 'Pâtisserie', 'Commerce'],
    },
  ],
  'wissembourg.pro': [
    {
      name: 'Restaurant L\'Ange',
      slug: 'restaurant-ange-wissembourg',
      address: '2 Rue de la République',
      city: 'Wissembourg',
      postalCode: '67160',
      phone: '03 88 94 12 34',
      email: 'contact@lange-wissembourg.fr',
      website: 'https://lange-wissembourg.fr',
      categories: ['Restaurant', 'Gastronomie', 'Hôtel'],
    },
    {
      name: 'Garage Wissembourg Auto',
      slug: 'garage-wissembourg-auto',
      address: '35 Route de Strasbourg',
      city: 'Wissembourg',
      postalCode: '67160',
      phone: '03 88 94 45 67',
      email: 'garage.wissembourg@orange.fr',
      categories: ['Garage', 'Automobile', 'Réparation'],
    },
    {
      name: 'Pharmacie de Wissembourg',
      slug: 'pharmacie-wissembourg',
      address: '11 Place de la République',
      city: 'Wissembourg',
      postalCode: '67160',
      phone: '03 88 94 78 90',
      email: 'pharmacie.wissembourg@gmail.com',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Salon de Coiffure Élégance',
      slug: 'salon-elegance-wissembourg',
      address: '23 Rue Nationale',
      city: 'Wissembourg',
      postalCode: '67160',
      phone: '03 88 94 23 45',
      email: 'salon.elegance.wissembourg@wanadoo.fr',
      categories: ['Coiffure', 'Beauté'],
    },
    {
      name: 'Boulangerie Pâtisserie Wissembourg',
      slug: 'boulangerie-patisserie-wissembourg',
      address: '14 Grand Rue',
      city: 'Wissembourg',
      postalCode: '67160',
      phone: '03 88 94 56 78',
      email: 'boulangerie.wissembourg@gmail.com',
      categories: ['Boulangerie', 'Pâtisserie', 'Commerce'],
    },
  ],
};

async function main() {
  console.log('🌱 Starting remaining domains companies seed...\n');

  // Get all domains
  const domains = await prisma.domain.findMany();
  console.log(`📍 Found ${domains.length} domains\n`);

  let totalCreated = 0;
  let totalLinked = 0;

  for (const domain of domains) {
    const companies = REMAINING_COMPANIES[domain.name as keyof typeof REMAINING_COMPANIES];
    
    if (!companies) {
      continue;
    }

    console.log(`🏢 Processing ${domain.name}...`);

    for (const companyData of companies) {
      // Create company
      const company = await prisma.company.upsert({
        where: { slug: companyData.slug },
        update: companyData,
        create: companyData,
      });

      totalCreated++;
      console.log(`  ✅ ${company.name}`);

      // Link to its primary domain
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
          customDescription: `${company.name} - Votre professionnel de confiance à ${companyData.city}`,
        },
      });

      totalLinked++;
    }

    console.log(`  ✅ ${companies.length} companies created for ${domain.name}\n`);
  }

  console.log('📊 Statistics:');
  console.log(`  - Companies created: ${totalCreated}`);
  console.log(`  - Domain links created: ${totalLinked}`);

  // Overall statistics
  const totalCompanies = await prisma.company.count();
  const totalDomains = await prisma.domain.count();
  const totalLinks = await prisma.companyContent.count();

  console.log('\n📈 Overall Statistics:');
  console.log(`  - Total Domains: ${totalDomains}`);
  console.log(`  - Total Companies: ${totalCompanies}`);
  console.log(`  - Total Links: ${totalLinks}`);
  console.log(`  - Average companies per domain: ${(totalLinks / totalDomains).toFixed(1)}`);

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

