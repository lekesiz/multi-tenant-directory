'use client';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useState } from 'react';

const plans = [
  {
    name: 'Basic',
    monthlyPrice: 49,
    yearlyPrice: 499,
    description: 'Parfait pour commencer',
    features: [
      'Profil d\'entreprise complet',
      'Gestion des avis clients',
      '1 jour mis en avant par mois',
      'Statistiques de base',
      'Support par email',
      'Analytics simples',
    ],
    cta: 'Commencer',
    ctaLink: '/business/register?plan=basic',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 99,
    yearlyPrice: 999,
    description: 'Pour les professionnels sérieux',
    features: [
      'Tout du plan Basic',
      'Générateur de contenu IA',
      'Galerie vidéo illimitée',
      '5 jours mis en avant par mois',
      'Analytics avancées',
      'Support prioritaire',
      'Intégration API',
      'Badge professionnel',
    ],
    cta: 'Essayer gratuitement',
    ctaLink: '/business/register?plan=pro',
    highlighted: true,
  },
  {
    name: 'Premium',
    monthlyPrice: 199,
    yearlyPrice: 1999,
    description: 'Pour la visibilité maximale',
    features: [
      'Tout du plan Pro',
      'Jours mis en avant illimités',
      'Système de réservation',
      'Intégration e-commerce',
      'Accès API complet',
      'Support 24/7 dédié',
      'Multi-domaines',
      'Branding personnalisé',
      'Consultant personnel',
    ],
    cta: 'Contacter l\'équipe',
    ctaLink: '/contact',
    highlighted: false,
  },
];

export default function TarifsPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Haguenau.PRO
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Tarifs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tous les plans incluent une période d'essai gratuite de 14 jours.
            Pas de carte bancaire requise.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full bg-white shadow-sm p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annuel
              <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl border-2 transition-all ${
                plan.highlighted
                  ? 'border-blue-600 bg-white shadow-2xl scale-105'
                  : 'border-gray-200 bg-white hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-6 py-2 rounded-full text-sm">
                    ⭐ LE PLUS POPULAIRE
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      €{billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-gray-600">
                      /{billingPeriod === 'monthly' ? 'mois' : 'an'}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-sm text-gray-500 mt-2">
                      Soit €{Math.round(plan.yearlyPrice / 12)}/mois
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href={plan.ctaLink}
                  className={`w-full block text-center py-3 px-4 rounded-lg font-bold transition-all mb-8 ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Questions Fréquentes
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Puis-je changer de plan?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez changer ou annuler votre plan à tout moment. Les modifications prendront effet le mois suivant.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Comment fonctionnent les jours mis en avant?
              </h3>
              <p className="text-gray-600">
                Les jours mis en avant augmentent la visibilité de votre profil en le plaçant en haut des résultats de recherche.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Y a-t-il des frais cachés?
              </h3>
              <p className="text-gray-600">
                Non, tous nos prix sont fixes et transparents. Aucun frais supplémentaire n'est appliqué.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Comment puis-je annuler?
              </h3>
              <p className="text-gray-600">
                Vous pouvez annuler à tout moment depuis votre tableau de bord. Aucune pénalité n'est appliquée.
              </p>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="text-center">
          <div className="inline-block bg-yellow-100 text-yellow-900 font-bold px-6 py-3 rounded-full">
            💰 Garantie 30 jours satisfait ou remboursé
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 Haguenau.PRO - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}

