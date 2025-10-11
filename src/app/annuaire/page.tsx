import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

async function getDomainFromHost(host: string) {
  try {
    const domain = host.split(':')[0];
    return await prisma.domain.findUnique({
      where: { name: domain },
    });
  } catch (error) {
    console.error('Database error in getDomainFromHost:', error);
    return null;
  }
}

export default async function AnnuairePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; city?: string }>;
}) {
  let headersList;
  let host;
  
  try {
    headersList = await headers();
    host = headersList.get('host') || 'multi-tenant-directory.vercel.app';
  } catch (error) {
    console.error('Headers error:', error);
    host = 'multi-tenant-directory.vercel.app';
  }

  const currentDomain = await getDomainFromHost(host);

  if (!currentDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🏗️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Site en Construction
          </h1>
          <p className="text-gray-600 mb-6">
            Ce domaine n&apos;est pas encore configuré.
          </p>
          <Link
            href="/admin/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Accéder à l&apos;Administration
          </Link>
        </div>
      </div>
    );
  }

  const params = await searchParams;

  let companies: any[] = [];
  let cities: string[] = [];
  let categories: string[] = [];

  try {
    // Build query filters
    const where: any = {
      content: {
        some: {
          domainId: currentDomain.id,
          isVisible: true,
        },
      },
    };

    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { address: { contains: params.q, mode: 'insensitive' } },
        { categories: { hasSome: [params.q] } },
      ];
    }

    if (params.city) {
      where.city = { equals: params.city, mode: 'insensitive' };
    }

    if (params.category) {
      where.categories = { has: params.category };
    }

    companies = await prisma.company.findMany({
      where,
      include: {
        content: {
          where: {
            domainId: currentDomain.id,
            isVisible: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Calculate average rating for each company
    const companiesWithRatings = await Promise.all(
      companies.map(async (company) => {
        try {
          const reviews = await prisma.googleReview.findMany({
            where: { companyId: company.id },
            select: { rating: true },
          });

          const avgRating =
            reviews.length > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              : null;

          return {
            ...company,
            avgRating,
          };
        } catch (error) {
          console.error(`Error fetching reviews for company ${company.id}:`, error);
          return {
            ...company,
            avgRating: null,
          };
        }
      })
    );

    companies = companiesWithRatings;

    // Get unique cities and categories for filters
    const allCompanies = await prisma.company.findMany({
      where: {
        content: {
          some: {
            domainId: currentDomain.id,
            isVisible: true,
          },
        },
      },
      select: {
        city: true,
        categories: true,
      },
    });

    cities = [
      ...new Set(allCompanies.map((c) => c.city).filter(Boolean)),
    ].sort() as string[];
    
    categories = [
      ...new Set(allCompanies.flatMap((c) => c.categories)),
    ].sort();
  } catch (error) {
    console.error('Database error in annuaire page:', error);
    // Continue with empty arrays
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentDomain.siteTitle || currentDomain.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentDomain.siteDescription ||
                  `Annuaire des professionnels à ${
                    currentDomain.name.split('.')[0]
                  }`}
              </p>
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Accueil
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          {params.city && (
            <Link
              href="/annuaire"
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Ville: {params.city}
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Link>
          )}
          {params.category && (
            <Link
              href="/annuaire"
              className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
            >
              Catégorie: {params.category}
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Link>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold">{companies.length}</span>{' '}
            professionnel{companies.length !== 1 ? 's' : ''} trouvé
            {companies.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Companies Grid */}
        {companies.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-600 text-lg mb-2">Aucun résultat trouvé</p>
            <p className="text-gray-500 mb-6">
              Aucune entreprise n&apos;est encore référencée sur ce site.
            </p>
            <Link
              href="/admin/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter une Entreprise
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company: any) => (
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {company.name}
                  </h3>
                  {company.avgRating && (
                    <div className="flex items-center ml-2">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="font-semibold">
                        {company.avgRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {company.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {company.categories.slice(0, 2).map((category: string) => (
                      <span
                        key={category}
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {company.address && (
                  <p className="text-sm text-gray-600 mb-2 flex items-start">
                    <svg
                      className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {company.address}
                  </p>
                )}

                {company.phone && (
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {company.phone}
                  </p>
                )}

                {company._count.reviews > 0 && (
                  <p className="text-xs text-gray-500 mt-3">
                    {company._count.reviews} avis
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

