import { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generateMetaTags, generateBreadcrumbSchema, generateItemListSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import Footer from '@/components/Footer';

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

async function getCompaniesInCategory(categorySlug: string, domain: string) {
  // Get domain from database
  const domainData = await prisma.domain.findUnique({
    where: { name: domain },
  });

  if (!domainData) {
    return [];
  }

  // Get category from database
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    return [];
  }

  // Get all companies in this category (including through junction table)
  const companyCategories = await prisma.companyCategory.findMany({
    where: {
      categoryId: category.id,
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
  });

  // Filter by domain visibility
  const companyContents = await prisma.companyContent.findMany({
    where: {
      domainId: domainData.id,
      isVisible: true,
      companyId: {
        in: companyCategories.map((cc) => cc.companyId),
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
  
  // Normalize slug to lowercase
  const categorySlug = decodeURIComponent(category).toLowerCase();
  
  // Get category from database
  const categoryData = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  const categoryName = categoryData?.nameFr || categorySlug;
  const metaTags = generateMetaTags(domain, 'category', { category: categoryName });

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
  
  // Normalize slug to lowercase
  const categorySlug = decodeURIComponent(category).toLowerCase();

  // Check if category exists in database
  const categoryData = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: {
      parent: true,
      children: {
        where: {
          isActive: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!categoryData) {
    notFound();
  }

  const companies = await getCompaniesInCategory(categorySlug, domain);

  // Generate structured data
  const breadcrumbItems = [
    { name: 'Accueil', url: `https://${domain}` },
    { name: 'Catégories', url: `https://${domain}/categories` },
  ];

  if (categoryData.parent && categoryData.parent.nameFr) {
    breadcrumbItems.push({
      name: categoryData.parent.nameFr,
      url: `https://${domain}/categories/${categoryData.parent.slug}`,
    });
  }

  breadcrumbItems.push({
    name: categoryData.nameFr || categoryData.slug,
    url: `https://${domain}/categories/${categoryData.slug}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
  const itemListSchema = generateItemListSchema(companies, domain);

  return (
    <>
      <StructuredData
        domain={domain}
        type="category"
        categoryName={categoryData.nameFr || undefined}
        companies={companies}
        breadcrumbs={breadcrumbItems}
      />
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
            <Link href="/categories" className="hover:text-blue-600">
              Catégories
            </Link>
            {categoryData.parent && (
              <>
                <span className="mx-2">/</span>
                <Link
                  href={`/categories/${categoryData.parent.slug}`}
                  className="hover:text-blue-600"
                >
                  {categoryData.parent.nameFr}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-gray-900">{categoryData.nameFr}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="text-5xl mr-4">{categoryData.icon || '📁'}</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {categoryData.nameFr}
              </h1>
              {categoryData.nameEn && (
                <p className="text-lg text-gray-500 mt-1">{categoryData.nameEn}</p>
              )}
            </div>
          </div>
          <p className="text-lg text-gray-600">
            {companies.length} professionnel{companies.length > 1 ? 's' : ''} trouvé{companies.length > 1 ? 's' : ''} à {displayName}
          </p>
        </div>

        {/* Child Categories */}
        {categoryData.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sous-catégories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryData.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex items-center group"
                >
                  <div className="text-3xl mr-3">{child.icon || '📄'}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {child.nameFr}
                    </h3>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
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
          </div>
        )}

        {/* Companies Grid */}
        {companies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Aucune entreprise trouvée
              </h2>
              <p className="text-gray-600 mb-6">
                Il n&apos;y a pas encore de professionnels dans la catégorie &quot;{categoryData.nameFr}&quot; à {displayName}.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/categories"
                  className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Toutes les catégories
                </Link>
                <Link
                  href="/annuaire"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Parcourir l&apos;annuaire
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Professionnels</h2>
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
                      <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                        <Image
                          src={company.logoUrl}
                          alt={company.name}
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl mr-4 flex-shrink-0">
                        {company.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                        {company.name}
                      </h3>
                      {company.city && (
                        <p className="text-sm text-gray-600">
                          📍 {company.city}
                        </p>
                      )}
                    </div>
                  </div>

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

                    {company.rating && (
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(company.rating!)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-gray-600">
                          {company.rating.toFixed(1)}
                        </span>
                        {company._count.reviews > 0 && (
                          <span className="ml-1 text-gray-500">
                            ({company._count.reviews})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            </div>
          </div>
        )}

        {/* Back to Categories */}
        <div className="mt-12 text-center">
          <Link
            href="/categories"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour aux catégories
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer domainName={domainData.name} primaryColor={domainData.primaryColor || undefined} />
    </div>
    </>
  );
}
