import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Demo Veri Temizleme API
 * 
 * Bu endpoint, test ve demo verilerini güvenli bir şekilde temizler.
 * 
 * Silinecek veriler:
 * - isActive=false olan şirketler (onay bekleyen test kayıtları)
 * - İlişkili business owners
 * - İlişkili reviews, photos, analytics
 * 
 * Korunacak veriler:
 * - isActive=true olan gerçek şirketler
 * - Production verileri
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authentication kontrolü (basit bir token kontrolü)
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_CLEANUP_TOKEN;

    if (!authHeader || !adminToken || authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Body'den cleanup options al
    const body = await request.json();
    const { 
      deleteInactiveCompanies = true,
      deleteTestBusinessOwners = true,
      dryRun = false // Test modu: sadece sayıları göster, silme
    } = body;

    const results = {
      companiesDeleted: 0,
      businessOwnersDeleted: 0,
      reviewsDeleted: 0,
      photosDeleted: 0,
      analyticsDeleted: 0,
      dryRun,
    };

    if (dryRun) {
      // Dry run: sadece silinecek kayıt sayılarını say
      if (deleteInactiveCompanies) {
        const inactiveCompanies = await prisma.company.count({
          where: { isActive: false }
        });
        results.companiesDeleted = inactiveCompanies;

        // İlişkili verileri say
        const inactiveCompanyIds = await prisma.company.findMany({
          where: { isActive: false },
          select: { id: true }
        });
        const companyIds = inactiveCompanyIds.map(c => c.id);

        if (companyIds.length > 0) {
          results.reviewsDeleted = await prisma.review.count({
            where: { companyId: { in: companyIds } }
          });
          results.photosDeleted = await prisma.photo.count({
            where: { companyId: { in: companyIds } }
          });
          results.analyticsDeleted = await prisma.companyAnalytics.count({
            where: { companyId: { in: companyIds } }
          });
        }
      }

      if (deleteTestBusinessOwners) {
        // Test business owners (son 24 saat içinde oluşturulan, aktif olmayan şirketlere sahip)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const testOwners = await prisma.businessOwner.count({
          where: {
            createdAt: { gte: yesterday },
            companies: {
              every: { company: { isActive: false } }
            }
          }
        });
        results.businessOwnersDeleted = testOwners;
      }

      return NextResponse.json({
        success: true,
        message: 'Dry run completed. No data was deleted.',
        results,
      });
    }

    // Gerçek silme işlemi
    if (deleteInactiveCompanies) {
      // Önce ilişkili verileri sil
      const inactiveCompanyIds = await prisma.company.findMany({
        where: { isActive: false },
        select: { id: true }
      });
      const companyIds = inactiveCompanyIds.map(c => c.id);

      if (companyIds.length > 0) {
        // İlişkili verileri sil
        const reviewsResult = await prisma.review.deleteMany({
          where: { companyId: { in: companyIds } }
        });
        results.reviewsDeleted = reviewsResult.count;

        const photosResult = await prisma.photo.deleteMany({
          where: { companyId: { in: companyIds } }
        });
        results.photosDeleted = photosResult.count;

        const analyticsResult = await prisma.companyAnalytics.deleteMany({
          where: { companyId: { in: companyIds } }
        });
        results.analyticsDeleted = analyticsResult.count;

        // CompanyOwnership kayıtlarını sil
        await prisma.companyOwnership.deleteMany({
          where: { companyId: { in: companyIds } }
        });

        // CompanyContent kayıtlarını sil
        await prisma.companyContent.deleteMany({
          where: { companyId: { in: companyIds } }
        });

        // BusinessHours kayıtlarını sil
        await prisma.businessHours.deleteMany({
          where: { companyId: { in: companyIds } }
        });
      }

      // Şirketleri sil
      const companiesResult = await prisma.company.deleteMany({
        where: { isActive: false }
      });
      results.companiesDeleted = companiesResult.count;
    }

    if (deleteTestBusinessOwners) {
      // Test business owners (son 24 saat içinde oluşturulan, artık şirketi olmayan)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const ownersResult = await prisma.businessOwner.deleteMany({
        where: {
          createdAt: { gte: yesterday },
          companies: { none: {} } // Hiç şirketi olmayan owners
        }
      });
      results.businessOwnersDeleted = ownersResult.count;
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data cleanup completed successfully.',
      results,
    });

  } catch (error) {
    console.error('Demo data cleanup error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cleanup demo data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

