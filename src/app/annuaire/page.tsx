import { headers } from 'next/headers';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';
import { generateMetaTags, generateBreadcrumbSchema, generateItemListSchema } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const RESULTS_PER_PAGE = 12;

async function getDomainFromHost(host: string) {
  try {
    let domain = host.split(':')[0];
    domain = domain.replace('www.', '');
    
    // Vercel deployment URL'lerini haguenau.pro'ya map et
    if (domain.includes('.vercel.app')) {
      domain = 'bas-rhin.pro';
    }
    
    return await prisma.domain.findUnique({
      where: { name: domain },
    });
  } catch (error) {
    console.error('Database error in getDomainFromHost:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  let headersList;
  let host;
  
  try {
    headersList = await headers();
    host = headersList.get('host') || 'multi-tenant-directory.vercel.app';
  } catch (error) {
    host = 'multi-tenant-directory.vercel.app';
  }

  const domain = host.split(':')[0].replace('www.', '');
  const metaTags = generateMetaTags(domain, 'annuaire');

  return {
    title: metaTags.title,
    description: metaTags.description,
    keywords: metaTags.keywords,
    openGraph: {
      title: metaTags.ogTitle,
      description: metaTags.ogDescription,
      url: metaTags.ogUrl,
      images: metaTags.ogImage ? [metaTags.ogImage] : [],
      type: 'website',
      locale: 'fr_FR',
    },
    twitter: {
      card: metaTags.twitterCard,
      title: metaTags.twitterTitle,
      description: metaTags.twitterDescription,
      images: metaTags.twitterImage ? [metaTags.twitterImage] : [],
    },
    alternates: {
      canonical: metaTags.canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AnnuairePage({
  searchParams,
}: {
  searchParams: Promise<{ 
    q?: string; 
    category?: string; 
    city?: string;
    sort?: string;
    page?: string;
  }>;
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
  const currentPage = parseInt(params.page || '1', 10);
  const sortBy = params.sort || 'name-asc';

  let companies: any[] = [];
  let totalCount = 0;
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

    // Get total count
    totalCount = await prisma.company.count({ where });

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { name: 'asc' };
    }

    // Get paginated companies
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
      orderBy,
      skip: (currentPage - 1) * RESULTS_PER_PAGE,
      take: RESULTS_PER_PAGE,
    });

    // Get all cities and categories for filters
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

    // Extract unique cities
    cities = Array.from(
      new Set(
        allCompanies
          .map((c) => c.city)
          .filter((city): city is string => city !== null)
      )
    ).sort();

    // Extract unique categories
    const categorySet = new Set<string>();
    allCompanies.forEach((c) => {
      c.categories.forEach((cat) => categorySet.add(cat));
    });
    categories = Array.from(categorySet).sort();

  } catch (error) {
    console.error('Database error:', error);
  }

  const cityName = currentDomain.name.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  const totalPages = Math.ceil(totalCount / RESULTS_PER_PAGE);

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: `https://${currentDomain.name}` },
    { name: 'Annuaire', url: `https://${currentDomain.name}/annuaire` },
  ]);

  const itemListSchema = generateItemListSchema(companies, currentDomain.name);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {displayName.charAt(0)}
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {displayName}.PRO
                </h1>
              </div>
            </Link>
            <nav className="flex space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/annuaire"
                className="text-blue-600 font-semibold"
              >
                Annuaire
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Catégories
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Annuaire</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Annuaire des Professionnels
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez tous les professionnels de {displayName}
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar
          categories={categories}
          cities={cities}
          totalResults={totalCount}
        />

        {/* Companies Grid */}
        {companies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => {
                const customDescription = company.content[0]?.customDescription;

                return (
                  <Link
                    key={company.id}
                    href={`/companies/${company.slug}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {/* Cover Image */}
                    {company.coverImageUrl && (
                      <div className="h-48 bg-gray-200 relative">
                        <Image
                          src={company.coverImageUrl}
                          alt={company.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Logo and Name */}
                      <div className="flex items-start mb-4">
                        {company.logoUrl ? (
                          <div className="relative w-16 h-16 mr-4">
                            <Image
                              src={company.logoUrl}
                              alt={company.name}
                              fill
                              sizes="64px"
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                            {company.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {company.name}
                          </h3>
                          {company.city && (
                            <p className="text-sm text-gray-600">
                              📍 {company.city}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Categories */}
                      {company.categories && company.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {company.categories.slice(0, 3).map((cat: string) => (
                            <span
                              key={cat}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                            >
                              {cat}
                            </span>
                          ))}
                          {company.categories.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{company.categories.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {customDescription && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {customDescription}
                        </p>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-2 text-sm">
                        {company.phone && (
                          <div className="flex items-center text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2"
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
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center text-blue-600">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                              />
                            </svg>
                            Visiter le site
                          </div>
                        )}
                      </div>

                      {/* Reviews Count */}
                      {company._count && company._count.reviews > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="text-yellow-500 mr-1">⭐</span>
                            {company._count.reviews} avis
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalCount}
              resultsPerPage={RESULTS_PER_PAGE}
            />
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun résultat trouvé
            </h2>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou de filtrage.
            </p>
            <Link
              href="/annuaire"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réinitialiser les filtres
            </Link>
          </div>
        )}
      </main>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
    </div>
  );
}

