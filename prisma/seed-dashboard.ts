/**
 * Dashboard Tables Seed Data
 *
 * This seed creates:
 * - BusinessOwner (test account)
 * - CompanyOwnership (link to NETZ Informatique)
 * - BusinessHours (sample business hours)
 * - Sample analytics data
 *
 * ⚠️ IMPORTANT: This must be run with production DATABASE_URL
 * Run with: npx tsx prisma/seed-dashboard.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting dashboard seed...');

  // 1. Create test business owner
  console.log('Creating business owner...');

  const hashedPassword = await bcrypt.hash('netz2025!', 10);

  const owner = await prisma.businessOwner.upsert({
    where: { email: 'mikail@lekesiz.org' },
    update: {},
    create: {
      email: 'mikail@lekesiz.org',
      password: hashedPassword,
      firstName: 'Mikail',
      lastName: 'Lekesiz',
      phone: '0388907830',
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Business owner created: ${owner.email}`);

  // 2. Find NETZ Informatique company
  console.log('Finding NETZ Informatique...');

  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { slug: 'netz-informatique' },
        { name: { contains: 'NETZ', mode: 'insensitive' } },
      ],
    },
  });

  if (!company) {
    console.warn('⚠️  NETZ Informatique not found. Creating sample company...');

    const newCompany = await prisma.company.create({
      data: {
        name: 'NETZ Informatique',
        slug: 'netz-informatique',
        address: '12 Rue du Général Leclerc',
        city: 'Haguenau',
        postalCode: '67500',
        phone: '0388907830',
        email: 'contact@netzinformatique.fr',
        website: 'https://netzinformatique.fr',
        categories: [
          'Informatique',
          'Dépannage informatique',
          'Conseil en informatique',
          'Formation informatique',
        ],
        latitude: 48.8156,
        longitude: 7.7889,
        rating: 4.8,
        reviewCount: 12,
      },
    });

    console.log(`✅ Sample company created: ${newCompany.name}`);
  }

  const targetCompany = company || await prisma.company.findFirst({
    where: { slug: 'netz-informatique' },
  });

  if (!targetCompany) {
    throw new Error('❌ Could not find or create company');
  }

  // 3. Create ownership link
  console.log('Creating ownership link...');

  const ownership = await prisma.companyOwnership.upsert({
    where: {
      companyId_ownerId: {
        companyId: targetCompany.id,
        ownerId: owner.id,
      },
    },
    update: {},
    create: {
      companyId: targetCompany.id,
      ownerId: owner.id,
      role: 'owner',
      verified: true,
    },
  });

  console.log(`✅ Ownership created for company ID: ${targetCompany.id}`);

  // 4. Create business hours
  console.log('Creating business hours...');

  const existingHours = await prisma.businessHours.findUnique({
    where: { companyId: targetCompany.id },
  });

  if (!existingHours) {
    await prisma.businessHours.create({
      data: {
        companyId: targetCompany.id,
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { closed: true },
        sunday: { closed: true },
        timezone: 'Europe/Paris',
      },
    });

    console.log('✅ Business hours created');
  } else {
    console.log('ℹ️  Business hours already exist');
  }

  // 5. Create sample analytics data (last 7 days)
  console.log('Creating sample analytics...');

  const today = new Date();
  const analyticsData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    analyticsData.push({
      companyId: targetCompany.id,
      date,
      profileViews: Math.floor(Math.random() * 50) + 10,
      uniqueVisitors: Math.floor(Math.random() * 30) + 5,
      phoneClicks: Math.floor(Math.random() * 10),
      websiteClicks: Math.floor(Math.random() * 15),
      emailClicks: Math.floor(Math.random() * 5),
      directionsClicks: Math.floor(Math.random() * 8),
      sourceOrganic: Math.floor(Math.random() * 20) + 5,
      sourceSearch: Math.floor(Math.random() * 15) + 3,
      sourceDirect: Math.floor(Math.random() * 10),
      sourceReferral: Math.floor(Math.random() * 5),
    });
  }

  for (const data of analyticsData) {
    await prisma.companyAnalytics.upsert({
      where: {
        companyId_date: {
          companyId: data.companyId,
          date: data.date,
        },
      },
      update: data,
      create: data,
    });
  }

  console.log(`✅ Created ${analyticsData.length} days of analytics data`);

  // 6. Summary
  console.log('\n📊 Seed Summary:');
  console.log(`   - Business Owner: ${owner.email}`);
  console.log(`   - Company: ${targetCompany.name} (ID: ${targetCompany.id})`);
  console.log(`   - Ownership: Verified`);
  console.log(`   - Business Hours: Set`);
  console.log(`   - Analytics: Last 7 days`);
  console.log('\n🎉 Dashboard seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log(`   Email: ${owner.email}`);
  console.log(`   Password: netz2025!`);
  console.log('\n⚠️  Remember to change the password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
