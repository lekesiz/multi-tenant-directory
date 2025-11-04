import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateMetaTags } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import HeroSection from '@/components/HeroSection';
import BenefitsSection from '@/components/BenefitsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FeaturedBusinessesCarousel from '@/components/FeaturedBusinessesCarousel';
import PricingHomepageSection from '@/components/PricingHomepageSection';
import LeadFormClient from '@/components/LeadFormClient';
import { prisma } from '@/lib/prisma';

// Query utilities
import { getCurrentDomainInfo } from '@/lib/queries/domain';
import {
  countCompaniesByDomain,
  getCompaniesByCategoryCount,
  getFeaturedCompanies
} from '@/lib/queries/company';
import {
  getReviewsCountByDomain,
  getAverageRatingByDomain
} from '@/lib/queries/review';

// ISR: Revalidate every 5 minutes for better performance
export const revalidate = 300;

/**
 * Get domain statistics (companies, reviews, average rating)
 */
async function getStats(domainId: number) {
  const [companiesCount, reviewsCount, avgRating] = await Promise.all([
    countCompaniesByDomain(domainId),
    getReviewsCountByDomain(domainId),
    getAverageRatingByDomain(domainId),
  ]);

  return {
    companiesCount,
    reviewsCount,
    avgRating: avgRating ? avgRating.toFixed(1) : null,
  };
}

/**
 * Get main categories (parent categories only) with company counts
 */
async function getMainCategories(domainId: number) {
  // Get all parent categories (7 main categories)
  const mainCategories = await prisma.category.findMany({
    where: {
      parentId: null,
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // For each main category, count companies (including subcategories)
  const categoriesWithCounts = await Promise.all(
    mainCategories.map(async (category) => {
      // Get all child category IDs
      const childCategories = await prisma.category.findMany({
        where: { parentId: category.id },
        select: { id: true },
      });

      const allCategoryIds = [category.id, ...childCategories.map(c => c.id)];

      // Count companies in this category and its children
      const count = await prisma.companyCategory.count({
        where: {
          categoryId: { in: allCategoryIds },
          company: {
            content: {
              some: {
                domainId,
                isVisible: true,
              },
            },
          },
        },
      });

      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        icon: category.icon,
        count,
      };
    })
  );

  return categoriesWithCounts;
}

export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getCurrentDomainInfo();
  const metaTags = generateMetaTags(domain, 'home');
  
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
      card: 'summary_large_image',
      title: metaTags.ogTitle,
      description: metaTags.ogDescription,
      images: metaTags.ogImage ? [metaTags.ogImage] : [],
    },
    alternates: {
      canonical: metaTags.ogUrl,
    },
  };
}

export default async function HomePage() {
  const { domainData } = await getCurrentDomainInfo();
  
  if (!domainData) {
    notFound();
  }
  
  // Fetch data in parallel for better performance
  const [stats, featuredCompanies] = await Promise.all([
    getStats(domainData.id),
    getFeaturedCompanies(domainData.id, 6),
  ]);

  // Get main categories with error handling
  let mainCategories: {
    id: number;
    slug: string;
    name: string;
    icon: string | null;
    count: number;
  }[] = [];
  
  try {
    mainCategories = await getMainCategories(domainData.id);
  } catch (error) {
    console.error('Error fetching main categories:', error);
    // Fallback to empty array if database is not available
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        domain={domainData}
        stats={stats}
      />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* How it Works Section */}
      <HowItWorksSection userType="both" />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Featured Businesses Carousel */}
      {featuredCompanies.length > 0 && (
        <FeaturedBusinessesCarousel businesses={featuredCompanies.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          address: c.address || '',
          city: c.city || '',
          categories: c.companyCategories?.map(cc => cc.category.name) || [],
          rating: c.rating || 0,
          reviewCount: c.reviewCount || 0,
          logoUrl: c.logoUrl,
        }))} />
      )}

      {/* Pricing Section */}
      <PricingHomepageSection />

      {/* Lead Form Section - Client Component with React handlers */}
      <LeadFormClient categories={mainCategories} />

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold mb-2" style={{ color: domainData.primaryColor || '#2563EB' }}>
              {stats.companiesCount}
            </div>
            <div className="text-gray-600 text-lg">Entreprises</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold mb-2" style={{ color: domainData.primaryColor || '#2563EB' }}>
              {stats.reviewsCount}
            </div>
            <div className="text-gray-600 text-lg">Avis Clients</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold mb-2" style={{ color: domainData.primaryColor || '#2563EB' }}>
              {stats.avgRating || '0.0'} ⭐
            </div>
            <div className="text-gray-600 text-lg">Note Moyenne</div>
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      {featuredCompanies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Entreprises Mises en Avant
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCompanies.map((company) => {
              const categories = company.companyCategories?.slice(0, 3).map(cc => cc.category) || [];
              return (
                <Link
                  key={company.id}
                  href={`/${company.slug}`}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  <h4 className="font-bold text-lg text-gray-900 mb-2">
                    {company.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {company.address}, {company.city}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1"
                      >
                        {cat.icon && <span>{cat.icon}</span>}
                        <span>{cat.name}</span>
                      </span>
                    ))}
                  </div>
                  {company.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 font-semibold">{company.rating.toFixed(1)}</span>
                      <span className="ml-1 text-sm text-gray-500">
                        ({company.reviewCount} avis)
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Categories Section - Main Categories Only */}
      {mainCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Catégories Populaires
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mainCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${encodeURIComponent(category.slug)}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer group"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {category.icon || '📁'}
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">
                    {category.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {category.count} entreprise{category.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/categories"
              className="inline-block px-8 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
              style={{ backgroundColor: domainData.primaryColor || '#2563EB' }}
            >
              Voir Toutes les Catégories
            </Link>
          </div>
        </section>
      )}

      {/* Structured Data */}
      <StructuredData
        domain={domainData}
        stats={stats}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
