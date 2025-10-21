const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.businessCategory.findMany({
    where: {
      OR: [
        { slug: { contains: 'restaurant' } },
        { slug: { contains: 'plombier' } },
        { slug: { contains: 'coiffeur' } },
        { slug: { contains: 'garage' } },
        { slug: { contains: 'medecin' } }
      ]
    },
    select: { slug: true, nameFr: true }
  });
  
  console.log('Categories found:', JSON.stringify(categories, null, 2));
  
  // Also check companies table for category values
  const companies = await prisma.company.findMany({
    where: {
      categories: { isEmpty: false }
    },
    select: { categories: true },
    take: 5
  });
  
  console.log('\nSample company categories:', JSON.stringify(companies, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
