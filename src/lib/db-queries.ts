import { prisma } from '@/lib/prisma';
import { cacheWrapper, CacheKeys, deleteCache } from '@/lib/redis';
import { Prisma } from '@prisma/client';

/**
 * Optimized company queries with caching
 */

// Get company by slug with all relations (cached)
export async function getCompanyBySlug(slug: string) {
  return cacheWrapper(
    CacheKeys.company(slug),
    async () => {
      return prisma.company.findUnique({
        where: { slug },
        include: {
          reviews: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
              id: true,
              rating: true,
              comment: true,
              authorName: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              reviews: {
                where: { isApproved: true },
              },
            },
          },
        },
      });
    },
    { ttl: 1800 } // 30 minutes
  );
}

// Get paginated companies with filters (cached)
export async function getCompanies(options: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  featured?: boolean;
}) {
  const { page = 1, limit = 20, categoryId, search, featured } = options;
  const skip = (page - 1) * limit;

  const cacheKey = search
    ? CacheKeys.search(search, page)
    : CacheKeys.companies(page, categoryId);

  return cacheWrapper(
    cacheKey,
    async () => {
      const where: Prisma.CompanyWhereInput = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { rating: 'desc' },
            { reviewCount: 'desc' },
            { createdAt: 'desc' },
          ],
          select: {
            id: true,
            name: true,
            slug: true,
            categories: true,
            logoUrl: true,
            coverImageUrl: true,
            address: true,
            city: true,
            postalCode: true,
            phone: true,
            website: true,
            rating: true,
            reviewCount: true,
            latitude: true,
            longitude: true,
          },
        }),
        prisma.company.count({ where }),
      ]);

      return {
        companies,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },
    { ttl: 600 } // 10 minutes
  );
}

// Get all categories (cached)
// Note: Categories are stored as String[] in Company model, not as a separate table
export async function getCategories() {
  return cacheWrapper(
    CacheKeys.categories(),
    async () => {
      // Get all unique categories from companies
      const companies = await prisma.company.findMany({
        select: { categories: true },
      });

      const categoriesSet = new Set<string>();
      companies.forEach((company) => {
        company.categories?.forEach((cat) => categoriesSet.add(cat));
      });

      return Array.from(categoriesSet).sort().map((name) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      }));
    },
    { ttl: 3600 } // 1 hour
  );
}

// Get company reviews with pagination (cached)
export async function getCompanyReviews(companyId: string, page: number = 1, limit: number = 10) {
  return cacheWrapper(
    CacheKeys.reviews(companyId, page),
    async () => {
      const skip = (page - 1) * limit;
      const companyIdNum = parseInt(companyId, 10);

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: {
            companyId: companyIdNum,
            isApproved: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            authorName: true,
            authorEmail: true,
            authorPhoto: true,
            photos: true,
            reviewDate: true,
            helpfulCount: true,
            isVerified: true,
            createdAt: true,
            reply: true,
          },
        }),
        prisma.review.count({
          where: {
            companyId: companyIdNum,
            isApproved: true,
          },
        }),
      ]);

      return {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },
    { ttl: 900 } // 15 minutes
  );
}

// Get company stats (cached)
export async function getCompanyStats(companyId: string) {
  return cacheWrapper(
    CacheKeys.stats(companyId),
    async () => {
      const companyIdNum = parseInt(companyId, 10);

      const [
        totalReviews,
        averageRating,
        ratingDistribution,
        recentReviews,
      ] = await Promise.all([
        prisma.review.count({
          where: {
            companyId: companyIdNum,
            isApproved: true,
          },
        }),
        prisma.review.aggregate({
          where: {
            companyId: companyIdNum,
            isApproved: true,
          },
          _avg: {
            rating: true,
          },
        }),
        prisma.review.groupBy({
          by: ['rating'],
          where: {
            companyId: companyIdNum,
            isApproved: true,
          },
          _count: {
            rating: true,
          },
        }),
        prisma.review.count({
          where: {
            companyId: companyIdNum,
            isApproved: true,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]);

      return {
        totalReviews,
        averageRating: averageRating._avg.rating || 0,
        ratingDistribution: ratingDistribution.reduce(
          (acc, curr) => {
            acc[curr.rating] = curr._count.rating;
            return acc;
          },
          { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
        ),
        recentReviews,
      };
    },
    { ttl: 1800 } // 30 minutes
  );
}

/**
 * Cache invalidation helpers
 */

export async function invalidateCompanyCache(slug: string, companyId: string) {
  await Promise.all([
    deleteCache(CacheKeys.company(slug)),
    deleteCache(CacheKeys.stats(companyId)),
    // Invalidate all company list caches (simplified approach)
    // In production, you might want to track which pages to invalidate
  ]);
}

export async function invalidateReviewCache(companyId: string) {
  // Invalidate all review pages for this company
  // In production, you might want to track which pages to invalidate
  await deleteCache(CacheKeys.stats(companyId));
}

export async function invalidateCategoryCache() {
  await deleteCache(CacheKeys.categories());
}

