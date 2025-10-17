'use client';

import { ArrowRight, Search, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  domain?: string;
}

export default function HeroSection({ domain = 'Haguenau' }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-48 -mb-48" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:py-32 lg:py-40">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium mb-6">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-300" />
                Découvrez les Meilleures Entreprises
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Trouvez les Meilleures <br />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-100 bg-clip-text text-transparent">
                Entreprises de {domain}
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
              Découvrez des milliers d'entreprises vérifiées, notées par des clients réels.
              De la restauration à l'artisanat, trouvez exactement ce que vous cherchez.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Search className="h-5 w-5" />
                Commencer la Recherche
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/business/register"
                className="inline-flex items-center justify-center gap-2 bg-white/20 border border-white/40 text-white font-bold px-8 py-4 rounded-lg hover:bg-white/30 transition-colors"
              >
                Je suis un Professionnel
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold">5K+</span>
                </div>
                <p className="text-blue-100 text-sm">Entreprises Vérifiées</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold">50K+</span>
                </div>
                <p className="text-blue-100 text-sm">Avis Clients</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-6 w-6 fill-yellow-200 text-yellow-200" />
                  <span className="text-2xl font-bold">4.8/5</span>
                </div>
                <p className="text-blue-100 text-sm">Note Moyenne</p>
              </div>
            </div>
          </div>

          {/* Right - Search Box */}
          <div className="relative">
            <div className="rounded-2xl bg-white/95 backdrop-blur p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Que cherchez-vous?
              </h2>

              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Plombier, Restaurant, Coiffeur..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Location Input */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={domain}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Search Button */}
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow">
                  Rechercher
                </button>
              </div>

              {/* Popular Searches */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                  Recherches Populaires
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Restaurant', 'Plombier', 'Coiffeur', 'Garage', 'Médecin'].map((search) => (
                    <button
                      key={search}
                      className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-yellow-400 text-gray-900 rounded-full p-6 shadow-lg">
              <div className="text-2xl font-bold">🎉</div>
              <p className="text-xs font-bold mt-2">14 Jours<br />Gratuits</p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-20 rounded-xl bg-white/10 backdrop-blur border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-100 mb-1">
                🔒 Toutes les données sont sécurisées et vérifiées
              </p>
              <p className="text-sm text-blue-200">
                RGPD compliant • Données vérifiées • Avis authentiques
              </p>
            </div>
            <div className="flex gap-4 text-xs font-medium text-blue-100">
              <span className="flex items-center gap-1">✓ Transparent</span>
              <span className="flex items-center gap-1">✓ Fiable</span>
              <span className="flex items-center gap-1">✓ Facile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
