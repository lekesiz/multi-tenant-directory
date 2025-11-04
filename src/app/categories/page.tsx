import { headers } from 'next/headers';
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

async function getDomainInfo() {
  const headersList = await headers();
  let domain = headersList.get('x-tenant-domain') || 'bas-rhin.pro';
  domain = domain.replace('www.', '');
  
  const domainData = await prisma.domain.findUnique({
    where: { name: domain },
  });
  
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  
  return { domain, cityName, displayName, domainData };
}

async function getCategories(domainId: number) {
  // Get all active categories
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    include: {
      children: {
        where: {
          isActive: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Filter to only show parent categories (no parentId)
  const parentCategories = categories.filter((cat) => !cat.parentId);

  // Get all companies with content for this domain
  console.log('[DEBUG] Fetching companies for domainId:', domainId);
  const companiesWithContent = await prisma.company.findMany({
    where: {
      isActive: true,
      content: {
        some: {
          domainId: domainId,
          isVisible: true,
        },
      },
    },
    select: {
      id: true,
      companyCategories: {
        select: {
          categoryId: true,
        },
      },
    },
  });

  console.log('[DEBUG] Found companies:', companiesWithContent.length);
  if (companiesWithContent.length > 0) {
    console.log('[DEBUG] First company:', companiesWithContent[0]);
  }
  
  // Build a map of categoryId -> company count
  const categoryCountMap = new Map<number, number>();
  
  companiesWithContent.forEach((company) => {
    company.companyCategories.forEach((cc) => {
      const currentCount = categoryCountMap.get(cc.categoryId) || 0;
      categoryCountMap.set(cc.categoryId, currentCount + 1);
    });
  });

  // For each category, assign the count from the map
  const categoriesWithCounts = parentCategories.map((category) => {
    const parentCount = categoryCountMap.get(category.id) || 0;

    const childrenWithCounts = category.children.map((child) => {
      const childCount = categoryCountMap.get(child.id) || 0;
      return {
        ...child,
        _count: {
          companyCategories: childCount,
        },
      };
    });

    return {
      ...category,
      _count: {
        companyCategories: parentCount,
      },
      children: childrenWithCounts,
    };
  });

  return categoriesWithCounts;
}

export async function generateMetadata(): Promise<Metadata> {
  const { domain, displayName } = await getDomainInfo();

  return {
    title: `Catégories - ${displayName}.PRO`,
    description: `Parcourez toutes les catégories de professionnels à ${displayName}. Trouvez facilement les services dont vous avez besoin.`,
    keywords: `catégories, ${displayName}, professionnels, services`,
    alternates: {
      canonical: `https://${domain}/categories`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoriesPage() {
  const { domain, displayName, domainData } = await getDomainInfo();
  
  if (!domainData) {
    return <div>Domain not found</div>;
  }
  
  const categories = await getCategories(domainData.id);

  // Calculate total categories (parent + children)
  const totalCategories = categories.reduce(
    (acc, cat) => acc + 1 + cat.children.length,
    0
  );

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
                <p className="text-xs text-gray-600">
                  Les Professionnels de {displayName}
                </p>
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
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Annuaire
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
            <span className="text-gray-900">Catégories</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Toutes les Catégories
          </h1>
          <p className="text-lg text-gray-600">
            Explorez {totalCategories} catégories de professionnels à {displayName}
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Parent Category */}
                <Link
                  href={`/categories/${category.slug}`}
                  className="flex items-center justify-between group mb-4 hover:bg-gray-50 p-4 rounded-lg transition-colors"
                >
                  <div className="flex items-center flex-1">
                    <div className="text-4xl mr-4">{category.icon || '📁'}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.nameFr}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {category._count.companyCategories} professionnel{category._count.companyCategories > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                {/* Child Categories */}
                {category.children.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-12">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/categories/${child.slug}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center flex-1">
                          <div className="text-2xl mr-3">{child.icon || '📄'}</div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {child.nameFr}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {child._count.companyCategories} professionnel{child._count.companyCategories > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aucune catégorie trouvée
            </h2>
            <p className="text-gray-600 mb-6">
              Il n&apos;y a pas encore de catégories disponibles pour ce domaine.
            </p>
            <Link
              href="/annuaire"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir l&apos;annuaire complet
            </Link>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer domainName={domainData?.name || domain} primaryColor={domainData?.primaryColor || undefined} />
    </div>
  );
}
