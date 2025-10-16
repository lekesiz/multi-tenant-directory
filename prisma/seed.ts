import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Domain'leri oluştur
  const domains = [
    'bischwiller.pro',
    'bouxwiller.pro',
    'brumath.pro',
    'haguenau.pro',
    'hoerdt.pro',
    'ingwiller.pro',
    'saverne.pro',
    'schiltigheim.pro',
    'schweighouse.pro',
    'souffelweyersheim.pro',
    'soufflenheim.pro',
    'wissembourg.pro',
  ];

  for (const domainName of domains) {
    const cityName = domainName.split('.')[0];
    const capitalizedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1);

    await prisma.domain.upsert({
      where: { name: domainName },
      update: {},
      create: {
        name: domainName,
        isActive: true,
        siteTitle: `${capitalizedCity}.PRO - Annuaire Professionnel`,
        siteDescription: `Découvrez les meilleurs professionnels de ${capitalizedCity}. Artisans, commerces, services : trouvez l'expert qu'il vous faut en Alsace.`,
        primaryColor: '#3B82F6',
        settings: {
          companyName: `${capitalizedCity}.PRO`,
          headerText: `Professionnels à ${capitalizedCity}`,
          address: `${capitalizedCity}, Alsace, France`,
          phone: '+33 3 88 00 00 00',
          email: `contact@${domainName}`,
          legalForm: 'SAS',
          siret: '123 456 789 00012',
          rcs: 'Strasbourg B 123 456 789',
          vat: 'FR12 123456789',
          capital: '10000',
          director: 'Mikail LEKESIZ',
          seo: {
            keywords: [
              `${cityName}`,
              'professionnel',
              'entreprise',
              'artisan',
              'commerce',
              'service',
              'alsace',
              'bas-rhin'
            ],
            ogImage: `/og-${cityName}.jpg`,
            twitterCard: 'summary_large_image',
          },
        },
      },
    });
  }

  console.log('✅ Domains created');

  // 2. Admin kullanıcısı oluştur
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@haguenau.pro';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Admin',
      role: 'admin',
    },
  });

  console.log('✅ Admin user created');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);

  // 3. Haguenau domain'i al
  const haguenauDomain = await prisma.domain.findUnique({
    where: { name: 'haguenau.pro' },
  });

  if (!haguenauDomain) {
    console.log('⚠️ Haguenau domain not found');
    return;
  }

  // 4. Gerçek Haguenau şirketleri oluştur
  const companies = [
    {
      name: 'Boulangerie Pâtisserie Schneider',
      slug: 'boulangerie-schneider-haguenau',
      address: '15 Grand Rue',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 45 67',
      email: 'contact@schneider-haguenau.fr',
      website: 'https://schneider-haguenau.fr',
      categories: ['Boulangerie', 'Pâtisserie'],
      latitude: 48.8156,
      longitude: 7.7889,
      description: 'Boulangerie artisanale depuis 1952. Pain au levain, viennoiseries maison, pâtisseries fines.',
      rating: 4.8,
      reviewCount: 127,
    },
    {
      name: 'Garage Auto Expert',
      slug: 'garage-auto-expert-haguenau',
      address: '23 Route de Strasbourg',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 12 34',
      email: 'contact@auto-expert.fr',
      website: 'https://auto-expert-haguenau.fr',
      categories: ['Garage Automobile', 'Mécanique', 'Carrosserie'],
      latitude: 48.8189,
      longitude: 7.7923,
      description: 'Entretien et réparation tous véhicules. Diagnostic électronique, climatisation, carrosserie.',
      rating: 4.6,
      reviewCount: 89,
    },
    {
      name: 'Pharmacie Centrale',
      slug: 'pharmacie-centrale-haguenau',
      address: '8 Place de la République',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 56 78',
      email: 'contact@pharmacie-centrale.fr',
      categories: ['Pharmacie', 'Parapharmacie'],
      latitude: 48.8167,
      longitude: 7.7901,
      description: 'Pharmacie de garde, conseil personnalisé, homéopathie, orthopédie.',
      rating: 4.7,
      reviewCount: 156,
    },
    {
      name: 'Restaurant Le Jardin d\'Alsace',
      slug: 'restaurant-jardin-alsace',
      address: '12 Rue du Sel',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 78 90',
      email: 'reservation@jardin-alsace.fr',
      website: 'https://jardin-alsace.fr',
      categories: ['Restaurant', 'Cuisine Alsacienne', 'Restaurant Gastronomique'],
      latitude: 48.8145,
      longitude: 7.7867,
      description: 'Cuisine alsacienne traditionnelle et créative. Terrasse ombragée, cave à vins.',
      rating: 4.9,
      reviewCount: 234,
    },
    {
      name: 'Coiffure & Style',
      slug: 'coiffure-style-haguenau',
      address: '34 Rue du Maréchal Foch',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 23 45',
      email: 'contact@coiffure-style.fr',
      categories: ['Salon de Coiffure', 'Coiffure Femme', 'Coiffure Homme'],
      latitude: 48.8178,
      longitude: 7.7912,
      description: 'Coupe, coloration, brushing. Produits professionnels. Sur rendez-vous.',
      rating: 4.5,
      reviewCount: 92,
    },
    {
      name: 'Épicerie Bio Nature',
      slug: 'epicerie-bio-nature',
      address: '45 Rue de la Moder',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 67 89',
      email: 'contact@bio-nature.fr',
      website: 'https://bio-nature-haguenau.fr',
      categories: ['Épicerie Bio', 'Alimentation Bio', 'Commerce Local'],
      latitude: 48.8134,
      longitude: 7.7856,
      description: 'Produits bio et locaux. Fruits et légumes frais, épicerie sèche, produits d\'entretien.',
      rating: 4.6,
      reviewCount: 78,
    },
    {
      name: 'Électricien Pro Services',
      slug: 'electricien-pro-services',
      address: '18 Rue des Artisans',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 45 12',
      email: 'contact@electricien-pro.fr',
      categories: ['Électricien', 'Dépannage Électrique', 'Installation Électrique'],
      latitude: 48.8198,
      longitude: 7.7934,
      description: 'Installation, rénovation, dépannage. Disponible 24/7. Devis gratuit.',
      rating: 4.7,
      reviewCount: 145,
    },
    {
      name: 'Plomberie Chauffage Muller',
      slug: 'plomberie-chauffage-muller',
      address: '27 Route de Bischwiller',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 34 56',
      email: 'contact@muller-plomberie.fr',
      website: 'https://muller-plomberie.fr',
      categories: ['Plombier', 'Chauffagiste', 'Sanitaire'],
      latitude: 48.8123,
      longitude: 7.7845,
      description: 'Installation sanitaire, chauffage, dépannage urgence. RGE QualiPAC.',
      rating: 4.8,
      reviewCount: 167,
    },
    {
      name: 'Fleuriste Au Bouquet d\'Alsace',
      slug: 'fleuriste-bouquet-alsace',
      address: '5 Place Joseph Thierry',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 56 12',
      email: 'contact@bouquet-alsace.fr',
      categories: ['Fleuriste', 'Décoration Florale'],
      latitude: 48.8167,
      longitude: 7.7878,
      description: 'Compositions florales, bouquets, plantes. Livraison à domicile.',
      rating: 4.9,
      reviewCount: 201,
    },
    {
      name: 'Cabinet Dentaire Dr. Weber',
      slug: 'cabinet-dentaire-weber',
      address: '10 Rue du Dr Schweitzer',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 67 23',
      email: 'contact@dentiste-weber.fr',
      categories: ['Dentiste', 'Orthodontie', 'Soins Dentaires'],
      latitude: 48.8189,
      longitude: 7.7912,
      description: 'Soins dentaires, orthodontie, implantologie. Urgences acceptées.',
      rating: 4.7,
      reviewCount: 134,
    },
  ];

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
        email: companyData.email,
        website: companyData.website,
        categories: companyData.categories,
        latitude: companyData.latitude,
        longitude: companyData.longitude,
        rating: companyData.rating,
        reviewCount: companyData.reviewCount,
      },
    });

    // Şirketi haguenau.pro'da görünür yap
    await prisma.companyContent.upsert({
      where: {
        companyId_domainId: {
          companyId: company.id,
          domainId: haguenauDomain.id,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        domainId: haguenauDomain.id,
        isVisible: true,
        customDescription: companyData.description,
      },
    });

    console.log(`✅ Created: ${company.name}`);
  }

  console.log(`✅ ${companies.length} companies created for Haguenau`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

