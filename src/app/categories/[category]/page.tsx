import { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generateMetaTags, generateBreadcrumbSchema, generateItemListSchema } from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getDomainInfo() {
  const headersList = await headers();
  let domain = headersList.get('x-tenant-domain') || 'bas-rhin.pro';
  domain = domain.replace('www.', '');
  
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  
  return { domain, cityName, displayName };
}

async function getCompaniesInCategory(category: string, domain: string) {
  // Get domain from database
  const domainData = await prisma.domain.findUnique({
    where: { name: domain },
  });

  if (!domainData) {
    return [];
  }

  // Decode category from URL
  const decodedCategory = decodeURIComponent(category);

  // Get companies in this category
  const companyContents = await prisma.companyContent.findMany({
    where: {
      domainId: domainData.id,
      isVisible: true,
      company: {
        categories: {
          has: decodedCategory,
        },
      },
    },
    include: {
      company: {
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      },
    },
    orderBy: {
      company: {
        name: 'asc',
      },
    },
  });

  return companyContents.map((content) => ({
    ...content.company,
    customDescription: content.customDescription,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { domain } = await getDomainInfo();
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const metaTags = generateMetaTags(domain, 'category', { category: decodedCategory });

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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { domain, displayName } = await getDomainInfo();
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const companies = await getCompaniesInCategory(category, domain);

  if (companies.length === 0) {
    notFound();
  }

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: `https://${domain}` },
    { name: 'Annuaire', url: `https://${domain}/annuaire` },
    { name: decodedCategory, url: `https://${domain}/categories/${category}` },
  ]);

  const itemListSchema = generateItemListSchema(companies, domain);

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
            <Link href="/annuaire" className="hover:text-blue-600">
              Annuaire
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{decodedCategory}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {decodedCategory}
          </h1>
          <p className="text-lg text-gray-600">
            {companies.length} professionnel{companies.length > 1 ? 's' : ''} trouvé{companies.length > 1 ? 's' : ''} à {displayName}
          </p>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
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
                    {company.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                {company.customDescription && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {company.customDescription}
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
          ))}
        </div>

        {/* Back to Directory */}
        <div className="mt-12 text-center">
          <Link
            href="/annuaire"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour à l&apos;annuaire complet
          </Link>
        </div>
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

