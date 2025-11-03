#!/usr/bin/env node

/**
 * Database Cleanup Script
 * 
 * Bu script, test ve demo verilerini güvenli bir şekilde temizler.
 * 
 * Kullanım:
 *   node scripts/cleanup-database.js --dry-run
 *   node scripts/cleanup-database.js --production
 *   npm run cleanup:dry-run
 *   npm run cleanup:production
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isProduction = args.includes('--production');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

async function confirmProduction() {
  if (!isProduction) {
    return true;
  }

  log('⚠️  UYARI: Production veritabanında temizlik yapacaksınız!', 'red');
  log('Bu işlem geri alınamaz!', 'red');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question('\nDevam etmek istediğinizden emin misiniz? (yes/no): ', (answer) => {
      readline.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function cleanupInactiveCompanies(dryRun = true) {
  logSection('Aktif Olmayan Şirketleri Temizleme');

  try {
    // Önce silinecek şirketleri bul
    const inactiveCompanies = await prisma.company.findMany({
      where: { isActive: false },
      select: { 
        id: true, 
        name: true, 
        createdAt: true 
      }
    });

    log(`Bulunan aktif olmayan şirket sayısı: ${inactiveCompanies.length}`, 'cyan');

    if (inactiveCompanies.length === 0) {
      log('✓ Temizlenecek şirket yok', 'green');
      return { companiesDeleted: 0, reviewsDeleted: 0, photosDeleted: 0, analyticsDeleted: 0 };
    }

    // Şirketleri listele
    console.log('\nSilinecek şirketler:');
    inactiveCompanies.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name} (ID: ${company.id}, Oluşturulma: ${company.createdAt.toISOString().split('T')[0]})`);
    });

    if (dryRun) {
      log('\n✓ DRY RUN: Hiçbir veri silinmedi', 'yellow');
      
      // İlişkili verileri say
      const companyIds = inactiveCompanies.map(c => c.id);
      const reviewCount = await prisma.review.count({ where: { companyId: { in: companyIds } } });
      const photoCount = await prisma.photo.count({ where: { companyId: { in: companyIds } } });
      const analyticsCount = await prisma.companyAnalytics.count({ where: { companyId: { in: companyIds } } });

      log(`\nSilinecek ilişkili veriler:`, 'cyan');
      log(`  - Reviews: ${reviewCount}`, 'cyan');
      log(`  - Photos: ${photoCount}`, 'cyan');
      log(`  - Analytics: ${analyticsCount}`, 'cyan');

      return { 
        companiesDeleted: inactiveCompanies.length, 
        reviewsDeleted: reviewCount, 
        photosDeleted: photoCount, 
        analyticsDeleted: analyticsCount 
      };
    }

    // Gerçek silme işlemi
    const companyIds = inactiveCompanies.map(c => c.id);

    log('\nİlişkili verileri siliniyor...', 'yellow');

    // İlişkili verileri sil
    const reviewsResult = await prisma.review.deleteMany({
      where: { companyId: { in: companyIds } }
    });
    log(`✓ ${reviewsResult.count} review silindi`, 'green');

    const photosResult = await prisma.photo.deleteMany({
      where: { companyId: { in: companyIds } }
    });
    log(`✓ ${photosResult.count} photo silindi`, 'green');

    const analyticsResult = await prisma.companyAnalytics.deleteMany({
      where: { companyId: { in: companyIds } }
    });
    log(`✓ ${analyticsResult.count} analytics kaydı silindi`, 'green');

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

    // Şirketleri sil
    const companiesResult = await prisma.company.deleteMany({
      where: { isActive: false }
    });
    log(`✓ ${companiesResult.count} şirket silindi`, 'green');

    return {
      companiesDeleted: companiesResult.count,
      reviewsDeleted: reviewsResult.count,
      photosDeleted: photosResult.count,
      analyticsDeleted: analyticsResult.count
    };

  } catch (error) {
    log(`✗ Hata: ${error.message}`, 'red');
    throw error;
  }
}

async function cleanupTestBusinessOwners(dryRun = true) {
  logSection('Test Business Owners Temizleme');

  try {
    // Son 24 saat içinde oluşturulan, artık şirketi olmayan owners
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const testOwners = await prisma.businessOwner.findMany({
      where: {
        createdAt: { gte: yesterday },
        companies: { none: {} } // Hiç şirketi olmayan
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true
      }
    });

    log(`Bulunan test business owner sayısı: ${testOwners.length}`, 'cyan');

    if (testOwners.length === 0) {
      log('✓ Temizlenecek business owner yok', 'green');
      return { businessOwnersDeleted: 0 };
    }

    // Owners'ı listele
    console.log('\nSilinecek business owners:');
    testOwners.forEach((owner, index) => {
      console.log(`  ${index + 1}. ${owner.firstName} ${owner.lastName} (${owner.email}, Oluşturulma: ${owner.createdAt.toISOString().split('T')[0]})`);
    });

    if (dryRun) {
      log('\n✓ DRY RUN: Hiçbir veri silinmedi', 'yellow');
      return { businessOwnersDeleted: testOwners.length };
    }

    // Gerçek silme işlemi
    const ownersResult = await prisma.businessOwner.deleteMany({
      where: {
        createdAt: { gte: yesterday },
        companies: { none: {} }
      }
    });

    log(`✓ ${ownersResult.count} business owner silindi`, 'green');

    return { businessOwnersDeleted: ownersResult.count };

  } catch (error) {
    log(`✗ Hata: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  logSection('Database Cleanup Script');

  // Mod bilgisi
  if (isDryRun) {
    log('Mod: DRY RUN (Test modu - hiçbir veri silinmeyecek)', 'yellow');
  } else {
    log('Mod: PRODUCTION (Gerçek silme işlemi yapılacak)', 'red');
  }

  // Database bağlantısını kontrol et
  try {
    await prisma.$connect();
    log('✓ Veritabanı bağlantısı başarılı', 'green');
  } catch (error) {
    log('✗ Veritabanı bağlantısı başarısız', 'red');
    log(`Hata: ${error.message}`, 'red');
    process.exit(1);
  }

  // Production onayı
  if (!isDryRun) {
    const confirmed = await confirmProduction();
    if (!confirmed) {
      log('\n✗ İşlem iptal edildi', 'yellow');
      await prisma.$disconnect();
      process.exit(0);
    }
  }

  // Temizlik işlemlerini başlat
  const results = {
    companiesDeleted: 0,
    businessOwnersDeleted: 0,
    reviewsDeleted: 0,
    photosDeleted: 0,
    analyticsDeleted: 0
  };

  try {
    // 1. Aktif olmayan şirketleri temizle
    const companyResults = await cleanupInactiveCompanies(isDryRun);
    Object.assign(results, companyResults);

    // 2. Test business owners'ı temizle
    const ownerResults = await cleanupTestBusinessOwners(isDryRun);
    Object.assign(results, ownerResults);

    // Sonuçları göster
    logSection('Temizlik Sonuçları');
    
    console.log('Silinen/Silinecek veriler:');
    log(`  Şirketler:        ${results.companiesDeleted}`, 'cyan');
    log(`  Business Owners:  ${results.businessOwnersDeleted}`, 'cyan');
    log(`  Reviews:          ${results.reviewsDeleted}`, 'cyan');
    log(`  Photos:           ${results.photosDeleted}`, 'cyan');
    log(`  Analytics:        ${results.analyticsDeleted}`, 'cyan');

    if (isDryRun) {
      log('\n✓ DRY RUN tamamlandı. Gerçek temizlik için --production parametresi kullanın.', 'yellow');
    } else {
      log('\n✓ Temizlik başarıyla tamamlandı!', 'green');
    }

  } catch (error) {
    log('\n✗ Temizlik sırasında hata oluştu', 'red');
    log(`Hata: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

