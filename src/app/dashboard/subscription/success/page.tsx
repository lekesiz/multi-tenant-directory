'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('Session ID not found');
      return;
    }

    // Verify payment was successful
    const verifyPayment = async () => {
      try {
        // In a real scenario, you'd verify with Stripe backend
        // For now, we'll assume success if session ID exists
        setStatus('success');
        setMessage('Votre abonnement a été activé avec succès!');

        // Redirect after 5 seconds
        setTimeout(() => {
          router.push('/dashboard/subscription');
        }, 5000);
      } catch (err) {
        console.error('Error:', err);
        setStatus('error');
        setMessage('An error occurred');
      }
    };

    verifyPayment();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Vérification du Paiement...
            </h2>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Paiement Réussi!
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="mt-4 text-sm text-gray-500">
              Redirection vers votre tableau de bord en 5 secondes...
            </p>
            <button
              onClick={() => router.push('/dashboard/subscription')}
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Aller au Tableau de Bord
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Erreur
            </h2>
            <p className="mt-2 text-red-600">{message}</p>
            <button
              onClick={() => router.push('/dashboard/subscription')}
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Retour aux Abonnements
            </button>
          </>
        )}
      </div>
    </div>
  );
}
