import { headers } from 'next/headers';
import Link from 'next/link';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ContactForm from '@/components/ContactForm';

// Force dynamic rendering because this page uses headers() for domain detection
export const dynamic = 'force-dynamic';

async function getDomainInfo() {
  const headersList = await headers();
  let domain = headersList.get('x-tenant-domain') || 'bas-rhin.pro';
  
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
    title: `Contactez-nous - ${displayName}.PRO`,
    description: `Contactez l'équipe de ${displayName}.PRO pour toute question ou suggestion.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ContactPage() {
  const { displayName, domainData } = await getDomainInfo();

  if (!domainData) {
    return <div>Domain not found</div>;
  }

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
                className="text-blue-600 font-semibold"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Contactez-nous
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une question ? Une suggestion ? N'hésitez pas à nous contacter.
            Nous vous répondrons dans les plus brefs délais.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Envoyez-nous un message
            </h3>
            <ContactForm domainColor={domainData.primaryColor || '#2563EB'} />
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Coordonnées */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Nos Coordonnées
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0"
                    style={{ background: domainData.primaryColor || '#2563EB' }}
                  >
                    📍
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Adresse</h4>
                    <p className="text-gray-600">
                      {displayName}, Alsace<br />
                      France
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0"
                    style={{ background: domainData.primaryColor || '#2563EB' }}
                  >
                    📞
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Téléphone</h4>
                    <p className="text-gray-600">
                      <a href="tel:0367310770" className="hover:underline">
                        03 67 31 07 70
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0"
                    style={{ background: domainData.primaryColor || '#2563EB' }}
                  >
                    ✉️
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">
                      <a 
                        href={`mailto:contact@${displayName.toLowerCase()}.pro`}
                        className="hover:underline"
                      >
                        contact@{displayName.toLowerCase()}.pro
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Horaires */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Horaires de Support
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lundi - Vendredi</span>
                  <span className="font-semibold text-gray-900">9h - 18h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Samedi</span>
                  <span className="font-semibold text-gray-900">9h - 12h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dimanche</span>
                  <span className="font-semibold text-gray-900">Fermé</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                * Nous répondons généralement sous 24h ouvrées
              </p>
            </div>

            {/* FAQ rapide */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Questions Fréquentes
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Comment ajouter mon entreprise ?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Créez un compte professionnel via l'
                    <Link href="/admin/login" className="text-blue-600 hover:underline">
                      espace pro
                    </Link>
                    .
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    C'est gratuit ?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Oui, l'inscription et le profil de base sont gratuits.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Comment modifier mes informations ?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Connectez-vous à votre espace pro pour gérer votre profil.
                  </p>
                </div>
              </div>
            </div>
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

