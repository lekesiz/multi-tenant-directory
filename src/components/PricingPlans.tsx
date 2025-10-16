'use client';

import { useState } from 'react';
import { SUBSCRIPTION_PLANS, ANNUAL_PLANS, getPlansWithPricing } from '@/lib/stripe-config';
import { toast } from 'react-hot-toast';

interface PricingPlansProps {
  currentPlan?: string;
  onPlanSelect?: (planId: string, interval: 'month' | 'year') => void;
  showCurrentPlan?: boolean;
}

export default function PricingPlans({ 
  currentPlan = 'free', 
  onPlanSelect, 
  showCurrentPlan = true 
}: PricingPlansProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState<string | null>(null);

  const plans = getPlansWithPricing();
  const displayPlans = plans.filter(plan => plan.key !== 'free'); // Hide free plan in pricing

  const handlePlanSelect = async (planId: string) => {
    if (loading) return;
    
    setLoading(planId);
    
    try {
      if (onPlanSelect) {
        await onPlanSelect(planId, billingInterval);
      } else {
        // Default behavior - redirect to checkout
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId,
            interval: billingInterval,
            successUrl: `${window.location.origin}/business/dashboard?payment=success`,
            cancelUrl: `${window.location.origin}/pricing?payment=cancelled`,
          }),
        });

        const data = await response.json();
        
        if (data.success && data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Erreur lors de la création de la session');
        }
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Erreur lors de la sélection du plan');
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (price: number, interval: 'month' | 'year') => {
    if (price === 0) return 'Gratuit';
    
    const formattedPrice = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
    
    const periodText = interval === 'month' ? '/mois' : '/an';
    return `${formattedPrice}${periodText}`;
  };

  const getMonthlyEquivalent = (annualPrice: number) => {
    const monthly = annualPrice / 12;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(monthly);
  };

  const isCurrentPlan = (planId: string) => {
    return currentPlan === planId;
  };

  const getPlanPrice = (plan: any) => {
    if (billingInterval === 'year' && plan.annual) {
      return plan.annual.price;
    }
    return plan.price;
  };

  const getPopularBadge = (planId: string) => {
    return planId === 'pro' ? (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
          Plus populaire
        </span>
      </div>
    ) : null;
  };

  return (
    <div className="py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choisissez votre plan
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Commencez gratuitement, puis évoluez selon vos besoins
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <span className={`text-sm ${
            billingInterval === 'month' ? 'text-gray-900 font-medium' : 'text-gray-500'
          }`}>
            Mensuel
          </span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingInterval === 'year' ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${
            billingInterval === 'year' ? 'text-gray-900 font-medium' : 'text-gray-500'
          }`}>
            Annuel
          </span>
          {billingInterval === 'year' && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              -20%
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {displayPlans.map((plan) => {
          const price = getPlanPrice(plan);
          const isCurrent = isCurrentPlan(plan.key);
          const isEnterprise = plan.key === 'enterprise';
          
          return (
            <div
              key={plan.key}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                plan.key === 'pro' 
                  ? 'border-purple-200 ring-2 ring-purple-100' 
                  : 'border-gray-200'
              } ${
                isCurrent ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {getPopularBadge(plan.key)}
              
              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(price, billingInterval).split('/')[0]}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {billingInterval === 'year' && plan.annual ? (
                        <div>
                          <span className="text-sm">par an</span>
                          <div className="text-sm text-green-600">
                            équivaut à {getMonthlyEquivalent(price)}/mois
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm">par mois</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">
                      {plan.features.companies === -1 ? 'Entreprises illimitées' : 
                       `${plan.features.companies} entreprise${plan.features.companies > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">
                      {plan.features.reviews === -1 ? 'Avis illimités' : 
                       `${plan.features.reviews} avis`}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">
                      {plan.features.photos === -1 ? 'Photos illimitées' : 
                       `${plan.features.photos} photos`}
                    </span>
                  </div>
                  
                  {plan.features.analytics && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Analytics avancées</span>
                    </div>
                  )}
                  
                  {plan.features.ai_features && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Fonctionnalités IA</span>
                    </div>
                  )}
                  
                  {plan.features.marketing_automation && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Automation marketing</span>
                    </div>
                  )}
                  
                  {plan.features.priority_support && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Support prioritaire</span>
                    </div>
                  )}
                  
                  {plan.features.white_label && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">White label</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div>
                  {isCurrent && showCurrentPlan ? (
                    <div className="w-full py-3 px-4 bg-gray-100 text-gray-600 text-center rounded-lg font-medium">
                      Plan actuel
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePlanSelect(plan.key)}
                      disabled={loading === plan.key}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        plan.key === 'pro'
                          ? 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400'
                          : isEnterprise
                          ? 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                      }`}
                    >
                      {loading === plan.key ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Chargement...
                        </div>
                      ) : isEnterprise ? (
                        'Nous contacter'
                      ) : (
                        'Commencer'
                      )}
                    </button>
                  )}
                </div>

                {/* Trial Info */}
                {!isCurrent && !isEnterprise && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Essai gratuit de 14 jours
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          Tous les plans incluent un essai gratuit de 14 jours. Aucune carte de crédit requise.
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Annulation à tout moment
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Support client 24/7
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Migration gratuite
          </div>
        </div>
      </div>
    </div>
  );
}