import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getDomainFromHost(host: string) {
  let domain = host.split(':')[0];
  // www prefix'ini kaldır
  domain = domain.replace('www.', '');
  return await prisma.domain.findUnique({
    where: { name: domain },
  });
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const headersList = await headers();
  const host = headersList.get('host') || 'bas-rhin.pro';

  const currentDomain = await getDomainFromHost(host);

  if (!currentDomain) {
    return notFound();
  }

  const { slug } = await params;

  const company = await prisma.company.findFirst({
    where: {
      slug: slug,
      content: {
        some: {
          domainId: currentDomain.id,
          isVisible: true,
        },
      },
    },
    include: {
      content: {
        where: {
          domainId: currentDomain.id,
        },
      },
      reviews: {
        orderBy: {
          reviewDate: 'desc',
        },
      },
    },
  });

  if (!company) {
    return notFound();
  }

  const content = company.content[0];

  // Calculate average rating
  const avgRating =
    company.reviews.length > 0
      ? company.reviews.reduce((sum, r) => sum + r.rating, 0) /
        company.reviews.length
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/annuaire"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg
                className="w-5 h-5 mr-1"
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
              Retour à l&apos;annuaire
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Accueil
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info Card */}
            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {company.name}
                  </h1>
                  {company.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {company.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {avgRating && (
                  <div className="text-center ml-4">
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-yellow-500 text-2xl mr-1">★</span>
                      <span className="text-3xl font-bold">
                        {avgRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {company.reviews.length} avis
                    </p>
                  </div>
                )}
              </div>

              {/* Custom Description */}
              {content?.customDescription && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    À propos
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {content.customDescription}
                  </p>
                </div>
              )}

              {/* Promotions */}
              {content?.promotions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
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
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                    Offres spéciales
                  </h3>
                  <p className="text-yellow-800 whitespace-pre-line">
                    {content.promotions}
                  </p>
                </div>
              )}
            </div>

            {/* Reviews */}
            {company.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Avis clients
                </h2>
                <div className="space-y-6">
                  {company.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {review.authorName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(review.reviewDate).toLocaleDateString(
                              'fr-FR',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xl ${
                                i < review.rating
                                  ? 'text-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Coordonnées
              </h3>
              <div className="space-y-4">
                {company.address && (
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0"
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
                    <div>
                      <div className="text-gray-900">{company.address}</div>
                      {company.city && company.postalCode && (
                        <div className="text-gray-600 text-sm">
                          {company.postalCode} {company.city}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
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
                    <a
                      href={`tel:${company.phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {company.phone}
                    </a>
                  </div>
                )}

                {company.email && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a
                      href={`mailto:${company.email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {company.email}
                    </a>
                  </div>
                )}

                {company.website && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
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
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Visiter le site
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Map Placeholder */}
            {company.latitude && company.longitude && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Localisation
                </h3>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Carte Google Maps</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

