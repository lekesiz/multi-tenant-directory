/**
 * Company database queries
 * Centralized company-related database operations to avoid code duplication
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * Default include options for company queries
 * Includes content and reviews with common filters
 */
export const defaultCompanyInclude = {
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
} satisfies Prisma.CompanyInclude;

/**
 * Get company by slug with domain filtering
 * @param slug - Company URL slug
 * @param domainId - Domain ID for multi-tenant filtering
 */
export async function getCompanyBySlug(slug: string, domainId: number) {
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
    include: defaultCompanyInclude,
  });
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
    include: defaultCompanyInclude,
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
    include: defaultCompanyInclude,
    orderBy: prismaOrderBy,
    take: limit,
    skip: offset,
  });
}

/**
 * Get featured companies for a domain
 * Companies with priority > 0 or featuredUntil in the future
 * @param domainId - Domain ID
 * @param limit - Maximum number of companies to return
 */
export async function getFeaturedCompanies(domainId: number, limit = 6) {
  return prisma.company.findMany({
    where: {
      AND: [
        {
          content: {
            some: {
              domainId,
              isVisible: true,
            },
          },
        },
        {
          OR: [
            { priority: { gt: 0 } },
            { featuredUntil: { gte: new Date() } },
          ],
        },
      ],
    },
    include: {
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
    },
    orderBy: {
      rating: 'desc',
    },
    take: limit,
  });
}

/**
 * Get recent companies for admin dashboard
 * @param limit - Maximum number of companies to return
 */
export async function getRecentCompanies(limit = 10) {
  return prisma.company.findMany({
    include: {
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
