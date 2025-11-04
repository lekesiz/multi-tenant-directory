import { logger } from '@/lib/logger';
import { headers } from 'next/headers';
import ReviewCard from "@/components/ReviewCard";
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import StructuredData from '@/components/StructuredData';
import CompanyReviews from '@/components/CompanyReviews';
import GoogleMap from '@/components/GoogleMap';
import CompanyQRCode from '@/components/CompanyQRCode';
import BusinessHours from '@/components/BusinessHours';
import PhotoGallery from '@/components/PhotoGallery';
import SocialLinks from '@/components/SocialLinks';
import ContactForm from '@/components/ContactForm';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import RelatedCompanies from '@/components/RelatedCompanies';
import MobileActions from '@/components/MobileActions';
import SafeHTML from '@/components/SafeHTML';
import CompanyActivities from '@/components/CompanyActivities';
import { Metadata } from 'next';

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getDomainFromHost(host: string) {
  let domain = host.split(':')[0];
  // www prefix'ini kaldır
  domain = domain.replace('www.', '');
  return await prisma.domain.findUnique({
    where: { name: domain },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'bas-rhin.pro';
    const currentDomain = await getDomainFromHost(host);
    
    if (!currentDomain) {
      return {
        title: 'Entreprise non trouvée',
      };
    }

    const { slug } = await params;
    
    // Yasal sayfa slug'larını exclude et
    const legalSlugs = ['politique-confidentialite', 'politique-de-confidentialite', 'mentions-legales', 'cgu', 'contact', 'tarifs', 'pricing'];
    if (legalSlugs.includes(slug)) {
      return {
        title: 'Page',
      };
    }
    
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
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        postalCode: true,
        logoUrl: true,
        categories: true, // Include categories array
        content: {
          where: {
            domainId: currentDomain.id,
          },
        },
        reviews: {
          where: {
            isActive: true,
            isApproved: true,
          },
        },
      },
    });

    if (!company) {
      return {
        title: 'Entreprise non trouvée',
      };
    }

    const content = company.content[0];
    const avgRating = company.reviews.length > 0
      ? (company.reviews.reduce((sum, r) => sum + r.rating, 0) / company.reviews.length).toFixed(1)
      : null;

    // Build SEO-optimized title with category
    const categoryText = company.categories.length > 0 ? ` - ${company.categories[0]}` : '';
    const title = `${company.name}${categoryText} à ${company.city} | ${currentDomain.name}`;
    const description = content?.customDescription || company.address || `Découvrez ${company.name} à ${company.city}. ${company.reviews.length} avis clients.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'fr_FR',
        siteName: currentDomain.name,
        images: company.logoUrl ? [{
          url: company.logoUrl,
          width: 200,
          height: 200,
          alt: company.name,
        }] : [],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: company.logoUrl ? [company.logoUrl] : [],
      },
    };
  } catch (error) {
    logger.error('Error generating metadata:', error);
    return {
      title: 'Entreprise',
    };
  }
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

  // Yasal sayfa slug'larını exclude et
  const legalSlugs = ['politique-confidentialite', 'politique-de-confidentialite', 'mentions-legales', 'cgu', 'contact', 'tarifs', 'pricing'];
  if (legalSlugs.includes(slug)) {
    return notFound();
  }

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
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      postalCode: true,
      phone: true,
      email: true,
      website: true,
      categories: true, // Include categories array
      logoUrl: true,
      coverImageUrl: true,
      latitude: true,
      longitude: true,
      rating: true,
      reviewCount: true,
      googlePlaceId: true,
      ratingDistribution: true,
      lastSyncedAt: true,
      isActive: true,
      content: {
        where: {
          domainId: currentDomain.id,
        },
      },
      reviews: {
        where: {
          isActive: true,
          isApproved: true,
        },
        orderBy: {
          reviewDate: 'desc',
        },
      },
      hours: true,
    },
  });

  if (!company) {
    return notFound();
  }

  const content = company.content[0];

  // Get French category names
  const categoryMappings = await prisma.businessCategory.findMany({
    where: {
      googleCategory: { in: company.categories },
      isActive: true,
    },
    select: {
      googleCategory: true,
      frenchName: true,
    },
  });

  const categoryMap: Record<string, string> = {};
  categoryMappings.forEach((mapping) => {
    categoryMap[mapping.googleCategory] = mapping.frenchName;
  });

  // Helper function to get French name or fallback
  const getCategoryName = (slug: string) => {
    return categoryMap[slug] || slug.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get related companies (same category and city, excluding current company)
  const relatedCompanies = await prisma.company.findMany({
    where: {
      AND: [
        { id: { not: company.id } },
        {
          OR: [
            { categories: { hasSome: company.categories || [] } },
            { city: company.city },
          ],
        },
        {
          content: {
            some: {
              domainId: currentDomain.id,
              isVisible: true,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      logoUrl: true,
      categories: true, // Include categories array
      rating: true,
      reviewCount: true,
    },
    take: 6,
    orderBy: [
      { rating: 'desc' },
      { reviewCount: 'desc' },
    ],
  });

  // Calculate average rating
  const avgRating =
    company.reviews.length > 0
      ? company.reviews.reduce((sum, r) => sum + r.rating, 0) /
        company.reviews.length
      : null;

  return (
    <>
      <StructuredData
        domain={currentDomain.name}
        type="company"
        company={{
          ...company,
          _count: { reviews: company.reviews.length }
        } as any}
        breadcrumbs={[
          { name: 'Accueil', url: `https://${currentDomain.name}` },
          { name: 'Annuaire', url: `https://${currentDomain.name}/annuaire` },
          { name: company.name, url: `https://${currentDomain.name}/companies/${company.slug}` }
        ]}
      />
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

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Company Info Card */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {company.name}
                  </h1>
                  {company.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {company.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {getCategoryName(category)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {avgRating && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-yellow-500 text-xl sm:text-2xl mr-1">★</span>
                      <span className="text-2xl sm:text-3xl font-bold">
                        {avgRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {company.reviews.length} avis
                    </p>
                  </div>
                )}
              </div>

              {/* Share Buttons */}
              <div className="flex items-center justify-between py-4 border-y border-gray-200 mb-6">
                <div className="text-sm text-gray-600">
                  Partager cette entreprise
                </div>
                <SocialShareButtons
                  url={`https://${currentDomain.name}/companies/${company.slug}`}
                  title={company.name}
                  description={content?.customDescription || `Découvrez ${company.name} à ${company.city}`}
                />
              </div>

              {/* Custom Description */}
              {content?.customDescription && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    À propos
                  </h2>
                  <SafeHTML
                    html={content.customDescription}
                    className="text-gray-900 leading-relaxed"
                  />
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

              {/* Social Links */}
              {(content?.customFields as any)?.socialLinks && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Suivez-nous
                  </h3>
                  <SocialLinks 
                    socialLinks={(content.customFields as any).socialLinks} 
                    website={company.website}
                  />
                </div>
              )}
            </div>

            {/* Photo Gallery */}
            <PhotoGallery 
              photos={content?.customImages as string[] | null}
              companyName={company.name}
              coverImage={company.coverImageUrl}
            />

            {/* Reviews */}
            <CompanyReviews 
              companyId={company.id} 
              companyName={company.name}
              totalReviews={company.reviewCount}
              googleRating={company.rating}
              googlePlaceId={company.googlePlaceId}
              ratingDistribution={company.ratingDistribution as Record<string, number> | null}
              lastSyncedAt={company.lastSyncedAt}
            />

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8">
              <ContactForm domainColor={currentDomain.primaryColor || '#3B82F6'} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Mobile Actions - Only visible on mobile */}
            <div className="block lg:hidden">
              <MobileActions company={{
                name: company.name,
                phone: company.phone,
                website: company.website,
                email: company.email,
                latitude: company.latitude,
                longitude: company.longitude,
                address: company.address,
                slug: company.slug
              }} />
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
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

            {/* Business Hours */}
            {company.hours && (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Horaires d'ouverture
                </h3>
                <BusinessHours businessHours={company.hours as any} />
              </div>
            )}

            {/* Google Maps */}
            {company.latitude && company.longitude && (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Localisation
                </h3>
                <GoogleMap 
                  latitude={company.latitude}
                  longitude={company.longitude}
                  companyName={company.name}
                  address={company.address ? `${company.address}, ${company.postalCode} ${company.city}` : undefined}
                />
              </div>
            )}

            {/* QR Code */}
            <CompanyQRCode
              url={`https://${currentDomain.name}/companies/${company.slug}`}
              companyName={company.name}
              size={200}
            />

            {/* Company Activities */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Activités et Actualités
              </h3>
              <CompanyActivities
                companyId={company.id}
                companySlug={company.slug}
              />
            </div>

            {/* Related Companies */}
            {relatedCompanies.length > 0 && (
              <RelatedCompanies
                companies={relatedCompanies}
                currentCompanyId={company.id}
                category={company.categories[0]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

