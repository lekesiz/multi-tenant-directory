import { prisma } from './prisma';

/**
 * Optimized database queries for multi-tenant directory platform
 * Focus on performance, proper indexing usage, and minimal N+1 queries
 */

// ===============================================
// TENANT-AWARE QUERIES
// ===============================================

/**
 * Get visible companies for a specific domain with optimized includes
 */
export async function getVisibleCompaniesForDomain(
  domainId: number,
  options: {
    limit?: number;
    offset?: number;
    city?: string;
    category?: string;
    sortBy?: 'name' | 'rating' | 'created' | 'priority';
    sortOrder?: 'asc' | 'desc';
  } = {}
) {
  const {
    limit = 20,
    offset = 0,
    city,
    category,
    sortBy = 'priority',
    sortOrder = 'desc'
  } = options;

  // Build where clause
  const whereClause: any = {
    content: {
      some: {
        domainId,
        isVisible: true,
      },
    },
  };

  if (city) {
    whereClause.city = city;
  }

  if (category) {
    whereClause.categories = {
      has: category,
    };
  }

  // Build orderBy clause
  let orderBy: any;
  switch (sortBy) {
    case 'rating':
      orderBy = { rating: sortOrder };
      break;
    case 'created':
      orderBy = { createdAt: sortOrder };
      break;
    case 'priority':
      orderBy = {
        content: {
          _count: sortOrder, // Fallback, we'll need a custom solution for priority
        },
      };
      break;
    default:
      orderBy = { name: sortOrder };
  }

  return prisma.company.findMany({
    where: whereClause,
    include: {
      content: {
        where: {
          domainId,
          isVisible: true,
        },
        select: {
          customDescription: true,
          metaTitle: true,
          priority: true,
          featuredUntil: true,
        },
      },
      reviews: {
        where: {
          isApproved: true,
        },
        select: {
          rating: true,
          reviewDate: true,
        },
        orderBy: {
          reviewDate: 'desc',
        },
        take: 5, // Latest 5 reviews only
      },
      _count: {
        select: {
          reviews: {
            where: {
              isApproved: true,
            },
          },
        },
      },
    },
    orderBy,
    take: limit,
    skip: offset,
  });
}

/**
 * Get company details with all related data for a specific domain
 */
export async function getCompanyDetailsForDomain(
  companyId: number,
  domainId: number
) {
  return prisma.company.findFirst({
    where: {
      id: companyId,
      content: {
        some: {
          domainId,
          isVisible: true,
        },
      },
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
        orderBy: {
          reviewDate: 'desc',
        },
      },
      _count: {
        select: {
          reviews: {
            where: {
              isApproved: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get company by slug for a specific domain
 */
export async function getCompanyBySlugForDomain(
  slug: string,
  domainId: number
) {
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
        orderBy: {
          reviewDate: 'desc',
        },
      },
    },
  });
}

// ===============================================
// SEARCH AND FILTERING
// ===============================================

/**
 * Search companies with full-text search and filters
 */
export async function searchCompanies(
  domainId: number,
  searchQuery: string,
  filters: {
    city?: string;
    categories?: string[];
    minRating?: number;
    hasLocation?: boolean;
  } = {}
) {
  const whereClause: any = {
    content: {
      some: {
        domainId,
        isVisible: true,
      },
    },
  };

  // Full-text search on company name
  if (searchQuery) {
    whereClause.name = {
      contains: searchQuery,
      mode: 'insensitive',
    };
  }

  // Apply filters
  if (filters.city) {
    whereClause.city = filters.city;
  }

  if (filters.categories && filters.categories.length > 0) {
    whereClause.categories = {
      hasSome: filters.categories,
    };
  }

  if (filters.minRating) {
    whereClause.rating = {
      gte: filters.minRating,
    };
  }

  if (filters.hasLocation) {
    whereClause.latitude = {
      not: null,
    };
    whereClause.longitude = {
      not: null,
    };
  }

  return prisma.company.findMany({
    where: whereClause,
    include: {
      content: {
        where: {
          domainId,
          isVisible: true,
        },
        select: {
          customDescription: true,
          metaTitle: true,
          priority: true,
        },
      },
      _count: {
        select: {
          reviews: {
            where: {
              isApproved: true,
            },
          },
        },
      },
    },
    orderBy: [
      { rating: 'desc' },
      { reviewCount: 'desc' },
      { name: 'asc' },
    ],
  });
}

/**
 * Get unique cities for a domain (for filters)
 */
export async function getCitiesForDomain(domainId: number) {
  const result = await prisma.company.findMany({
    where: {
      content: {
        some: {
          domainId,
          isVisible: true,
        },
      },
      city: {
        not: null,
      },
    },
    select: {
      city: true,
    },
    distinct: ['city'],
    orderBy: {
      city: 'asc',
    },
  });

  return result.map(r => r.city).filter(Boolean);
}

/**
 * Get unique categories for a domain (for filters)
 */
export async function getCategoriesForDomain(domainId: number) {
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

  const allCategories = companies.flatMap(c => c.categories);
  return [...new Set(allCategories)].sort();
}

// ===============================================
// ADMIN QUERIES
// ===============================================

/**
 * Get companies with pagination for admin (cross-tenant)
 */
export async function getCompaniesForAdmin(options: {
  page?: number;
  limit?: number;
  search?: string;
  domainId?: number;
}) {
  const { page = 1, limit = 20, search, domainId } = options;
  const offset = (page - 1) * limit;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (domainId) {
    whereClause.content = {
      some: {
        domainId,
      },
    };
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where: whereClause,
      include: {
        content: {
          include: {
            domain: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.company.count({ where: whereClause }),
  ]);

  return {
    companies,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}

// ===============================================
// PERFORMANCE UTILITIES
// ===============================================

/**
 * Get database performance stats
 */
export async function getDatabaseStats() {
  const [
    totalCompanies,
    totalDomains,
    totalReviews,
    activeCompanies,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.domain.count({ where: { isActive: true } }),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.companyContent.count({ where: { isVisible: true } }),
  ]);

  return {
    totalCompanies,
    totalDomains,
    totalReviews,
    activeCompanies,
  };
}

/**
 * Preload critical data for faster page loads
 */
export async function preloadCriticalData(domainId: number) {
  const [cities, categories, featuredCompanies] = await Promise.all([
    getCitiesForDomain(domainId),
    getCategoriesForDomain(domainId),
    getVisibleCompaniesForDomain(domainId, {
      limit: 6,
      sortBy: 'priority',
    }),
  ]);

  return {
    cities,
    categories,
    featuredCompanies,
  };
}