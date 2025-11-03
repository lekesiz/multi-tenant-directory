import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllCompanies() {
  console.log('🗑️  Tüm şirketler siliniyor...');
  
  try {
    // İlk önce ilişkili verileri sil
    console.log('1. İlişkili veriler siliniyor...');
    
    // Reviews ve ilişkili veriler
    await prisma.reviewVote.deleteMany({});
    await prisma.reviewReport.deleteMany({});
    await prisma.reviewReply.deleteMany({});
    await prisma.review.deleteMany({});
    
    // Company ilişkili veriler
    await prisma.companyAnalytics.deleteMany({});
    await prisma.businessHours.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.companyContent.deleteMany({});
    await prisma.companyOwnership.deleteMany({});
    await prisma.companySubscription.deleteMany({});
    await prisma.contactInquiry.deleteMany({});
    
    // Diğer ilişkili veriler
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.coupon.deleteMany({});
    await prisma.customerJourney.deleteMany({});
    await prisma.leadScore.deleteMany({});
    await prisma.notification.deleteMany({});
    
    console.log('2. Şirketler siliniyor...');
    const result = await prisma.company.deleteMany({});
    
    console.log(`✅ ${result.count} şirket başarıyla silindi!`);
    
    // Doğrulama
    const remaining = await prisma.company.count();
    console.log(`📊 Kalan şirket sayısı: ${remaining}`);
    
    if (remaining === 0) {
      console.log('🎉 Tüm şirketler başarıyla temizlendi!');
    } else {
      console.log('⚠️  Bazı şirketler silinemedi!');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllCompanies();

