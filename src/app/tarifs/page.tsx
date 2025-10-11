import { headers } from 'next/headers';
import Link from 'next/link';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

async function getDomainInfo() {
  const headersList = await headers();
  let domain = headersList.get('x-tenant-domain') || 'haguenau.pro';
  
  domain = domain.replace('www.', '');
  
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  
  const domainData = await prisma.domain.findUnique({
    where: { name: domain },
  });
  
  return { domain, cityName, displayName, domainData };
}

export async function generateMetadata(): Promise<Metadata> {
  const { displayName } = await getDomainInfo();
  
  return {
    title: `Tarifs - ${displayName}.PRO`,
    description: `Découvrez nos offres et tarifs pour les professionnels de ${displayName}. Inscription gratuite et options premium.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function TarifsPage() {
  const { displayName, domainData } = await getDomainInfo();

  if (!domainData) {
    return <div>Domain not found</div>;
  }

  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      description: 'Parfait pour commencer',
      features: [
        'Profil professionnel complet',
        'Informations de contact',
        'Horaires d\'ouverture',
        'Catégories (jusqu\'à 3)',
        'Visibilité dans l\'annuaire',
        'Avis clients',
      ],
      cta: 'Créer mon profil',
      ctaLink: '/admin/login',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: '29€',
      period: '/mois',
      description: 'Pour plus de visibilité',
      features: [
        'Tout du plan Gratuit',
        'Badge "Premium"',
        'Mise en avant sur la page d\'accueil',
        'Photos illimitées',
        'Promotions et offres spéciales',
        'Statistiques détaillées',
        'Support prioritaire',
      ],
      cta: 'Passer Premium',
      ctaLink: '/contact',
      highlighted: true,
    },
    {
      name: 'Entreprise',
      price: 'Sur mesure',
      period: '',
      description: 'Pour les grandes structures',
      features: [
        'Tout du plan Premium',
        'Plusieurs emplacements',
        'API d\'intégration',
        'Gestion multi-utilisateurs',
        'Campagnes publicitaires',
        'Accompagnement personnalisé',
        'Contrat sur mesure',
      ],
      cta: 'Nous contacter',
      ctaLink: '/contact',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ background: domainData.primaryColor || '#2563EB' }}
              >
                {displayName.charAt(0)}
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {domainData.siteTitle || `${displayName}.PRO`}
                </h1>
                <p className="text-sm text-gray-500">
                  {domainData.siteDescription || `Les Professionnels de ${displayName}`}
                </p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Accueil
              </Link>
              <Link
                href="/annuaire"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Annuaire
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Catégories
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Nos Tarifs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choisissez l'offre qui correspond le mieux à vos besoins.
            Commencez gratuitement et passez Premium quand vous le souhaitez.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.highlighted ? 'ring-4 ring-blue-600 transform scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <div 
                  className="text-white text-center py-2 text-sm font-semibold"
                  style={{ background: domainData.primaryColor || '#2563EB' }}
                >
                  ⭐ Le plus populaire
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  )}
                </div>
                <Link
                  href={plan.ctaLink}
                  className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? 'text-white hover:opacity-90'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  style={
                    plan.highlighted
                      ? { background: domainData.primaryColor || '#2563EB' }
                      : {}
                  }
                >
                  {plan.cta}
                </Link>
              </div>
              <div className="border-t border-gray-200 p-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-3 flex-shrink-0">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Questions Fréquentes
          </h3>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Puis-je changer de plan à tout moment ?
              </h4>
              <p className="text-gray-600">
                Oui, vous pouvez passer d'un plan à un autre à tout moment.
                Le changement est immédiat et vous ne payez que la différence au prorata.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Y a-t-il un engagement ?
              </h4>
              <p className="text-gray-600">
                Non, aucun engagement. Vous pouvez annuler votre abonnement Premium
                à tout moment. Le plan Gratuit reste accessible indéfiniment.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Quels moyens de paiement acceptez-vous ?
              </h4>
              <p className="text-gray-600">
                Nous acceptons les cartes bancaires (Visa, Mastercard, American Express)
                et les virements bancaires pour les plans Entreprise.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Puis-je essayer le plan Premium gratuitement ?
              </h4>
              <p className="text-gray-600">
                Oui, nous offrons 14 jours d'essai gratuit du plan Premium.
                Aucune carte bancaire n'est requise pour commencer.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20">
          <div 
            className="rounded-3xl shadow-2xl p-12 text-center text-white"
            style={{ background: `linear-gradient(to right, ${domainData.primaryColor || '#2563EB'}, #4F46E5)` }}
          >
            <h3 className="text-4xl font-bold mb-4">
              Prêt à commencer ?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Créez votre profil professionnel gratuitement en quelques minutes
            </p>
            <Link
              href="/admin/login"
              className="inline-block bg-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
              style={{ color: domainData.primaryColor || '#2563EB' }}
            >
              Créer Mon Profil Maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">{displayName}.PRO</h4>
              <p className="text-gray-400 text-sm">
                La plateforme de référence pour trouver les meilleurs
                professionnels à {displayName}.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Navigation</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link
                    href="/annuaire"
                    className="hover:text-white transition-colors"
                  >
                    Annuaire
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="hover:text-white transition-colors"
                  >
                    Catégories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Professionnels</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    href="/admin/login"
                    className="hover:text-white transition-colors"
                  >
                    Espace Pro
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tarifs"
                    className="hover:text-white transition-colors"
                  >
                    Tarifs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>03 67 31 07 70</li>
                <li>contact@{displayName.toLowerCase()}.pro</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 {displayName}.PRO - Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}

