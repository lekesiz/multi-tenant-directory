import Link from 'next/link';
import { Metadata } from 'next';
import { generateMetaTags } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import HeroSection from '@/components/HeroSection';
import BenefitsSection from '@/components/BenefitsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FeaturedBusinessesCarousel from '@/components/FeaturedBusinessesCarousel';
import PricingHomepageSection from '@/components/PricingHomepageSection';

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
 * Get popular categories for a domain
 */
async function getPopularCategories(domainId: number) {
  const categories = await getCompaniesByCategoryCount(domainId);
  return categories.slice(0, 8);
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
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

const categoryIcons: Record<string, string> = {
  Restaurant: '🍽️',
  Boulangerie: '🥖',
  Pâtisserie: '🍰',
  Pharmacie: '💊',
  Garage: '🚗',
  Coiffure: '💇',
  Beauté: '💄',
  Santé: '⚕️',
  Médecin: '🩺',
  Dentiste: '🦷',
  Kinésithérapie: '🏥',
  Fleuriste: '🌸',
  Pizzeria: '🍕',
  Tabac: '🚬',
  Presse: '📰',
  Immobilier: '🏠',
  Banque: '🏦',
  Supermarché: '🛒',
  Café: '☕',
  Bar: '🍺',
  Plomberie: '🔧',
  Chauffage: '🔥',
  Optique: '👓',
  'Auto-École': '🚦',
  Vétérinaire: '🐾',
  Librairie: '📚',
  Papeterie: '✏️',
  Menuiserie: '🪚',
  Électricité: '⚡',
  Boucherie: '🥩',
  Charcuterie: '🥓',
  Traiteur: '🍱',
  Épicerie: '🏪',
  Commerce: '🛍️',
  Services: '🔧',
  Loisirs: '🎨',
  Éducation: '📚',
  Formation: '🎓',
  Artisan: '🔨',
  Poterie: '🏺',
  Brasserie: '🍺',
  Musée: '🏛️',
};

function getCategoryIcon(categoryName: string): string {
  return categoryIcons[categoryName] || '📍';
}

export default async function Home() {
  try {
    const { domain, displayName, domainData } = await getCurrentDomainInfo();

    if (!domainData) {
      return <div>Domain not found</div>;
    }

    // Fetch all data in parallel for better performance
    const [stats, popularCategories, featuredCompanies] = await Promise.all([
      getStats(domainData.id),
      getPopularCategories(domainData.id),
      getFeaturedCompanies(domainData.id),
    ]);

  return (
    <>
      <StructuredData
        domain={domain}
        type="homepage"
        breadcrumbs={[
          { name: 'Accueil', url: `https://${domain}` }
        ]}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection domain={displayName} />

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
          categories: c.categories || [],
          rating: c.rating || 0,
          reviewCount: c._count?.reviews || 0,
          logoUrl: c.logoUrl,
        }))} />
      )}

      {/* Pricing Section */}
      <PricingHomepageSection />

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold mb-2" style={{ color: domainData.primaryColor || '#2563EB' }}>
              {stats.companiesCount}
            </div>
            <div className="text-gray-600 font-medium">
              Professionnels Référencés
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold text-indigo-600 mb-2">
              {stats.reviewsCount}
            </div>
            <div className="text-gray-600 font-medium">Avis Clients</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {stats.avgRating || '-'}
            </div>
            <div className="text-gray-600 font-medium">Note Moyenne</div>
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
            {featuredCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  {company.name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {company.address}, {company.city}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {company.categories.slice(0, 3).map((cat) => (
                    <span
                      key={cat}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                    >
                      {cat}
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
            ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Catégories Populaires
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {popularCategories.map((category) => (
            <Link
              key={category.name}
              href={`/categories/${encodeURIComponent(category.name)}`}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="text-4xl mb-3">{getCategoryIcon(category.name)}</div>
              <div className="font-semibold text-gray-900 mb-1">
                {category.name}
              </div>
              <div className="text-sm text-gray-500">
                {category.count} entreprise{category.count > 1 ? 's' : ''}
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="inline-block text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
            style={{ background: domainData.primaryColor || '#2563EB' }}
          >
            Voir Toutes les Catégories
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div 
          className="rounded-3xl shadow-2xl p-12 text-center text-white"
          style={{ background: `linear-gradient(to right, ${domainData.primaryColor || '#2563EB'}, #4F46E5)` }}
        >
          <h3 className="text-4xl font-bold mb-4">
            Vous êtes un Professionnel ?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez notre plateforme et augmentez votre visibilité locale
          </p>
          <Link
            href="/admin/login"
            className="inline-block bg-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
            style={{ color: domainData.primaryColor || '#2563EB' }}
          >
            Créer Mon Profil Gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">{displayName}.PRO</h4>
              <p className="text-gray-400 text-sm">
                La plateforme de référence pour trouver les meilleurs
                professionnels à {displayName}.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Navigation</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link
                    href="/annuaire"
                    className="hover:text-white transition-colors"
                  >
                    Annuaire
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="hover:text-white transition-colors"
                  >
                    Catégories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Professionnels</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    href="/rejoindre"
                    className="hover:text-white transition-colors"
                  >
                    Créer un Profil
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tarifs"
                    className="hover:text-white transition-colors"
                  >
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/login"
                    className="hover:text-white transition-colors"
                  >
                    Espace Pro
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Autres Villes</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="https://bas-rhin.pro" className="hover:text-white transition-colors font-bold text-yellow-400" rel="nofollow">
                    ⭐ Bas-Rhin
                  </a>
                </li>
                <li>
                  <a href="https://bischwiller.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Bischwiller
                  </a>
                </li>
                <li>
                  <a href="https://bouxwiller.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Bouxwiller
                  </a>
                </li>
                <li>
                  <a href="https://brumath.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Brumath
                  </a>
                </li>
                <li>
                  <a href="https://erstein.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Erstein
                  </a>
                </li>
                <li>
                  <a href="https://geispolsheim.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Geispolsheim
                  </a>
                </li>
                <li>
                  <a href="https://haguenau.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Haguenau
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Second row of cities */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
            <div>
              <h5 className="font-semibold mb-4">Plus de Villes</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="https://hoerdt.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Hœrdt
                  </a>
                </li>
                <li>
                  <a href="https://illkirch.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Illkirch
                  </a>
                </li>
                <li>
                  <a href="https://ingwiller.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Ingwiller
                  </a>
                </li>
                <li>
                  <a href="https://ittenheim.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Ittenheim
                  </a>
                </li>
                <li>
                  <a href="https://mutzig.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Mutzig
                  </a>
                </li>
                <li>
                  <a href="https://ostwald.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Ostwald
                  </a>
                </li>
                <li>
                  <a href="https://saverne.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Saverne
                  </a>
                </li>
              </ul>
            </div>
            <div className="md:col-start-2">
              <h5 className="font-semibold mb-4 invisible">Plus</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="https://schiltigheim.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Schiltigheim
                  </a>
                </li>
                <li>
                  <a href="https://schweighouse.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Schweighouse
                  </a>
                </li>
                <li>
                  <a href="https://souffelweyersheim.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Souffelweyersheim
                  </a>
                </li>
                <li>
                  <a href="https://soufflenheim.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Soufflenheim
                  </a>
                </li>
                <li>
                  <a href="https://vendenheim.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Vendenheim
                  </a>
                </li>
                <li>
                  <a href="https://wissembourg.pro" className="hover:text-white transition-colors" rel="nofollow">
                    Wissembourg
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Nous Contacter
                  </Link>
                </li>
                <li>03 67 31 07 70</li>
                <li>pro@{displayName.toLowerCase()}.pro</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Légal</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/mentions-legales" className="hover:text-white transition-colors">
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link href="/politique-de-confidentialite" className="hover:text-white transition-colors">
                    Politique de Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="hover:text-white transition-colors">
                    CGU
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Suivez-nous</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 {displayName}.PRO - Tous droits réservés | Annuaire des Professionnels en Alsace
          </div>
        </div>
      </footer>

      {/* Structured Data (JSON-LD) */}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      </div>
    </>
    );
  } catch (error) {
    console.error('Homepage error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600 mt-2">An error occurred loading the homepage</p>
          {error instanceof Error && <p className="text-sm text-gray-500 mt-2">{error.message}</p>}
        </div>
      </div>
    );
  }
}

