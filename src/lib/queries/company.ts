/**
 * Company database queries
 * Centralized company-related database operations to avoid code duplication
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { cacheWrapper, CacheKeys } from '@/lib/redis';

/**
 * Default select options for company queries
 * Only selects fields that exist in the database
 */
export const defaultCompanySelect = {
  id: true,
  name: true,
  slug: true,
  address: true,
  city: true,
  categories: true,
  logoUrl: true,
  rating: true,
  reviewCount: true,
  businessHours: true,
  createdAt: true,
  updatedAt: true,
  content: true,
  reviews: {
    where: {
      isApproved: true,
    },
    orderBy: {
      reviewDate: 'desc' as const,
    },
    take: 10,
  },
  _count: {
    select: {
      reviews: true,
    },
  },
};

/**
 * Get company by slug with domain filtering
 * @param slug - Company URL slug
 * @param domainId - Domain ID for multi-tenant filtering
 */
export async function getCompanyBySlug(slug: string, domainId: number) {
  // Use Redis cache wrapper with 1 hour TTL
  return cacheWrapper(
    CacheKeys.company(slug),
    async () => {
      return prisma.company.findFirst({
        where: {
          slug,
          content: {
            some: {
              domainId,
              isVisible: true,
            },
          },
        },
        select: defaultCompanySelect,
      });
    },
    { ttl: 3600 } // 1 hour cache
  );
}

/**
 * Get company by ID with optional domain filtering
 * @param id - Company ID
 * @param domainId - Optional domain ID for filtering
 */
export async function getCompanyById(id: number, domainId?: number) {
  const where: Prisma.CompanyWhereInput = { id };

  if (domainId) {
    where.content = {
      some: {
        domainId,
      },
    };
  }

  return prisma.company.findUnique({
    where: { id },
    select: defaultCompanySelect,
  });
}

/**
 * Get companies by domain with optional filters
 * @param domainId - Domain ID
 * @param options - Query options (search, category, city, limit, offset)
 */
export async function getCompaniesByDomain(
  domainId: number,
  options?: {
    search?: string;
    category?: string;
    city?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'name' | 'rating' | 'createdAt';
    order?: 'asc' | 'desc';
  }
) {
  const {
    search,
    category,
    city,
    limit = 20,
    offset = 0,
    orderBy = 'name',
    order = 'asc',
  } = options || {};

  // Calculate page number for cache key
  const page = Math.floor(offset / limit) + 1;
  
  // Use cache wrapper for list queries
  return cacheWrapper(
    CacheKeys.companies(page, category),
    async () => {

  const where: Prisma.CompanyWhereInput = {
    content: {
      some: {
        domainId,
        isVisible: true,
      },
    },
  };

  // Add search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Add category filter
  if (category) {
    where.categories = {
      has: category,
    };
  }

  // Add city filter
  if (city) {
    where.city = city;
  }

  // Prepare order by
  let prismaOrderBy: Prisma.CompanyOrderByWithRelationInput = {};

  if (orderBy === 'rating') {
    prismaOrderBy = { rating: order };
  } else if (orderBy === 'createdAt') {
    prismaOrderBy = { createdAt: order };
  } else {
    prismaOrderBy = { name: order };
  }

      return prisma.company.findMany({
        where,
        select: defaultCompanySelect,
        orderBy: prismaOrderBy,
        take: limit,
        skip: offset,
      });
    },
    { ttl: 1800 } // 30 minutes cache
  );
}

/**
 * Get featured companies for a domain
 * Companies with priority > 0 or featuredUntil in the future
 * @param domainId - Domain ID
 * @param limit - Maximum number of companies to return
 */
export async function getFeaturedCompanies(domainId: number, limit = 6) {
  // Use cache for featured companies
  return cacheWrapper(
    `featured:${domainId}:${limit}`,
    async () => {
      return prisma.company.findMany({
    where: {
      content: {
        some: {
          AND: [
            {
              domainId,
              isVisible: true,
            },
            {
              OR: [
                { priority: { gt: 0 } },
                { featuredUntil: { gte: new Date() } },
              ],
            },
          ],
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      logoUrl: true,
      rating: true,
      reviewCount: true,
      companyCategories: {
        select: {
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
              icon: true,
            },
          },
        },
      },
      content: {
        where: {
          domainId,
        },
      },
      reviews: {
        where: {
          isApproved: true,
        },
        take: 5,
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
        orderBy: {
          rating: 'desc',
        },
        take: limit,
      });
    },
    { ttl: 1800 } // 30 minutes cache
  );
}

/**
 * Get recent companies for admin dashboard
 * @param limit - Maximum number of companies to return
 */
export async function getRecentCompanies(limit = 10) {
  return prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      categories: true,
      logoUrl: true,
      rating: true,
      reviewCount: true,
      createdAt: true,
      content: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

/**
 * Count companies by domain
 * @param domainId - Domain ID
 */
export async function countCompaniesByDomain(domainId: number) {
  return prisma.companyContent.count({
    where: {
      domainId,
      isVisible: true,
    },
  });
}

/**
 * Get companies count by category for a domain
 * @param domainId - Domain ID
 */
export async function getCompaniesByCategoryCount(domainId: number) {
  const companies = await prisma.company.findMany({
    where: {
      content: {
        some: {
          domainId,
          isVisible: true,
        },
      },
    },
    select: {
      categories: true,
    },
  });

  // Count occurrences of each category
  const categoryCount = new Map<string, number>();

  companies.forEach((company) => {
    company.categories.forEach((category) => {
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });
  });

  // Convert to array and sort by count
  return Array.from(categoryCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
