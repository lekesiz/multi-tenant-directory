import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting business owner seed...');

  try {
    // Test business owner oluştur
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const owner = await prisma.businessOwner.create({
      data: {
        email: 'owner@netzinformatique.fr',
        password: hashedPassword,
        firstName: 'Mikail',
        lastName: 'Lekesiz',
        phone: '0388123456',
        emailVerified: new Date(),
      }
    });

    console.log('✅ Business owner created:', owner.email);

    // NETZ Informatique şirketini bul
    const company = await prisma.company.findFirst({
      where: { 
        OR: [
          { slug: 'netz-informatique' },
          { name: { contains: 'NETZ Informatique' } }
        ]
      }
    });

    if (company) {
      // Owner'ı şirkete bağla
      await prisma.companyOwnership.create({
        data: {
          companyId: company.id,
          ownerId: owner.id,
          role: 'owner',
          verified: true
        }
      });

      console.log('✅ Company ownership created');

      // Çalışma saatleri ekle
      await prisma.businessHours.create({
        data: {
          companyId: company.id,
          monday: { open: "09:00", close: "18:00", closed: false },
          tuesday: { open: "09:00", close: "18:00", closed: false },
          wednesday: { open: "09:00", close: "18:00", closed: false },
          thursday: { open: "09:00", close: "18:00", closed: false },
          friday: { open: "09:00", close: "18:00", closed: false },
          saturday: { closed: true },
          sunday: { closed: true },
        }
      });

      console.log('✅ Business hours created');

      // Örnek analytics ekle
      const today = new Date();
      await prisma.companyAnalytics.create({
        data: {
          companyId: company.id,
          date: today,
          profileViews: 45,
          uniqueVisitors: 32,
          phoneClicks: 8,
          websiteClicks: 12,
          emailClicks: 3,
          directionsClicks: 15,
          sourceOrganic: 20,
          sourceSearch: 18,
          sourceDirect: 7,
          sourceReferral: 0
        }
      });

      console.log('✅ Analytics created');
    } else {
      console.log('⚠️  No company found to link with business owner');
    }

    console.log('🎉 Business owner seed completed!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });