import { headers } from 'next/headers';
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCategoryIcon } from '@/lib/category-icons';

export const dynamic = 'force-dynamic';

async function getDomainInfo() {
  const headersList = await headers();
  let domain = headersList.get('x-tenant-domain') || 'bas-rhin.pro';
  domain = domain.replace('www.', '');
  
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  
  return { domain, cityName, displayName };
}

async function getCategories(domain: string) {
  // Get domain from database
  const domainData = await prisma.domain.findUnique({
    where: { name: domain },
  });

  if (!domainData) {
    return [];
  }

  // Get all visible companies for this domain
  const companyContents = await prisma.companyContent.findMany({
    where: {
      domainId: domainData.id,
      isVisible: true,
    },
    include: {
      company: {
        select: {
          categories: true,
        },
      },
    },
  });

  // Count companies per category
  const categoryCount: Record<string, number> = {};
  companyContents.forEach((content) => {
    content.company.categories.forEach((category) => {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
  });

  // Convert to array and sort by count
  return Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
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
  const { domain, displayName } = await getDomainInfo();
  const categories = await getCategories(domain);

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
            Explorez {categories.length} catégories de professionnels à {displayName}
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((item) => (
              <Link
                key={item.category}
                href={`/categories/${encodeURIComponent(item.category)}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex items-center justify-between group"
              >
                <div className="flex items-center flex-1">
                  <div className="text-4xl mr-4">{getCategoryIcon(item.category)}</div>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.category}
                  </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.count} professionnel{item.count > 1 ? 's' : ''}
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
    </div>
  );
}

