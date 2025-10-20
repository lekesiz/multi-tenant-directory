import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDemoData() {
  console.log('🗑️  Demo veri temizliği başlıyor...\n');

  try {
    // 1. Yorumları sil
    const deletedReviews = await prisma.review.deleteMany({});
    console.log(`✅ ${deletedReviews.count} yorum silindi`);

    // 2. Şirketleri sil (cascade ile ownership'ler de silinecek)
    const deletedCompanies = await prisma.company.deleteMany({});
    console.log(`✅ ${deletedCompanies.count} şirket silindi`);

    // 3. Business owner'ları sil
    const deletedOwners = await prisma.businessOwner.deleteMany({});
    console.log(`✅ ${deletedOwners.count} işletme sahibi silindi`);

    // 4. Test kullanıcılarını sil (admin hariç)
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: { not: 'admin' }
      }
    });
    console.log(`✅ ${deletedUsers.count} kullanıcı silindi`);

    console.log('\n🎉 Demo veri temizliği tamamlandı!');
    console.log('\n📊 Korunan veriler:');
    console.log('   - Kategoriler (business_categories)');
    console.log('   - Admin kullanıcılar');
    console.log('   - Sistem ayarları');

  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDemoData();

