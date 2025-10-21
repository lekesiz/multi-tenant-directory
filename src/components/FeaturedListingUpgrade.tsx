'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { Star, Check } from 'lucide-react';

interface FeaturedTier {
  id: string;
  name: string;
  price: number; // in cents
  days: number;
  features: string[];
  badge?: string;
}

interface FeaturedListingUpgradeProps {
  companyId: number;
  onPurchase?: (tier: FeaturedTier) => void;
  loading?: boolean;
}

const tiers: FeaturedTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    price: 2999, // €29.99
    days: 7,
    features: ['7 jours mis en avant', 'Visibilité premium', 'Badge Bronze'],
  },
  {
    id: 'silver',
    name: 'Argent',
    price: 4999, // €49.99
    days: 14,
    features: ['14 jours mis en avant', 'Visibilité maximale', 'Badge Argent', 'Statistiques détaillées'],
    badge: 'Populaire',
  },
  {
    id: 'gold',
    name: 'Or',
    price: 7999, // €79.99
    days: 30,
    features: ['30 jours mis en avant', 'Visibilité maximale+', 'Badge Or', 'Statistiques premium', 'Support prioritaire'],
  },
  {
    id: 'platinum',
    name: 'Platine',
    price: 14999, // €149.99
    days: 60,
    features: ['60 jours mis en avant', 'Visibilité exclusive', 'Badge Platine', 'Accès API', 'Consultat personnel'],
  },
];

export default function FeaturedListingUpgrade({
  companyId,
  onPurchase,
  loading = false,
}: FeaturedListingUpgradeProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>('silver');

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  const handlePurchase = async (tier: FeaturedTier) => {
    if (onPurchase) {
      onPurchase(tier);
      return;
    }

    // Default behavior: redirect to checkout
    try {
      const response = await fetch('/api/featured-listing/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          tier: tier.id,
          days: tier.days,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      logger.error('Error:', error);
    }
  };

  return (
    <div className="py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">
          Boostez Votre Annonce
        </h2>
        <p className="mt-2 text-gray-600">
          Choisissez un plan pour augmenter votre visibilité sur la plateforme
        </p>
      </div>

      {/* Tiers Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {tiers.map((tier) => {
          const isSelected = selectedTier === tier.id;
          const isPopular = tier.badge === 'Populaire';

          return (
            <div
              key={tier.id}
              className={`relative rounded-lg border-2 transition-all ${
                isPopular
                  ? 'border-yellow-400 shadow-xl'
                  : isSelected
                  ? 'border-blue-500'
                  : 'border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                    POPULAIRE
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Tier Name */}
                <div className="flex items-center gap-2 mb-2">
                  <Star className={`h-5 w-5 ${
                    tier.id === 'bronze' ? 'text-amber-700' :
                    tier.id === 'silver' ? 'text-gray-500' :
                    tier.id === 'gold' ? 'text-yellow-500' :
                    'text-blue-400'
                  }`} />
                  <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                </div>

                {/* Duration */}
                <p className="text-sm text-gray-600 mb-4">{tier.days} jours</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    €{formatPrice(tier.price)}
                  </span>
                  <p className="text-xs text-gray-600 mt-1">Paiement unique</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button
                  onClick={() => handlePurchase(tier)}
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isPopular
                      ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                      : isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Chargement...' : 'Sélectionner'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-12 rounded-lg bg-blue-50 p-6 text-center">
        <h3 className="font-semibold text-blue-900">Avantages des Annonces Mises en Avant</h3>
        <ul className="mt-3 text-sm text-blue-800 space-y-1">
          <li>✨ Apparaît en haut des résultats de recherche</li>
          <li>⭐ Badge de visibilité premium sur votre profil</li>
          <li>📊 Accès aux statistiques détaillées de visibilité</li>
          <li>🚀 Augmentation du taux de clics et des conversions</li>
        </ul>
      </div>
    </div>
  );
}
