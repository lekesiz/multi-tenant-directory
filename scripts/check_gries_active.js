const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const domain = await prisma.domain.findUnique({
    where: { name: 'gries.pro' }
  });
  
  console.log('gries.pro status:', {
    id: domain?.id,
    isActive: domain?.isActive,
    siteTitle: domain?.siteTitle
  });
  
  const allDomains = await prisma.domain.findMany({
    select: { id: true, name: true, isActive: true },
    orderBy: { name: 'asc' }
  });
  
  console.log('\nAll domains:', allDomains.length);
  console.log('Active domains:', allDomains.filter(d => d.isActive).length);
}

main().finally(() => prisma.$disconnect());
