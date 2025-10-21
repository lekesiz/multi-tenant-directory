'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { 
  SUBSCRIPTION_PLANS, 
  formatPrice, 
  hasFeatureAccess,
  isOnTrial,
  getTrialDaysLeft,
  isSubscriptionActive 
} from '@/lib/stripe';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionCardProps {
  businessOwner: {
    subscriptionTier: string;
    subscriptionStatus: string;
    subscriptionEnd?: Date | null;
    trialStart?: Date | null;
    trialEnd?: Date | null;
    cancelAtPeriodEnd: boolean;
  };
  onSuccess?: () => void;
}

export default function SubscriptionCard({ businessOwner, onSuccess }: SubscriptionCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const currentPlan = SUBSCRIPTION_PLANS[businessOwner.subscriptionTier.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS] || SUBSCRIPTION_PLANS.FREE;
  const isActive = isSubscriptionActive(businessOwner);
  const onTrial = isOnTrial(businessOwner);
  const trialDaysLeft = getTrialDaysLeft(businessOwner);

  const handleUpgrade = async (planId: string) => {
    try {
      setLoading(planId);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/business/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/business/dashboard/billing?canceled=true`,
        }),
      });

      const { sessionId, url } = await response.json();

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session');
      }

      if (url) {
        window.location.href = url;
      } else if (sessionId) {
        const stripe = await stripePromise;
        if (stripe && 'redirectToCheckout' in stripe) {
          await (stripe as any).redirectToCheckout({ sessionId });
        }
      }

    } catch (error) {
      logger.error('Error creating checkout session:', error);
      toast.error('Erreur lors de la redirection vers le paiement');
    } finally {
      setLoading(null);
    }
  };

  const handleManageBilling = () => {
    // Redirect to Stripe customer portal
    toast('Redirection vers le portail de facturation...');
    // This would typically open the Stripe customer portal
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mon Abonnement</h2>
          <p className="text-gray-600">Gérez votre plan et facturation</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <span 
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentPlan.id === 'premium' ? 'bg-blue-100 text-blue-800' :
                currentPlan.id === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {currentPlan.name}
            </span>
            {onTrial && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Essai {trialDaysLeft}j
              </span>
            )}
          </div>
          {currentPlan.price !== null && (
            <p className="text-lg font-bold mt-1">
              {formatPrice(currentPlan.price)}/mois
            </p>
          )}
        </div>
      </div>

      {/* Current Plan Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Statut de l'abonnement</h3>
            <p className="text-gray-600">
              {onTrial ? (
                `Essai gratuit - ${trialDaysLeft} jours restants`
              ) : isActive ? (
                businessOwner.cancelAtPeriodEnd ? (
                  `Annulé - actif jusqu'au ${businessOwner.subscriptionEnd?.toLocaleDateString('fr-FR')}`
                ) : (
                  `Actif - prochaine facturation le ${businessOwner.subscriptionEnd?.toLocaleDateString('fr-FR')}`
                )
              ) : (
                'Plan gratuit'
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                isActive || onTrial ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isActive || onTrial ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Plan Features */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Fonctionnalités incluses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {currentPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Available Plans */}
      {currentPlan.id === 'free' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Plans disponibles</h3>
          
          {/* Premium Plan */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-blue-900">Plan Premium</h4>
                <p className="text-blue-700 text-sm">Augmentez votre visibilité</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-900">29€/mois</p>
                <p className="text-blue-700 text-xs">+ 14 jours gratuits</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-4">
              {SUBSCRIPTION_PLANS.PREMIUM.features.slice(1, 5).map((feature, index) => (
                <div key={index} className="flex items-center">
                  <svg className="w-3 h-3 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-blue-800">{feature}</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => handleUpgrade('premium')}
              disabled={loading === 'premium'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading === 'premium' ? 'Redirection...' : 'Passer Premium'}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-purple-900">Plan Entreprise</h4>
                <p className="text-purple-700 text-sm">Solution sur mesure</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-900">Sur mesure</p>
                <p className="text-purple-700 text-xs">Contactez-nous</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-4">
              {SUBSCRIPTION_PLANS.ENTERPRISE.features.slice(1, 5).map((feature, index) => (
                <div key={index} className="flex items-center">
                  <svg className="w-3 h-3 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-purple-800">{feature}</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => router.push('/contact?plan=enterprise')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Nous contacter
            </button>
          </div>
        </div>
      )}

      {/* Manage Billing */}
      {(isActive || onTrial) && currentPlan.id !== 'free' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleManageBilling}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Gérer la facturation
          </button>
        </div>
      )}
    </div>
  );
}