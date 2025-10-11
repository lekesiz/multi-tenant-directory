import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Database İstatistikleri\n');
  
  // Domains
  const domains = await prisma.domain.findMany({
    orderBy: { name: 'asc' },
  });
  console.log(`✅ Domains: ${domains.length}`);
  domains.forEach(d => {
    console.log(`   - ${d.name} (${d.siteTitle}) - ${d.isActive ? 'Aktif' : 'Pasif'}`);
  });
  
  // Companies
  const totalCompanies = await prisma.company.count();
  console.log(`\n✅ Toplam Şirket: ${totalCompanies}`);
  
  // Companies by city
  const companiesByCity = await prisma.company.groupBy({
    by: ['city'],
    _count: true,
    orderBy: {
      _count: {
        city: 'desc',
      },
    },
  });
  console.log('\n📍 Şehir Bazında Şirketler:');
  companiesByCity.forEach(c => {
    console.log(`   - ${c.city}: ${c._count} şirket`);
  });
  
  // Company Content
  const totalContent = await prisma.companyContent.count();
  console.log(`\n✅ Toplam Company-Domain Bağlantısı: ${totalContent}`);
  
  // Content by domain
  for (const domain of domains) {
    const contentCount = await prisma.companyContent.count({
      where: { domainId: domain.id },
    });
    console.log(`   - ${domain.name}: ${contentCount} şirket görünür`);
  }
  
  // Categories
  const allCompanies = await prisma.company.findMany({
    select: { categories: true },
  });
  const allCategories = new Set<string>();
  allCompanies.forEach(c => {
    c.categories.forEach(cat => allCategories.add(cat));
  });
  console.log(`\n✅ Toplam Kategori: ${allCategories.size}`);
  console.log('   Kategoriler:', Array.from(allCategories).sort().join(', '));
  
  // Users
  const totalUsers = await prisma.user.count();
  console.log(`\n✅ Toplam Kullanıcı: ${totalUsers}`);
  
  // Reviews
  const totalReviews = await prisma.review.count();
  console.log(`✅ Toplam Yorum: ${totalReviews}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

