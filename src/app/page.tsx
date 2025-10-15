import Link from 'next/link';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { generateMetaTags, generateOrganizationSchema } from '@/lib/seo';
import { prisma } from '@/lib/prisma';
import StructuredData from '@/components/StructuredData';

export const dynamic = 'force-dynamic';

async function getDomainInfo() {
  const headersList = await headers();
  let domain = headersList.get('x-tenant-domain') || 'bas-rhin.pro';
  
  // www prefix'ini kaldır
  domain = domain.replace('www.', '');
  
  // Vercel deployment URL'lerini bas-rhin.pro'ya map et
  if (domain.includes('.vercel.app')) {
    domain = 'bas-rhin.pro';
  }
  
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  
  // Domain bilgisini database'den al
  const domainData = await prisma.domain.findUnique({
    where: { name: domain },
  });
  
  return { domain, cityName, displayName, domainData };
}

async function getStats(domainId: number) {
  // Şirket sayısı
  const companiesCount = await prisma.companyContent.count({
    where: {
      domainId,
      isVisible: true,
    },
  });

  // Toplam yorum sayısı
  const reviewsCount = await prisma.review.count({
    where: {
      company: {
        content: {
          some: {
            domainId,
            isVisible: true,
          },
        },
      },
      isApproved: true,
    },
  });

  // Ortalama puan
  const avgRating = await prisma.review.aggregate({
    where: {
      company: {
        content: {
          some: {
            domainId,
            isVisible: true,
          },
        },
      },
      isApproved: true,
    },
    _avg: {
      rating: true,
    },
  });

  return {
    companiesCount,
    reviewsCount,
    avgRating: avgRating._avg.rating ? avgRating._avg.rating.toFixed(1) : null,
  };
}

async function getPopularCategories(domainId: number) {
  // Tüm şirketleri al
  const companies = await prisma.company.findMany({
    where: {
      content: {
        some: {
          domainId,
          isVisible: true,
        },
      },
    },
    select: {
      categories: true,
    },
  });

  // Kategorileri say
  const categoryCount: Record<string, number> = {};
  companies.forEach((company) => {
    company.categories.forEach((category) => {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
  });

  // En popüler 8 kategoriyi al
  const sortedCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  return sortedCategories;
}

async function getFeaturedCompanies(domainId: number) {
  // Öne çıkan şirketler (priority > 0 veya featuredUntil > now)
  const featured = await prisma.company.findMany({
    where: {
      content: {
        some: {
          domainId,
          isVisible: true,
          OR: [
            { priority: { gt: 0 } },
            { featuredUntil: { gte: new Date() } },
          ],
        },
      },
    },
    include: {
      content: {
        where: {
          domainId,
        },
      },
    },
    orderBy: {
      content: {
        _count: 'desc',
      },
    },
    take: 6,
  });

  return featured;
}

export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getDomainInfo();
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
  const { domain, displayName, domainData } = await getDomainInfo();
  const organizationSchema = generateOrganizationSchema(domain);

  if (!domainData) {
    return <div>Domain not found</div>;
  }

  const stats = await getStats(domainData.id);
  const popularCategories = await getPopularCategories(domainData.id);
  const featuredCompanies = await getFeaturedCompanies(domainData.id);

  return (
    <>
      <StructuredData
        domain={domain}
        type="homepage"
        breadcrumbs={[
          { name: 'Accueil', url: `https://${domain}` }
        ]}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ background: domainData.primaryColor || '#2563EB' }}
              >
                {displayName.charAt(0)}
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {domainData.siteTitle || `${displayName}.PRO`}
                </h1>
                <p className="text-sm text-gray-500">
                  {domainData.siteDescription || `Les Professionnels de ${displayName}`}
                </p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Accueil
              </Link>
              <Link
                href="/annuaire"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Annuaire
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Catégories
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Trouvez les Meilleurs Professionnels
            <br />
            <span 
              className="text-transparent bg-clip-text"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${domainData.primaryColor || '#2563EB'}, #4F46E5)` 
              }}
            >
              à {displayName}
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Découvrez et contactez facilement les entreprises locales.
            Consultez les avis, comparez les services et trouvez le
            professionnel qu&apos;il vous faut.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <form action="/annuaire" method="GET" className="bg-white rounded-2xl shadow-xl p-4 flex items-center">
              <svg
                className="w-6 h-6 text-gray-400 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                name="search"
                placeholder="Rechercher un professionnel, un service..."
                className="flex-1 px-4 py-3 outline-none text-gray-900 text-lg"
              />
              <button 
                type="submit"
                className="text-white px-8 py-3 rounded-xl hover:opacity-90 transition-all font-semibold"
                style={{ background: domainData.primaryColor || '#2563EB' }}
              >
                Rechercher
              </button>
            </form>
          </div>
        </div>
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
                  <Link href="/politique-confidentialite" className="hover:text-white transition-colors">
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
      </div>
    </>
  );
}

