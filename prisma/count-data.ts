import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const domainCount = await prisma.domain.count();
  const companyCount = await prisma.company.count();
  const companyContentCount = await prisma.companyContent.count();
  
  console.log(`📊 Database Statistics:`);
  console.log(`  - Domains: ${domainCount}`);
  console.log(`  - Companies: ${companyCount}`);
  console.log(`  - Company Contents: ${companyContentCount}`);
  
  const domains = await prisma.domain.findMany({
    include: {
      _count: {
        select: { companyContent: true }
      }
    }
  });
  
  console.log(`\n📍 Companies per domain:`);
  domains.forEach(d => {
    console.log(`  - ${d.name}: ${d._count.companyContent} companies`);
  });
}

main().finally(() => prisma.$disconnect());
