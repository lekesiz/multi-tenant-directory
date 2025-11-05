'use client';

import Link from 'next/link';

interface FooterProps {
  domainName: string;
  primaryColor?: string;
}

// Liste de tous les domaines du réseau *.PRO
const NETWORK_DOMAINS = [
  { name: 'Bas-Rhin', url: 'https://bas-rhin.pro', featured: true },
  { name: 'Bischwiller', url: 'https://bischwiller.pro' },
  { name: 'Bouxwiller', url: 'https://bouxwiller.pro' },
  { name: 'Brumath', url: 'https://brumath.pro' },
  { name: 'Erstein', url: 'https://erstein.pro' },
  { name: 'Geispolsheim', url: 'https://geispolsheim.pro' },
  { name: 'Gries', url: 'https://gries.pro' },
  { name: 'Haguenau', url: 'https://haguenau.pro' },
  { name: 'Hoerdt', url: 'https://hoerdt.pro' },
  { name: 'Illkirch', url: 'https://illkirch.pro' },
  { name: 'Ingwiller', url: 'https://ingwiller.pro' },
  { name: 'Ittenheim', url: 'https://ittenheim.pro' },
  { name: 'Mutzig', url: 'https://mutzig.pro' },
  { name: 'Ostwald', url: 'https://ostwald.pro' },
  { name: 'Saverne', url: 'https://saverne.pro' },
  { name: 'Schiltigheim', url: 'https://schiltigheim.pro' },
  { name: 'Schweighouse', url: 'https://schweighouse.pro' },
  { name: 'Souffelweyersheim', url: 'https://souffelweyersheim.pro' },
  { name: 'Soufflenheim', url: 'https://soufflenheim.pro' },
  { name: 'Vendenheim', url: 'https://vendenheim.pro' },
  { name: 'Wissembourg', url: 'https://wissembourg.pro' },
];

export default function Footer({ domainName, primaryColor = '#2563EB' }: FooterProps) {
  const displayName = domainName.split('.')[0].charAt(0).toUpperCase() + domainName.split('.')[0].slice(1);

  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h4 className="text-lg font-bold mb-4">{displayName}.PRO</h4>
            <p className="text-gray-400 text-sm">
              La plateforme de référence pour trouver les meilleurs
              professionnels à {displayName}.
            </p>
          </div>

          {/* Navigation */}
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
                  Toutes les Catégories
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Nous contacter
                </Link>
              </li>
            </ul>
          </div>

          {/* Professionnels */}
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
                  href="/rejoindre"
                  className="hover:text-white transition-colors"
                >
                  Créer un profil
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
            
            <h5 className="font-semibold mb-4 mt-6">Légal</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link
                  href="/mentions-legales"
                  className="hover:text-white transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-de-confidentialite"
                  className="hover:text-white transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/cgu"
                  className="hover:text-white transition-colors"
                >
                  CGU
                </Link>
              </li>
            </ul>
          </div>

          {/* Réseau *.PRO */}
          <div>
            <h5 className="font-semibold mb-4">Réseau *.PRO</h5>
            <p className="text-gray-400 text-xs mb-3">
              Découvrez nos plateformes locales
            </p>
            <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              <ul className="space-y-2 text-gray-400 text-sm">
                {NETWORK_DOMAINS.map((domain) => (
                  <li key={domain.url}>
                    <a
                      href={domain.url}
                      className={`hover:text-white transition-colors ${
                        domain.featured ? 'font-bold text-yellow-400' : ''
                      }`}
                      rel="nofollow"
                      title={`Annuaire professionnel de ${domain.name}`}
                    >
                      {domain.featured && '⭐ '}
                      {domain.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              <p className="mb-1">📞 03 67 31 07 70</p>
              <p>✉️ contact@{domainName.toLowerCase()}</p>
            </div>
            <div className="text-center text-gray-400 text-sm">
              © {new Date().getFullYear()} {displayName}.PRO - Tous droits réservés
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </footer>
  );
}
