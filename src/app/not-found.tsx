import Link from 'next/link';
import { headers } from 'next/headers';

export default async function NotFound() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              404
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            🔍 Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              URL demandée: <code className="bg-gray-100 px-2 py-1 rounded">{pathname}</code>
            </span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Retour à l'accueil
            </Link>

            <Link
              href="/annuaire"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Voir l'annuaire
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Popular Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Catégories Populaires
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {
                { name: 'Restaurant', icon: '🍽️', href: '/categories/Restaurant' },
                { name: 'Boulangerie', icon: '🥖', href: '/categories/Boulangerie' },
                { name: 'Pâtisserie', icon: '🍰', href: '/categories/Pâtisserie' },
                { name: 'Garage', icon: '🚗', href: '/categories/Garage' },
                { name: 'Santé', icon: '⚕️', href: '/categories/Santé' },
              ].map((category) => ((
                <Link
                  key={category.name}
                  href={category.href}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg transition-colors duration-200"
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Help Links */}
          <div className="text-sm text-gray-500">
            <p className="mb-2">Besoin d'aide ?</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact" className="hover:text-blue-600 transition-colors">
                Nous contacter
              </Link>
              <span>•</span>
              <Link href="/categories" className="hover:text-blue-600 transition-colors">
                Toutes les catégories
              </Link>
              <span>•</span>
              <Link href="/business/register" className="hover:text-blue-600 transition-colors">
                Créer un profil
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-white text-sm">
          <p className="opacity-90">
            Si vous pensez qu'il s'agit d'une erreur, veuillez{' '}
            <Link href="/contact" className="underline hover:opacity-80">
              nous contacter
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

