import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple production seed...');

  // 1. Create Domains
  console.log('📍 Creating domains...');
  
  const domainNames = [
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

  const createdDomains = [];
  for (const name of domainNames) {
    const domain = await prisma.domain.upsert({
      where: { name },
      update: {},
      create: {
        name,
        siteTitle: `${name.split('.')[0].charAt(0).toUpperCase() + name.split('.')[0].slice(1)}.PRO`,
        siteDescription: `Trouvez les meilleurs professionnels à ${name.split('.')[0]}`,
        isActive: true,
      },
    });
    createdDomains.push(domain);
    console.log(`  ✓ ${name}`);
  }

  // 2. Create Admin User
  console.log('👤 Creating admin user...');
  
  const hashedPassword = await bcrypt.hash('changeme123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@haguenau.pro' },
    update: {},
    create: {
      email: 'admin@haguenau.pro',
      passwordHash: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  });
  console.log(`  ✓ Admin user created: ${adminUser.email}`);

  // 3. Create Sample Companies
  console.log('🏢 Creating sample companies...');

  const companies = [
    {
      name: 'Boulangerie Pâtisserie Dupont',
      slug: 'boulangerie-patisserie-dupont',
      address: '15 Rue du Marché',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 45 67',
      email: 'contact@boulangerie-dupont.fr',
      website: 'https://www.boulangerie-dupont.fr',
      categories: ['Boulangerie', 'Pâtisserie'],
      domains: ['haguenau.pro', 'brumath.pro'],
    },
    {
      name: 'Restaurant Le Gourmet',
      slug: 'restaurant-le-gourmet',
      address: '8 Place de la République',
      city: 'Saverne',
      postalCode: '67700',
      phone: '03 88 91 12 34',
      email: 'contact@legourmet.fr',
      website: 'https://www.legourmet.fr',
      categories: ['Restaurant', 'Gastronomie'],
      domains: ['saverne.pro', 'haguenau.pro'],
    },
    {
      name: 'Coiffure Élégance',
      slug: 'coiffure-elegance',
      address: '23 Avenue de la Gare',
      city: 'Schiltigheim',
      postalCode: '67300',
      phone: '03 88 83 56 78',
      email: 'contact@coiffure-elegance.fr',
      categories: ['Coiffeur', 'Beauté'],
      domains: ['schiltigheim.pro', 'haguenau.pro'],
    },
    {
      name: 'Plomberie Chauffage Martin',
      slug: 'plomberie-chauffage-martin',
      address: '45 Rue de Strasbourg',
      city: 'Brumath',
      postalCode: '67170',
      phone: '03 88 51 23 45',
      email: 'contact@martin-plomberie.fr',
      website: 'https://www.martin-plomberie.fr',
      categories: ['Plombier', 'Chauffagiste', 'Services'],
      domains: ['brumath.pro', 'haguenau.pro', 'hoerdt.pro'],
    },
    {
      name: 'Pharmacie Centrale',
      slug: 'pharmacie-centrale',
      address: '12 Grand Rue',
      city: 'Wissembourg',
      postalCode: '67160',
      phone: '03 88 94 67 89',
      email: 'contact@pharmacie-centrale.fr',
      categories: ['Pharmacie', 'Santé'],
      domains: ['wissembourg.pro', 'haguenau.pro'],
    },
    {
      name: 'Garage Auto Expert',
      slug: 'garage-auto-expert',
      address: '78 Route de Strasbourg',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 78 90',
      email: 'contact@auto-expert.fr',
      website: 'https://www.auto-expert.fr',
      categories: ['Garage', 'Mécanique', 'Services'],
      domains: ['haguenau.pro', 'brumath.pro', 'schiltigheim.pro'],
    },
    {
      name: 'Boucherie Charcuterie Schmitt',
      slug: 'boucherie-charcuterie-schmitt',
      address: '5 Rue du Commerce',
      city: 'Bischwiller',
      postalCode: '67240',
      phone: '03 88 63 45 67',
      email: 'contact@boucherie-schmitt.fr',
      categories: ['Boucherie', 'Charcuterie'],
      domains: ['bischwiller.pro', 'haguenau.pro'],
    },
    {
      name: 'Cabinet Dentaire Dr. Weber',
      slug: 'cabinet-dentaire-dr-weber',
      address: '34 Avenue du Général de Gaulle',
      city: 'Saverne',
      postalCode: '67700',
      phone: '03 88 91 56 78',
      email: 'contact@cabinet-weber.fr',
      categories: ['Dentiste', 'Santé'],
      domains: ['saverne.pro', 'haguenau.pro'],
    },
    {
      name: 'Fleuriste Au Jardin Fleuri',
      slug: 'fleuriste-au-jardin-fleuri',
      address: '19 Rue des Fleurs',
      city: 'Soufflenheim',
      postalCode: '67620',
      phone: '03 88 86 34 56',
      email: 'contact@jardin-fleuri.fr',
      categories: ['Fleuriste', 'Commerces'],
      domains: ['soufflenheim.pro', 'haguenau.pro'],
    },
    {
      name: 'Électricité Moderne',
      slug: 'electricite-moderne',
      address: '67 Rue de l\'Industrie',
      city: 'Hoerdt',
      postalCode: '67720',
      phone: '03 88 68 23 45',
      email: 'contact@electricite-moderne.fr',
      website: 'https://www.electricite-moderne.fr',
      categories: ['Électricien', 'Services'],
      domains: ['hoerdt.pro', 'haguenau.pro', 'brumath.pro'],
    },
    {
      name: 'Pizzeria Da Vinci',
      slug: 'pizzeria-da-vinci',
      address: '28 Rue Principale',
      city: 'Ingwiller',
      postalCode: '67340',
      phone: '03 88 89 45 67',
      email: 'contact@pizzeria-davinci.fr',
      categories: ['Restaurant', 'Pizzeria', 'Italien'],
      domains: ['ingwiller.pro', 'saverne.pro'],
    },
    {
      name: 'Institut de Beauté Zen',
      slug: 'institut-de-beaute-zen',
      address: '41 Avenue de la Paix',
      city: 'Schiltigheim',
      postalCode: '67300',
      phone: '03 88 83 67 89',
      email: 'contact@institut-zen.fr',
      categories: ['Institut de Beauté', 'Beauté', 'Bien-être'],
      domains: ['schiltigheim.pro', 'haguenau.pro'],
    },
  ];

  for (const companyData of companies) {
    const { domains: domainList, ...companyInfo } = companyData;

    const company = await prisma.company.upsert({
      where: { slug: companyInfo.slug },
      update: companyInfo,
      create: companyInfo,
    });

    // Create content for each domain
    for (const domainName of domainList) {
      const domain = createdDomains.find((d) => d.name === domainName);
      if (domain) {
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
          },
        });
      }
    }

    console.log(`  ✓ ${company.name}`);
  }

  console.log('✅ Production seed completed!');
  console.log(`📊 Summary:`);
  console.log(`   - ${createdDomains.length} domains created`);
  console.log(`   - 1 admin user created`);
  console.log(`   - ${companies.length} companies created`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

