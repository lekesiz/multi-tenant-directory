import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting reviews seed...');

  // Get all companies
  const companies = await prisma.company.findMany({
    include: {
      reviews: true,
    },
  });
  console.log(`Found ${companies.length} companies`);

  let totalReviewsAdded = 0;

  // Seed reviews for companies
  for (const company of companies) {
    const existingReviewsCount = company.reviews.filter(r => r.isApproved).length;
    
    if (existingReviewsCount < 3) {
      console.log(`Adding reviews for ${company.name}...`);

      const reviewsToAdd = 5 - existingReviewsCount;
      const reviewsData = [];

      const reviewTemplates = [
        { author: 'Marie Dubois', rating: 5, comment: 'Excellent service! Très professionnel et rapide. Je recommande vivement.' },
        { author: 'Jean Martin', rating: 4, comment: 'Bon rapport qualité-prix. Service satisfaisant.' },
        { author: 'Sophie Laurent', rating: 5, comment: 'Parfait! Équipe très compétente et accueillante.' },
        { author: 'Pierre Durand', rating: 4, comment: 'Très satisfait du service. À recommander.' },
        { author: 'Isabelle Bernard', rating: 5, comment: 'Service impeccable! Je reviendrai sans hésiter.' },
        { author: 'Thomas Petit', rating: 5, comment: 'Excellent travail, très professionnel!' },
        { author: 'Anne Moreau', rating: 4, comment: 'Bonne expérience, personnel sympathique.' },
        { author: 'François Simon', rating: 5, comment: 'Parfait de A à Z, je recommande!' },
      ];

      for (let i = 0; i < reviewsToAdd && i < reviewTemplates.length; i++) {
        const template = reviewTemplates[i];
        reviewsData.push({
          companyId: company.id,
          authorName: template.author,
          rating: template.rating,
          comment: template.comment,
          isApproved: true,
          createdAt: new Date(Date.now() - (30 - i * 5) * 24 * 60 * 60 * 1000),
        });
      }

      if (reviewsData.length > 0) {
        await prisma.review.createMany({
          data: reviewsData,
        });

        // Calculate new average rating
        const allReviews = await prisma.review.findMany({
          where: {
            companyId: company.id,
            isApproved: true,
          },
        });

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        
        await prisma.company.update({
          where: { id: company.id },
          data: {
            rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            reviewCount: allReviews.length,
          },
        });

        totalReviewsAdded += reviewsData.length;
        console.log(`✅ Added ${reviewsData.length} reviews for ${company.name} (avg: ${avgRating.toFixed(1)})`);
      }
    } else {
      console.log(`⏭️  ${company.name} already has ${existingReviewsCount} approved reviews, skipping...`);
    }
  }

  // Update existing reviews to be approved and visible
  const unapprovedReviews = await prisma.review.findMany({
    where: {
      isApproved: false,
    },
  });

  if (unapprovedReviews.length > 0) {
    console.log(`\n📝 Approving ${unapprovedReviews.length} existing reviews...`);
    await prisma.review.updateMany({
      where: {
        id: {
          in: unapprovedReviews.map((r) => r.id),
        },
      },
      data: {
        isApproved: true,
      },
    });
    console.log('✅ All existing reviews approved and visible');
  }

  console.log(`\n🎉 Reviews seed completed! Added ${totalReviewsAdded} new reviews.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

