'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnsubscribeSuccessPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'all';

  const typeMessages = {
    all: 'Vous avez été désinscrit de toutes les notifications email.',
    newReview: 'Vous ne recevrez plus de notifications pour les nouveaux avis.',
    reviewReply: 'Vous ne recevrez plus de notifications pour les réponses aux avis.',
    weeklyDigest: 'Vous ne recevrez plus le résumé hebdomadaire.',
    marketing: 'Vous ne recevrez plus d\'emails marketing et promotionnels.',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Désinscription confirmée
        </h1>

        <p className="text-gray-600 mb-6">
          {typeMessages[type as keyof typeof typeMessages]}
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Si vous changez d'avis, vous pouvez modifier vos préférences 
            depuis votre espace professionnel.
          </p>

          <Link
            href="/business/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Accéder à mon espace
          </Link>
        </div>
      </div>
    </div>
  );
}