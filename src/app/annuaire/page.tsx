import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Star, MapPin, Phone, ExternalLink, Building2 } from 'lucide-react';
import Footer from '@/components/Footer';

// ISR: Revalidate every 5 minutes
// Force dynamic rendering because this page uses headers() for domain detection
export const dynamic = 'force-dynamic';

export const revalidate = 300;

interface SearchParams {
  category?: string;
  search?: string;
  q?: string; // Query from homepage search
  location?: string; // Location from homepage search
  page?: string;
  city?: string; // City filter
  rating?: string; // Minimum rating filter (1-5)
  openNow?: string; // Filter for currently open businesses
  sort?: string; // Sort: name, rating, reviews
}

async function getDomainFromHost(host: string) {
  let domain = host.split(':')[0];
  domain = domain.replace('www.', '');
  return await prisma.domain.findUnique({
    where: { name: domain },
  });
}

/**
 * Check if business is currently open based on business hours
 */
function isBusinessOpen(businessHours: any): boolean {
  if (!businessHours) return false;

  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const todayHours = businessHours[currentDay];
  if (!todayHours) return false;

  // New format (with shifts array)
  if (todayHours.shifts && Array.isArray(todayHours.shifts)) {
    if (todayHours.closed) return false;
    return todayHours.shifts.some((shift: any) => {
      return shift.open <= currentTime && currentTime <= shift.close;
    });
  }

  // Old format (with openTime and closeTime)
  if (todayHours.openTime && todayHours.closeTime) {
    return todayHours.openTime <= currentTime && currentTime <= todayHours.closeTime;
  }

  return false;
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || 'haguenau.pro';
  const currentDomain = await getDomainFromHost(host);

  return {
    title: `Annuaire des Entreprises - ${currentDomain?.siteTitle || 'Haguenau'}`,
    description: `Découvrez tous les professionnels et entreprises de ${currentDomain?.siteTitle || 'Haguenau'}. Annuaire complet avec avis, coordonnées et informations pratiques.`,
    openGraph: {
      title: `Annuaire des Entreprises - ${currentDomain?.siteTitle || 'Haguenau'}`,
      description: `Tous les professionnels de ${currentDomain?.siteTitle || 'Haguenau'}`,
    },
  };
}

export default async function AnnuairePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const headersList = await headers();
  const host = headersList.get('host') || 'haguenau.pro';
  const currentDomain = await getDomainFromHost(host);

  if (!currentDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Domaine introuvable</h1>
          <p className="text-gray-600">Le domaine demandé n&apos;existe pas.</p>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const itemsPerPage = 24;
  const skip = (currentPage - 1) * itemsPerPage;

  // Get search query from either 'search' or 'q' parameter
  const searchQuery = params.search || params.q;

  // Build where clause for companies
  const whereClause: any = {
    isActive: true,
    content: {
      some: {
        domainId: currentDomain.id,
        isVisible: true,
      },
    },
  };

  // Category filter using new system
  if (params.category) {
    whereClause.companyCategories = {
      some: {
        category: {
          slug: params.category,
        },
      },
    };
  }

  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { address: { contains: searchQuery, mode: 'insensitive' } },
      { city: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  // City filter
  if (params.city) {
    whereClause.city = {
      contains: params.city,
      mode: 'insensitive',
    };
  }

  // Minimum rating filter
  const minRating = params.rating ? parseFloat(params.rating) : 0;

  // Open now filter - we'll filter this after fetching
  const filterOpenNow = params.openNow === 'true';

  // Sort option
  const sortBy = params.sort || 'name'; // name, rating, reviews

  // Build orderBy clause based on sort option
  let orderBy: any = { name: 'asc' };
  if (sortBy === 'rating') {
    orderBy = { rating: 'desc' };
  } else if (sortBy === 'reviews') {
    orderBy = { reviewCount: 'desc' };
  }

  // Fetch companies and total count in parallel
  const [companies, totalCount, allCategories, allCities] = await Promise.all([
    prisma.company.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        phone: true,
        businessHours: true,
        content: {
          where: {
            domainId: currentDomain.id,
            isVisible: true,
          },
          select: {
            customDescription: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        companyCategories: {
          select: {
            category: {
              select: {
                id: true,
                slug: true,
                name: true,
                icon: true,
                parentId: true,
              },
            },
          },
        },
      },
      orderBy,
      take: filterOpenNow || minRating > 0 ? itemsPerPage * 3 : itemsPerPage,
      skip: filterOpenNow || minRating > 0 ? 0 : skip,
    }),
    prisma.company.count({ where: whereClause }),
    // Get all categories with company counts
    prisma.category.findMany({
      where: {
        isActive: true,
        companyCategories: {
          some: {
            company: {
              content: {
                some: {
                  domainId: currentDomain.id,
                  isVisible: true,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        icon: true,
        parentId: true,
        _count: {
          select: {
            companyCategories: {
              where: {
                company: {
                  content: {
                    some: {
                      domainId: currentDomain.id,
                      isVisible: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { parentId: 'asc' },
        { order: 'asc' },
      ],
    }),
    // Get all unique cities
    prisma.company.findMany({
      where: {
        content: {
          some: {
            domainId: currentDomain.id,
            isVisible: true,
          },
        },
        city: { not: null },
      },
      select: {
        city: true,
      },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    }),
  ]);

  // Calculate average rating for each company
  let companiesWithRating = companies.map((company) => {
    const avgRating = company.reviews.length > 0
      ? company.reviews.reduce((sum, r) => sum + r.rating, 0) / company.reviews.length
      : 0;

    return {
      ...company,
      categories: company.companyCategories.map(cc => cc.category),
      avgRating,
      reviewCount: company.reviews.length,
    };
  });

  // Apply client-side filters
  let filteredCompanies = companiesWithRating;

  // Filter by minimum rating
  if (minRating > 0) {
    filteredCompanies = filteredCompanies.filter(c => c.avgRating >= minRating);
  }

  // Filter by open now
  if (filterOpenNow) {
    filteredCompanies = filteredCompanies.filter(c => isBusinessOpen(c.businessHours));
  }

  // Pagination for filtered results
  const filteredTotal = filteredCompanies.length;
  const paginatedCompanies = filteredCompanies.slice(skip, skip + itemsPerPage);

  const actualTotalCount = filterOpenNow || minRating > 0 ? filteredTotal : totalCount;
  const totalPages = Math.ceil(actualTotalCount / itemsPerPage);

  // Separate main and sub categories
  const mainCategories = allCategories.filter(c => !c.parentId);
  const subCategories = allCategories.filter(c => c.parentId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative py-16" style={{ background: currentDomain.primaryColor || '#2563EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-white" />
          <h1 className="text-4xl font-bold text-white mb-4">
            📋 Annuaire des Entreprises
          </h1>
          <p className="text-xl text-white/90">
            {actualTotalCount} professionnels à {currentDomain.siteTitle}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Catégories
              </h2>
              <div className="space-y-2">
                <Link
                  href="/annuaire"
                  className={`block px-3 py-2 rounded-lg transition ${
                    !params.category
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>Toutes</span>
                    <span className="text-sm">{actualTotalCount}</span>
                  </span>
                </Link>
                
                {/* Main Categories */}
                {mainCategories.map((cat) => (
                  <div key={cat.slug}>
                    <Link
                      href={`/annuaire?category=${encodeURIComponent(cat.slug)}`}
                      className={`block px-3 py-2 rounded-lg transition ${
                        params.category === cat.slug
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span className="truncate">{cat.name}</span>
                        </span>
                        <span className="text-sm ml-2">{cat._count.companyCategories}</span>
                      </span>
                    </Link>
                    
                    {/* Sub Categories */}
                    {subCategories
                      .filter(sub => sub.parentId === cat.id)
                      .map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/annuaire?category=${encodeURIComponent(sub.slug)}`}
                          className={`block pl-8 pr-3 py-2 rounded-lg transition text-sm ${
                            params.category === sub.slug
                              ? 'bg-blue-50 text-blue-600 font-semibold'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex items-center justify-between">
                            <span className="truncate">└─ {sub.name}</span>
                            <span className="text-xs ml-2">{sub._count.companyCategories}</span>
                          </span>
                        </Link>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content - Companies Grid */}
          <main className="flex-1">
            {searchQuery && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  Résultats de recherche pour <strong>&quot;{searchQuery}&quot;</strong>
                </p>
              </div>
            )}

            {paginatedCompanies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Aucune entreprise trouvée.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedCompanies.map((company) => (
                    <Link
                      key={company.id}
                      href={`/${company.slug}`}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 block"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {company.name}
                      </h3>
                      
                      {/* Categories */}
                      {company.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {company.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                            >
                              {cat.icon && <span>{cat.icon}</span>}
                              <span>{cat.name}</span>
                            </span>
                          ))}
                          {company.categories.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                              +{company.categories.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {company.avgRating > 0 && (
                        <div className="flex items-center mb-3">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1 font-semibold">{company.avgRating.toFixed(1)}</span>
                          <span className="ml-1 text-sm text-gray-500">
                            ({company.reviewCount} avis)
                          </span>
                        </div>
                      )}

                      {company.address && (
                        <div className="flex items-start text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{company.address}</span>
                        </div>
                      )}

                      {company.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {currentPage > 1 && (
                      <Link
                        href={`/annuaire?${new URLSearchParams({ ...params, page: String(currentPage - 1) }).toString()}`}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Précédent
                      </Link>
                    )}
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Link
                          key={pageNum}
                          href={`/annuaire?${new URLSearchParams({ ...params, page: String(pageNum) }).toString()}`}
                          className={`px-4 py-2 rounded-lg ${
                            pageNum === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}

                    {currentPage < totalPages && (
                      <Link
                        href={`/annuaire?${new URLSearchParams({ ...params, page: String(currentPage + 1) }).toString()}`}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Suivant
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer domainName={domainData.name} primaryColor={domainData.primaryColor || undefined} />
    </div>
  );
}
