const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check if gries.pro exists
  const existing = await prisma.domain.findUnique({
    where: { name: 'gries.pro' }
  });

  if (existing) {
    console.log('✅ gries.pro already exists:', JSON.stringify(existing, null, 2));
    return;
  }

  // Add gries.pro
  const newDomain = await prisma.domain.create({
    data: {
      name: 'gries.pro',
      isActive: true,
      siteTitle: 'Gries.PRO',
      siteDescription: 'Annuaire des Professionnels de Gries',
      primaryColor: '#3B82F6',
      settings: {}
    }
  });

  console.log('🎉 gries.pro added successfully:', JSON.stringify(newDomain, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
