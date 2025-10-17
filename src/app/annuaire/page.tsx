import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Star, MapPin, Phone, ExternalLink, Building2 } from 'lucide-react';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

interface SearchParams {
  category?: string;
  search?: string;
  page?: string;
}

async function getDomainFromHost(host: string) {
  let domain = host.split(':')[0];
  domain = domain.replace('www.', '');
  return await prisma.domain.findUnique({
    where: { name: domain },
  });
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

  // Build where clause
  const whereClause: any = {
    isActive: true, // Only show active companies
    content: {
      some: {
        domainId: currentDomain.id,
        isVisible: true,
      },
    },
  };

  if (params.category) {
    whereClause.categories = {
      has: params.category,
    };
  }

  if (params.search) {
    whereClause.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  // Fetch companies and total count in parallel
  const [companies, totalCount, allCompanies] = await Promise.all([
    prisma.company.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        phone: true,
        categories: true,
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
      },
      orderBy: { name: 'asc' },
      take: itemsPerPage,
      skip,
    }),
    prisma.company.count({ where: whereClause }),
    // Get all companies to extract unique categories
    prisma.company.findMany({
      where: {
        content: {
          some: {
            domainId: currentDomain.id,
            isVisible: true,
          },
        },
      },
      select: {
        categories: true,
      },
    }),
  ]);

  // Extract unique categories from all companies
  const categoryMap = new Map<string, number>();
  allCompanies.forEach((company) => {
    company.categories.forEach((cat) => {
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
  });

  // Convert to array and sort by count
  const categories = Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      _count: { category: count },
    }))
    .sort((a, b) => b._count.category - a._count.category);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Calculate average rating for each company
  const companiesWithRating = companies.map((company) => {
    const avgRating = company.reviews.length > 0
      ? company.reviews.reduce((sum, r) => sum + r.rating, 0) / company.reviews.length
      : 0;
    return {
      ...company,
      avgRating,
      reviewCount: company.reviews.length,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            📋 Annuaire des Entreprises
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            {totalCount} professionnels à {currentDomain.siteTitle || 'Haguenau'}
          </p>

          {/* Search Form */}
          <form method="get" className="max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                name="search"
                defaultValue={params.search}
                placeholder="Rechercher une entreprise..."
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
              >
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
                    <span className="text-sm">{totalCount}</span>
                  </span>
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.category}
                    href={`/annuaire?category=${encodeURIComponent(cat.category)}`}
                    className={`block px-3 py-2 rounded-lg transition ${
                      params.category === cat.category
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span className="truncate">{cat.category}</span>
                      <span className="text-sm ml-2">{cat._count.category}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content - Companies Grid */}
          <main className="flex-1">
            {params.search && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>{totalCount}</strong> résultat(s) pour &quot;
                  <strong>{params.search}</strong>&quot;
                  <Link
                    href="/annuaire"
                    className="ml-4 text-blue-600 hover:underline"
                  >
                    Effacer la recherche
                  </Link>
                </p>
              </div>
            )}

            {companiesWithRating.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune entreprise trouvée
                </h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <Link
                  href="/annuaire"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Voir toutes les entreprises
                </Link>
              </div>
            ) : (
              <>
                {/* Companies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {companiesWithRating.map((company) => (
                    <Link
                      key={company.id}
                      href={`/companies/${company.slug}`}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden group"
                    >
                      <div className="p-6">
                        {/* Company Name */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-1">
                          {company.name}
                        </h3>

                        {/* Categories */}
                        {company.categories && company.categories.length > 0 && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                            {company.categories.join(', ')}
                          </p>
                        )}

                        {/* Rating */}
                        {company.reviewCount > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.round(company.avgRating)
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {company.avgRating.toFixed(1)} ({company.reviewCount})
                            </span>
                          </div>
                        )}

                        {/* Description */}
                        {company.content[0]?.customDescription && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {company.content[0].customDescription}
                          </p>
                        )}

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm">
                          {company.address && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 shrink-0" />
                              <span className="line-clamp-1">{company.address}</span>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4 shrink-0" />
                              <span>{company.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* View More Link */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Voir la fiche
                            <ExternalLink className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    {currentPage > 1 && (
                      <Link
                        href={`/annuaire?page=${currentPage - 1}${
                          params.category ? `&category=${params.category}` : ''
                        }${params.search ? `&search=${params.search}` : ''}`}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        ← Précédent
                      </Link>
                    )}

                    <div className="flex items-center gap-2">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Link
                            key={pageNum}
                            href={`/annuaire?page=${pageNum}${
                              params.category ? `&category=${params.category}` : ''
                            }${params.search ? `&search=${params.search}` : ''}`}
                            className={`px-4 py-2 rounded-lg transition ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white font-semibold'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </Link>
                        );
                      })}
                    </div>

                    {currentPage < totalPages && (
                      <Link
                        href={`/annuaire?page=${currentPage + 1}${
                          params.category ? `&category=${params.category}` : ''
                        }${params.search ? `&search=${params.search}` : ''}`}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Suivant →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
