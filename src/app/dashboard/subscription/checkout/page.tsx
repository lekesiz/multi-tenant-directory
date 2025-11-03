'use client';

import { logger } from '@/lib/logger';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface CheckoutSession {
  sessionId: string;
  clientSecret?: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const companyId = searchParams.get('companyId');
  const planSlug = searchParams.get('plan');
  const billingPeriod = searchParams.get('period') || 'month';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<CheckoutSession | null>(null);

  useEffect(() => {
    if (!companyId || !planSlug) {
      router.push('/dashboard/subscription');
      return;
    }

    const createCheckout = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: parseInt(companyId),
            planSlug,
            billingPeriod,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSession(data);

          // Redirect to Stripe checkout
          const stripe = await stripePromise;
          if (stripe && data.sessionId) {
            const { error: redirectError } = await stripe.redirectToCheckout({
              sessionId: data.sessionId,
            });

            if (redirectError) {
              setError(redirectError.message || 'Failed to redirect to checkout');
            }
          }
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to create checkout session');
        }
      } catch (err) {
        logger.error('Error:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    createCheckout();
  }, [companyId, planSlug, billingPeriod, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
        {error ? (
          <>
            <div className="flex items-center gap-3 mb-4 p-4 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/subscription')}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Retour aux Plans
            </button>
          </>
        ) : (
          <>
            <div className="text-center">
              <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                Redirection vers le Paiement...
              </h2>
              <p className="mt-2 text-gray-600">
                Veuillez patienter pendant que nous vous redirigeons vers Stripe.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CheckoutFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Chargement du paiement...
        </h2>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}
