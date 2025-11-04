import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    select: { slug: true, name: true, parentId: true },
    orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
  });
  
  console.log('Main categories:');
  cats.filter(c => !c.parentId).forEach(c => console.log('  -', c.slug, ':', c.name));
  
  console.log('\nSub categories:');
  cats.filter(c => c.parentId).forEach(c => console.log('  -', c.slug, ':', c.name));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
