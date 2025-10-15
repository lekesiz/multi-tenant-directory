import Link from 'next/link';

export default function UnsubscribeErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Erreur de désinscription
        </h1>

        <p className="text-gray-600 mb-6">
          Le lien de désinscription est invalide ou a expiré.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Si vous souhaitez modifier vos préférences email, 
            veuillez vous connecter à votre espace professionnel.
          </p>

          <div className="space-y-2">
            <Link
              href="/business/login"
              className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </Link>
            
            <p className="text-xs text-gray-500 mt-4">
              Besoin d'aide ? <a href="mailto:support@example.com" className="text-blue-600 hover:underline">Contactez le support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}