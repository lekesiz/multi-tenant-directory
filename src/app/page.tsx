import { headers } from 'next/headers';
import Link from 'next/link';

async function getDomainInfo() {
  const headersList = await headers();
  const domain = headersList.get('x-tenant-domain') || 'haguenau.pro';
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  
  return { domain, cityName, displayName };
}

export default async function Home() {
  const { displayName } = await getDomainInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {displayName.charAt(0)}
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {displayName}.PRO
                </h1>
                <p className="text-sm text-gray-500">
                  Les Professionnels de {displayName}
                </p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Trouvez les Meilleurs Professionnels
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
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
            <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center">
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
                placeholder="Rechercher un professionnel, un service..."
                className="flex-1 px-4 py-3 outline-none text-gray-900 text-lg"
              />
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold">
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-gray-600 font-medium">
              Professionnels Référencés
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold text-indigo-600 mb-2">0</div>
            <div className="text-gray-600 font-medium">Avis Clients</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold text-purple-600 mb-2">-</div>
            <div className="text-gray-600 font-medium">Note Moyenne</div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Catégories Populaires
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Restaurants', icon: '🍽️', count: 0 },
            { name: 'Services', icon: '🔧', count: 0 },
            { name: 'Commerces', icon: '🏪', count: 0 },
            { name: 'Santé', icon: '⚕️', count: 0 },
            { name: 'Beauté', icon: '💄', count: 0 },
            { name: 'Éducation', icon: '📚', count: 0 },
            { name: 'Loisirs', icon: '🎨', count: 0 },
            { name: 'Immobilier', icon: '🏠', count: 0 },
          ].map((category) => (
            <Link
              key={category.name}
              href={`/categories/${category.name.toLowerCase()}`}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="text-4xl mb-3">{category.icon}</div>
              <div className="font-semibold text-gray-900 mb-1">
                {category.name}
              </div>
              <div className="text-sm text-gray-500">
                {category.count} entreprises
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-12 text-center text-white">
          <h3 className="text-4xl font-bold mb-4">
            Vous êtes un Professionnel ?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez notre plateforme et augmentez votre visibilité locale
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
            Créer Mon Profil Gratuitement
          </button>
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
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>03 67 31 07 70</li>
                <li>pro@{displayName.toLowerCase()}.pro</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 {displayName}.PRO - Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}

