import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Bischwiller companies...');

  const domain = await prisma.domain.findUnique({
    where: { name: 'bischwiller.pro' },
  });

  if (!domain) {
    console.error('❌ Domain bischwiller.pro not found');
    return;
  }

  const companies = [
    {
      name: 'Boulangerie Pâtisserie Schmitt',
      slug: 'boulangerie-patisserie-schmitt-bischwiller',
      address: '15 Rue de la République',
      city: 'Bischwiller',
      postalCode: '67240',
      phone: '03 88 53 81 22',
      categories: ['Boulangerie', 'Pâtisserie'],
      description: 'Boulangerie artisanale proposant pains traditionnels et pâtisseries maison.',
    },
    {
      name: 'Restaurant Au Bœuf',
      slug: 'restaurant-au-boeuf-bischwiller',
      address: '28 Rue Nationale',
      city: 'Bischwiller',
      postalCode: '67240',
      phone: '03 88 53 82 33',
      categories: ['Restaurant', 'Cuisine Française'],
      description: 'Restaurant traditionnel alsacien, spécialités de la région.',
    },
    {
      name: 'Pharmacie Centrale',
      slug: 'pharmacie-centrale-bischwiller',
      address: '42 Rue de la Gare',
      city: 'Bischwiller',
      postalCode: '67240',
      phone: '03 88 53 83 44',
      categories: ['Pharmacie', 'Santé'],
      description: 'Pharmacie de garde, conseils santé et parapharmacie.',
    },
    {
      name: 'Garage Renault Bischwiller',
      slug: 'garage-renault-bischwiller',
      address: '5 Route de Haguenau',
      city: 'Bischwiller',
      postalCode: '67240',
      phone: '03 88 53 84 55',
      categories: ['Garage', 'Automobile'],
      description: 'Garage agréé Renault, vente et réparation de véhicules.',
    },
    {
      name: 'Coiffure Élégance',
      slug: 'coiffure-elegance-bischwiller',
      address: '18 Rue du Général de Gaulle',
      city: 'Bischwiller',
      postalCode: '67240',
      phone: '03 88 53 85 66',
      categories: ['Coiffure', 'Beauté'],
      description: 'Salon de coiffure mixte, coloration et soins capillaires.',
    },
  ];

  let created = 0;

  for (const companyData of companies) {
    const company = await prisma.company.upsert({
      where: { slug: companyData.slug },
      update: {},
      create: {
        name: companyData.name,
        slug: companyData.slug,
        address: companyData.address,
        city: companyData.city,
        postalCode: companyData.postalCode,
        phone: companyData.phone,
        categories: companyData.categories,
      },
    });

    await prisma.companyContent.upsert({
      where: {
        companyId_domainId: {
          companyId: company.id,
          domainId: domain.id,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        domainId: domain.id,
        customDescription: companyData.description,
        isVisible: true,
      },
    });

    created++;
    console.log(`  ✅ ${companyData.name}`);
  }

  console.log(`✅ ${created} companies created for Bischwiller`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
