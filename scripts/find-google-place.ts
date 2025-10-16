import { prisma } from '../src/lib/prisma';

async function findAndUpdateGooglePlace() {
  const company = await prisma.company.findFirst({
    where: { slug: 'netz-informatique' },
    select: {
      id: true,
      name: true,
      address: true,
      googlePlaceId: true,
    }
  });

  if (!company) {
    console.log('❌ Netz Informatique not found');
    return;
  }

  console.log('📍 Company found:', company);
  
  if (company.googlePlaceId) {
    console.log('✅ Already has Google Place ID:', company.googlePlaceId);
  } else {
    console.log('⚠️  No Google Place ID found');
    console.log('🔍 Search on Google Maps for:', company.name, company.address);
    console.log('\n📝 To fix manually, run:');
    console.log(`await prisma.company.update({
  where: { id: ${company.id} },
  data: { googlePlaceId: 'PLACE_ID_HERE' }
})`);
  }
}

findAndUpdateGooglePlace()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
