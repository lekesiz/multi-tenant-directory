/**
 * Review database queries
 * Centralized review-related database operations
 */

import { prisma } from '@/lib/prisma';

/**
 * Get reviews for a company
 * @param companyId - Company ID
 * @param limit - Maximum number of reviews to return
 */
export async function getReviewsByCompany(companyId: number, limit = 10) {
  return prisma.review.findMany({
    where: {
      companyId,
      isApproved: true,
    },
    orderBy: {
      reviewDate: 'desc',
    },
    take: limit,
  });
}

/**
 * Get average rating for a company
 * @param companyId - Company ID
 */
export async function getCompanyAverageRating(companyId: number) {
  const result = await prisma.review.aggregate({
    where: {
      companyId,
      isApproved: true,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  return {
    averageRating: result._avg.rating || 0,
    totalReviews: result._count.rating,
  };
}

/**
 * Get total review count for companies in a domain
 * @param domainId - Domain ID
 */
export async function getReviewsCountByDomain(domainId: number) {
  return prisma.review.count({
    where: {
      company: {
        content: {
          some: {
            domainId,
            isVisible: true,
          },
        },
      },
      isApproved: true,
    },
  });
}

/**
 * Get average rating for all companies in a domain
 * @param domainId - Domain ID
 */
export async function getAverageRatingByDomain(domainId: number) {
  const result = await prisma.review.aggregate({
    where: {
      company: {
        content: {
          some: {
            domainId,
            isVisible: true,
          },
        },
      },
      isApproved: true,
    },
    _avg: {
      rating: true,
    },
  });

  return result._avg.rating || 0;
}

/**
 * Get recent reviews across all companies
 * @param limit - Maximum number of reviews to return
 */
export async function getRecentReviews(limit = 10) {
  return prisma.review.findMany({
    where: {
      isApproved: true,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      reviewDate: 'desc',
    },
    take: limit,
  });
}
