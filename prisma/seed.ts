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
    await prisma.domain.upsert({
      where: { name: domainName },
      update: {},
      create: {
        name: domainName,
        isActive: true,
        settings: {
          title: `${domainName.split('.')[0].charAt(0).toUpperCase() + domainName.split('.')[0].slice(1)} - Professionnels Locaux`,
          description: `Trouvez les meilleurs professionnels à ${domainName.split('.')[0]}`,
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

  // 3. Örnek şirketler oluştur (opsiyonel)
  const exampleCompany = await prisma.company.upsert({
    where: { slug: 'exemple-entreprise' },
    update: {},
    create: {
      name: 'Exemple Entreprise',
      slug: 'exemple-entreprise',
      address: '1 Rue Principale',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 00 00 00',
      email: 'contact@exemple.fr',
      website: 'https://exemple.fr',
      categories: ['Restaurant', 'Café'],
      latitude: 48.8156,
      longitude: 7.7889,
    },
  });

  // Şirketi haguenau.pro'da görünür yap
  const haguenauDomain = await prisma.domain.findUnique({
    where: { name: 'haguenau.pro' },
  });

  if (haguenauDomain) {
    await prisma.companyContent.upsert({
      where: {
        companyId_domainId: {
          companyId: exampleCompany.id,
          domainId: haguenauDomain.id,
        },
      },
      update: {},
      create: {
        companyId: exampleCompany.id,
        domainId: haguenauDomain.id,
        isVisible: true,
        customDescription:
          'Une entreprise exemple pour tester la plateforme.',
      },
    });
  }

  console.log('✅ Example company created');
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

