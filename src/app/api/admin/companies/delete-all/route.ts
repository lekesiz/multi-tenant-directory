import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { verifyAdminSecret } from '@/lib/admin-secret';

/**
 * DELETE /api/admin/companies/delete-all
 * Tüm şirketleri ve ilişkili verileri siler
 * UYARI: Bu işlem geri alınamaz!
 */
export async function DELETE(request: Request) {
  try {
    // Admin authentication check (fail-closed, constant-time)
    const unauthorized = verifyAdminSecret(request);
    if (unauthorized) {
      return unauthorized;
    }

    logger.info('🗑️  Tüm şirketler siliniyor...');
    
    // İlişkili verileri sil
    logger.info('1. İlişkili veriler siliniyor...');
    
    await prisma.reviewVote.deleteMany({});
    await prisma.reviewReport.deleteMany({});
    await prisma.reviewReply.deleteMany({});
    await prisma.review.deleteMany({});
    
    await prisma.companyAnalytics.deleteMany({});
    await prisma.businessHours.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.companyContent.deleteMany({});
    await prisma.companyOwnership.deleteMany({});
    await prisma.companySubscription.deleteMany({});
    await prisma.contactInquiry.deleteMany({});
    
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.coupon.deleteMany({});
    await prisma.customerJourney.deleteMany({});
    await prisma.leadScore.deleteMany({});
    await prisma.notification.deleteMany({});
    
    logger.info('2. Şirketler siliniyor...');
    const result = await prisma.company.deleteMany({});
    
    logger.info(`✅ ${result.count} şirket başarıyla silindi!`);
    
    // Doğrulama
    const remaining = await prisma.company.count();
    
    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      remainingCount: remaining,
      message: `${result.count} şirket başarıyla silindi`
    });
    
  } catch (error: any) {
    logger.error('❌ Şirket silme hatası:', error);
    return NextResponse.json(
      { error: 'Şirketler silinirken hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

