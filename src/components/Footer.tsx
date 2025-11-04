'use client';

import Link from 'next/link';

interface FooterProps {
  domainName: string;
  primaryColor?: string;
}

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
          </div>

          {/* Contact & Legal */}
          <div>
            <h5 className="font-semibold mb-4">Contact</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>03 67 31 07 70</li>
              <li>contact@{domainName.toLowerCase()}</li>
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
                  href="/conditions-generales"
                  className="hover:text-white transition-colors"
                >
                  CGU
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} {displayName}.PRO - Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
