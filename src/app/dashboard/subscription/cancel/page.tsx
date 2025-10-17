'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          Paiement Annulé
        </h2>
        <p className="mt-2 text-gray-600">
          Vous avez annulé le processus de paiement. Votre abonnement n'a pas été modifié.
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.push('/dashboard/subscription')}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retourner aux Abonnements
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Aller au Tableau de Bord
          </button>
        </div>
      </div>
    </div>
  );
}
