'use client';

import { CheckCircle, Users, Zap, Shield, TrendingUp, Headphones } from 'lucide-react';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: <CheckCircle className="h-8 w-8" />,
    title: 'Entreprises Vérifiées',
    description: 'Tous les profils sont vérifiés et authentiques. Pas de faux avis, pas de spam.',
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Avis Clients Réels',
    description: 'Lisez des avis authentiques de clients réels qui ont utilisé les services.',
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Recherche Rapide',
    description: 'Trouvez l\'entreprise parfaite en quelques secondes avec nos filtres intelligents.',
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Données Sécurisées',
    description: 'Vos données personnelles sont protégées selon les normes RGPD les plus strictes.',
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Croissance Garantie',
    description: 'Pour les professionnels: augmentez votre visibilité et trouvez plus de clients.',
  },
  {
    icon: <Headphones className="h-8 w-8" />,
    title: 'Support 24/7',
    description: 'Notre équipe est toujours disponible pour vous aider et répondre à vos questions.',
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Pourquoi Choisir Notre Plateforme?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nous offrons la solution complète pour trouver et évaluer les meilleures entreprises
            de votre région.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-8 hover:shadow-lg hover:border-blue-200 transition-all hover:-translate-y-1"
            >
              <div className="text-blue-600 mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Comparison Feature */}
        <div className="mt-20 lg:mt-32 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-12 border border-blue-100">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            La Différence Haguenau.Pro
          </h3>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <p className="text-gray-700">Vérifiés</p>
              <p className="text-sm text-gray-600 mt-2">Profils certifiés et validés</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">Local</div>
              <p className="text-gray-700">Première</p>
              <p className="text-sm text-gray-600 mt-2">Découvrez votre communauté</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">Gratuit</div>
              <p className="text-gray-700">Pour Chercher</p>
              <p className="text-sm text-gray-600 mt-2">Zéro frais pour les clients</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-600 mb-2">Simple</div>
              <p className="text-gray-700">et Intuitif</p>
              <p className="text-sm text-gray-600 mt-2">Interface facile à utiliser</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
