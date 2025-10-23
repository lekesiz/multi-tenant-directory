import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * POST /api/admin/companies/sync-to-hub
 * Tüm şirketleri bas-rhin.pro hub'ında görünür yapar
 */
export async function POST(request: Request) {
  try {
    // Admin authentication check
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET || 'your-secret-key';
    
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('🔄 Tüm şirketler bas-rhin.pro hub\'ına senkronize ediliyor...');
    
    // Bas-rhin.pro domain'ini bul
    const hubDomain = await prisma.domain.findUnique({
      where: { name: 'bas-rhin.pro' }
    });
    
    if (!hubDomain) {
      return NextResponse.json(
        { error: 'Hub domain (bas-rhin.pro) bulunamadı' },
        { status: 404 }
      );
    }
    
    // Tüm aktif şirketleri al
    const allCompanies = await prisma.company.findMany({
      where: {
        isActive: true
      }
    });
    
    logger.info(`📊 ${allCompanies.length} şirket bulundu`);
    
    let syncedCount = 0;
    let skippedCount = 0;
    
    for (const company of allCompanies) {
      // Bu şirketin bas-rhin.pro'da CompanyContent'i var mı kontrol et
      const existingContent = await prisma.companyContent.findFirst({
        where: {
          companyId: company.id,
          domainId: hubDomain.id
        }
      });
      
      if (existingContent) {
        skippedCount++;
        continue;
      }
      
      // Şirketin orijinal domain'indeki content'ini al
      const originalContent = await prisma.companyContent.findFirst({
        where: {
          companyId: company.id
        }
      });
      
      // Bas-rhin.pro için CompanyContent oluştur
      await prisma.companyContent.create({
        data: {
          companyId: company.id,
          domainId: hubDomain.id,
          isVisible: true,
          customDescription: originalContent?.customDescription ?? undefined,
          customImages: originalContent?.customImages ?? undefined,
          promotions: originalContent?.promotions ?? undefined
        }
      });
      
      syncedCount++;
    }
    
    logger.info(`✅ ${syncedCount} şirket bas-rhin.pro'ya senkronize edildi`);
    logger.info(`⏭️  ${skippedCount} şirket zaten mevcut`);
    
    return NextResponse.json({
      success: true,
      totalCompanies: allCompanies.length,
      synced: syncedCount,
      skipped: skippedCount
    });
    
  } catch (error: any) {
    logger.error('❌ Senkronizasyon hatası:', error);
    return NextResponse.json(
      { error: 'Senkronizasyon sırasında hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

