'use client';

import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PricingTier {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
  ctaLink: string;
}

const tiers: PricingTier[] = [
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
    highlighted: false,
    cta: 'Commencer',
    ctaLink: '/dashboard/subscription/checkout?plan=basic&period=month',
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
    highlighted: true,
    cta: 'Essayer gratuitement',
    ctaLink: '/dashboard/subscription/checkout?plan=pro&period=month',
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
    highlighted: false,
    cta: 'Contacter l\'équipe',
    ctaLink: '/contact',
  },
];

export default function PricingHomepageSection() {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Plans Simples et Transparents
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tous les plans incluent une période d'essai gratuite de 14 jours.
            Pas de carte bancaire requise.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button className="px-6 py-2 rounded-full bg-white text-blue-600 font-medium shadow-sm">
              Mensuel
            </button>
            <button className="px-6 py-2 rounded-full text-gray-600 font-medium flex items-center gap-2">
              Annuel
              <span className="ml-1 inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border-2 transition-all ${
                tier.highlighted
                  ? 'border-blue-600 bg-gradient-to-b from-blue-50 to-white shadow-2xl scale-105'
                  : 'border-gray-200 bg-white hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-6 py-2 rounded-full text-sm">
                    ⭐ LE PLUS POPULAIRE
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 mb-6">{tier.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">€{tier.monthlyPrice}</span>
                    <span className="text-gray-600">/mois</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    ou €{tier.yearlyPrice} facturé annuellement
                  </p>
                </div>

                {/* CTA Button */}
                <Link
                  href={tier.ctaLink}
                  className={`w-full block text-center py-3 px-4 rounded-lg font-bold transition-all mb-8 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                </Link>

                {/* Features */}
                <div className="space-y-4">
                  {tier.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-12 border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Questions Fréquentes
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Puis-je changer de plan?</h4>
              <p className="text-gray-600">
                Oui, vous pouvez changer ou annuler votre plan à tout moment. Les modifications prendront effet le mois suivant.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Comment fonctionnent les jours mis en avant?</h4>
              <p className="text-gray-600">
                Les jours mis en avant augmentent la visibilité de votre profil en le plaçant en haut des résultats de recherche.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Y a-t-il des frais cachés?</h4>
              <p className="text-gray-600">
                Non, tous nos prix sont fixes et transparents. Aucun frais supplémentaire n'est appliqué.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Comment puis-je annuler?</h4>
              <p className="text-gray-600">
                Vous pouvez annuler à tout moment depuis votre tableau de bord. Aucune pénalité n'est appliquée.
              </p>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <div className="inline-block rounded-full bg-yellow-100 text-yellow-900 px-6 py-3 font-medium">
            💰 Garantie 30 jours satisfait ou remboursé
          </div>
        </div>
      </div>
    </section>
  );
}
