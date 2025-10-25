import { logger } from '@/lib/logger';
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
import LeadForm from '@/components/LeadForm';
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
import { getCategoryFrenchName } from '@/lib/categories';

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
 * Get popular categories for a domain with French names
 */
async function getPopularCategories(domainId: number) {
  const categories = await getCompaniesByCategoryCount(domainId);
  const topCategories = categories.slice(0, 8);
  
  // Get French names for each category
  const categoriesWithFrenchNames = await Promise.all(
    topCategories.map(async (cat) => {
      // Get category ID from database
      const categoryRecord = await prisma.businessCategory.findFirst({
        where: { googleCategory: cat.name }
      });
      
      return {
        id: categoryRecord?.id || 0,
        slug: cat.name,
        name: await getCategoryFrenchName(cat.name),
        count: cat.count,
      };
    })
  );
  
  return categoriesWithFrenchNames;
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
    const [stats, featuredCompanies] = await Promise.all([
      getStats(domainData.id),
      getFeaturedCompanies(domainData.id),
    ]);

    // Get popular categories for LeadForm (with error handling)
    let popularCategories: Array<{
      id: number;
      slug: string;
      name: string;
      count: number;
    }> = [];
    try {
      popularCategories = await getPopularCategories(domainData.id);
    } catch (error) {
      logger.error('Error fetching popular categories:', error);
      // Fallback to empty array if database is not available
      popularCategories = [];
    }

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
        <FeaturedBusinessesCarousel businesses={await Promise.all(featuredCompanies.map(async c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          address: c.address || '',
          city: c.city || '',
          categories: await Promise.all((c.categories || []).map(cat => getCategoryFrenchName(cat))),
          rating: c.rating || 0,
          reviewCount: c.reviewCount || 0,
          logoUrl: c.logoUrl,
        })))} />
      )}

      {/* Pricing Section */}
      <PricingHomepageSection />

      {/* Lead Form Section - Client-side only */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Trouvez le bon professionnel pour votre projet
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            Décrivez votre besoin en quelques clics, nous vous mettons en relation avec les meilleurs experts locaux.
          </p>
          
          <form id="leadForm" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de service
              </label>
              <select id="category" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">Sélectionnez une catégorie (optionnel)</option>
                <option value="plombier">🔧 Plombier</option>
                <option value="electricien">⚡ Électricien</option>
                <option value="chauffagiste">🔥 Chauffagiste</option>
                <option value="menuisier">🔨 Menuisier</option>
                <option value="peintre">🎨 Peintre</option>
                <option value="carreleur">🧱 Carreleur</option>
                <option value="jardinier">🌱 Jardinier</option>
                <option value="nettoyage">🧽 Nettoyage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Postal <span className="text-red-500">*</span>
              </label>
              <input
                id="postalCode"
                type="text"
                placeholder="Ex: 67000"
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Ex: 0612345678"
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (optionnel)
              </label>
              <input
                id="email"
                type="email"
                placeholder="Ex: votre.email@example.com"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Décrivez votre besoin (optionnel)
              </label>
              <textarea
                id="note"
                rows={4}
                placeholder="Ex: Je cherche un plombier pour réparer une fuite d'eau dans ma salle de bain."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="consentSharing"
                  type="checkbox"
                  required
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  J'accepte que ma demande soit partagée avec les professionnels sélectionnés et que je sois recontacté(e). <span className="text-red-500">*</span>
                </label>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="consentMarketing"
                  type="checkbox"
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  J'accepte de recevoir des communications marketing de la part de la plateforme (optionnel).
                </label>
              </div>
            </div>

            <button
              type="submit"
              id="submitBtn"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Envoyer Ma Demande
            </button>
          </form>

          <div id="successMessage" className="hidden mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            ✅ Votre demande a été envoyée avec succès ! Nous vous contacterons bientôt.
          </div>

          <div id="errorMessage" className="hidden mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            ❌ Une erreur est survenue. Veuillez réessayer.
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            // Category mapping function
            function getCategoryId(categoryValue) {
              const categoryMap = {
                'plombier': 1,
                'electricien': 2,
                'chauffagiste': 3,
                'menuisier': 4,
                'peintre': 5,
                'carreleur': 6,
                'jardinier': 7,
                'nettoyage': 8
              };
              return categoryMap[categoryValue] || null;
            }

            document.addEventListener('DOMContentLoaded', function() {
              const form = document.getElementById('leadForm');
              const submitBtn = document.getElementById('submitBtn');
              const successMessage = document.getElementById('successMessage');
              const errorMessage = document.getElementById('errorMessage');

              form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Show loading state
                submitBtn.disabled = true;
                submitBtn.textContent = 'Envoi en cours...';
                
                // Hide previous messages
                successMessage.classList.add('hidden');
                errorMessage.classList.add('hidden');

                try {
                  // Get form data
                  const categoryValue = document.getElementById('category').value;
                  const formData = {
                    categoryId: categoryValue ? getCategoryId(categoryValue) : null,
                    postalCode: document.getElementById('postalCode').value,
                    phone: document.getElementById('phone').value,
                    email: document.getElementById('email').value,
                    note: document.getElementById('note').value,
                    consentFlags: {
                      sharing: document.getElementById('consentSharing').checked,
                      marketing: document.getElementById('consentMarketing').checked
                    }
                  };

                  // Send to API
                  const response = await fetch('/api/leads', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                  });

                  if (response.ok) {
                    // Show success message
                    successMessage.classList.remove('hidden');
                    form.reset();
                  } else {
                    // Show error message
                    errorMessage.classList.remove('hidden');
                  }
                } catch (error) {
                  console.error('Error:', error);
                  errorMessage.classList.remove('hidden');
                } finally {
                  // Reset button state
                  submitBtn.disabled = false;
                  submitBtn.textContent = 'Envoyer Ma Demande';
                }
              });
            });
          `
        }} />
      </section>

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
            {await Promise.all(featuredCompanies.map(async (company) => {
              const frenchCategories = await Promise.all(
                company.categories.slice(0, 3).map(cat => getCategoryFrenchName(cat))
              );
              return (
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
                    {frenchCategories.map((cat, idx) => (
                      <span
                        key={idx}
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
              );
            }))}
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
              key={category.slug}
              href={`/categories/${encodeURIComponent(category.slug)}`}
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
            href="/business/register"
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
    logger.error('Homepage error:', error);
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

