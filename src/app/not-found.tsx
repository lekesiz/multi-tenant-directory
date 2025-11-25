import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getRedirectInfo, type UrlMatch } from '@/lib/url-matcher';

// Force dynamic rendering because this page uses headers() for domain detection
export const dynamic = 'force-dynamic';

export default async function NotFound() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  // Get smart redirect info
  const redirectInfo = getRedirectInfo(pathname);

  // Auto-redirect if confidence is very high
  if (redirectInfo.shouldRedirect && redirectInfo.redirectUrl) {
    redirect(redirectInfo.redirectUrl);
  }

  // Filter suggestions to show only relevant ones
  const relevantSuggestions = redirectInfo.suggestions.filter(s => s.score > 0.5);

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
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            🔍 Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              URL demandée: <code className="bg-gray-100 px-2 py-1 rounded">{pathname}</code>
            </span>
          </p>

          {/* Smart Suggestions */}
          {relevantSuggestions.length > 0 && (
            <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Vouliez-vous dire ?
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {relevantSuggestions.slice(0, 4).map((suggestion, index) => (
                  <SuggestionLink key={index} suggestion={suggestion} />
                ))}
              </div>
            </div>
          )}

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
              {[
                { name: 'Restaurant', icon: '🍽️', href: '/categories/Restaurant' },
                { name: 'Boulangerie', icon: '🥖', href: '/categories/Boulangerie' },
                { name: 'Pâtisserie', icon: '🍰', href: '/categories/Pâtisserie' },
                { name: 'Garage', icon: '🚗', href: '/categories/Garage' },
                { name: 'Santé', icon: '⚕️', href: '/categories/Santé' },
              ].map((category) => (
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

function SuggestionLink({ suggestion }: { suggestion: UrlMatch }) {
  const confidenceLabel = suggestion.score >= 0.9 ? 'Très probable' :
                          suggestion.score >= 0.7 ? 'Probable' : 'Possible';
  const confidenceColor = suggestion.score >= 0.9 ? 'bg-green-100 text-green-700' :
                          suggestion.score >= 0.7 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700';

  return (
    <Link
      href={suggestion.url}
      className="group flex flex-col items-center p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-500 hover:shadow-md transition-all duration-200"
    >
      <code className="text-blue-600 font-medium group-hover:text-blue-800 mb-2">
        {suggestion.url}
      </code>
      <span className={`text-xs px-2 py-1 rounded-full ${confidenceColor}`}>
        {confidenceLabel} ({Math.round(suggestion.score * 100)}%)
      </span>
    </Link>
  );
}
