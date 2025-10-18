'use client';

import { Search, MapPin, Star, CheckCircle, MessageSquare, ThumbsUp, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
}

const stepsForCustomers: Step[] = [
  {
    number: 1,
    icon: <Search className="h-8 w-8" />,
    title: 'Recherchez',
    description: 'Entrez ce que vous cherchez (métier, service) et votre localisation',
    action: 'Recherche simplifiée',
  },
  {
    number: 2,
    icon: <MapPin className="h-8 w-8" />,
    title: 'Découvrez',
    description: 'Consultez les entreprises vérifiées avec les meilleures notes',
    action: 'Filtres intelligents',
  },
  {
    number: 3,
    icon: <Star className="h-8 w-8" />,
    title: 'Comparez',
    description: 'Lisez les avis authentiques et les évaluations des clients',
    action: 'Avis vérifiés',
  },
  {
    number: 4,
    icon: <CheckCircle className="h-8 w-8" />,
    title: 'Contactez',
    description: 'Appelez, écrivez ou visitez directement l\'entreprise de votre choix',
    action: 'Contact direct',
  },
];

const stepsForBusinesses: Step[] = [
  {
    number: 1,
    icon: <CheckCircle className="h-8 w-8" />,
    title: 'Créez',
    description: 'Créez votre profil professionnel en quelques minutes',
    action: 'Setup gratuit',
  },
  {
    number: 2,
    icon: <MessageSquare className="h-8 w-8" />,
    title: 'Personnalisez',
    description: 'Ajoutez vos photos, vidéos, horaires et informations',
    action: 'Profil complet',
  },
  {
    number: 3,
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Promovez',
    description: 'Achetez une annonce mise en avant pour plus de visibilité',
    action: 'Plans premium',
  },
  {
    number: 4,
    icon: <ThumbsUp className="h-8 w-8" />,
    title: 'Grandissez',
    description: 'Recevez des demandes, atteignez plus de clients et développez votre activité',
    action: 'Plus de clients',
  },
];

interface HowItWorksSectionProps {
  userType?: 'both' | 'customer' | 'business';
}

export default function HowItWorksSection({ userType = 'both' }: HowItWorksSectionProps) {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Comment Ça Marche?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, rapide et efficace pour tous
          </p>
        </div>

        {/* Steps for Customers */}
        {(userType === 'both' || userType === 'customer') && (
          <div className="mb-20 lg:mb-32">
            <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
              👥 Pour les Clients
            </h3>

            <div className="grid gap-6 md:grid-cols-4">
              {stepsForCustomers.map((step) => (
                <div key={step.number} className="relative">
                  {/* Connector Line */}
                  {step.number < stepsForCustomers.length && (
                    <div className="hidden md:block absolute top-20 left-[60%] w-[calc(100%-20px)] h-0.5 bg-gradient-to-r from-blue-200 to-blue-100" />
                  )}

                  {/* Card */}
                  <div className="relative z-10 bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                    {/* Step Number */}
                    <div className="absolute -top-6 left-8 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="text-blue-600 mb-6 mt-4">{step.icon}</div>

                    {/* Content */}
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                    <p className="text-gray-600 mb-4">{step.description}</p>

                    {/* Action Tag */}
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      {step.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps for Businesses */}
        {(userType === 'both' || userType === 'business') && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
              💼 Pour les Professionnels
            </h3>

            <div className="grid gap-6 md:grid-cols-4">
              {stepsForBusinesses.map((step) => (
                <div key={step.number} className="relative">
                  {/* Connector Line */}
                  {step.number < stepsForBusinesses.length && (
                    <div className="hidden md:block absolute top-20 left-[60%] w-[calc(100%-20px)] h-0.5 bg-gradient-to-r from-purple-200 to-purple-100" />
                  )}

                  {/* Card */}
                  <div className="relative z-10 bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                    {/* Step Number */}
                    <div className="absolute -top-6 left-8 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="text-purple-600 mb-6 mt-4">{step.icon}</div>

                    {/* Content */}
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                    <p className="text-gray-600 mb-4">{step.description}</p>

                    {/* Action Tag */}
                    <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                      {step.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 lg:mt-20 text-center">
          <p className="text-lg text-gray-600 mb-6">
            Prêt à commencer?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/annuaire"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg transition-shadow"
            >
              Je Cherche une Entreprise
            </Link>
            <Link
              href="/business/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-lg hover:border-gray-300 transition-colors"
            >
              Je Suis un Professionnel
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
