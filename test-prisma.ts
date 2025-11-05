import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Prisma connection...');
  
  const count = await prisma.category.count();
  console.log(`Current category count: ${count}`);
  
  console.log('Creating test category...');
  const testCat = await prisma.category.create({
    data: {
      slug: 'test-category',
      name: 'Test Category',
      nameFr: 'Catégorie Test',
      nameEn: 'Test Category',
      icon: '🧪',
      googleBusinessCategory: 'Test',
      isActive: true,
      order: 999,
    },
  });
  
  console.log('Test category created:', testCat);
  
  // Clean up
  await prisma.category.delete({ where: { id: testCat.id } });
  console.log('Test category deleted');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
