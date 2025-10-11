import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding Vercel domain...');

  // Add Vercel production domain
  const vercelDomain = await prisma.domain.upsert({
    where: { name: 'multi-tenant-directory.vercel.app' },
    update: {},
    create: {
      name: 'multi-tenant-directory.vercel.app',
      siteTitle: 'Multi-tenant-directory.PRO',
      siteDescription: 'Les Professionnels de Multi-tenant-directory',
      isActive: true,
    },
  });

  console.log(`✅ Vercel domain created: ${vercelDomain.name}`);

  // Link all companies to Vercel domain
  const companies = await prisma.company.findMany();
  
  for (const company of companies) {
    await prisma.companyContent.upsert({
      where: {
        companyId_domainId: {
          companyId: company.id,
          domainId: vercelDomain.id,
        },
      },
      update: {
        isVisible: true,
      },
      create: {
        companyId: company.id,
        domainId: vercelDomain.id,
        isVisible: true,
      },
    });
  }

  console.log(`✅ Linked ${companies.length} companies to Vercel domain`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

