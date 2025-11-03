const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCompanyData() {
  try {
    const company = await prisma.company.findFirst({
      where: {
        googlePlaceId: { not: null }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        rating: true,
        reviewCount: true,
        googlePlaceId: true,
        _count: {
          select: { reviews: true }
        }
      }
    });
    
    console.log('Company Data:', JSON.stringify(company, null, 2));
    
    if (company) {
      const reviews = await prisma.review.findMany({
        where: {
          companyId: company.id,
          isActive: true,
          isApproved: true
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          commentFr: true,
          source: true
        },
        take: 3
      });
      
      console.log('\nSample Reviews:', JSON.stringify(reviews, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompanyData();
