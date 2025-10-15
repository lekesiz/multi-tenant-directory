'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-2">
          Gérez les paramètres de votre plateforme multi-tenant
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Général
          </button>
          <button
            onClick={() => setActiveTab('domains')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'domains'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Domaines
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'seo'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            SEO
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'integrations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Intégrations
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeTab === 'general' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Paramètres Généraux
            </h2>

            <div className="space-y-6">
              {/* Site Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du site
                </label>
                <input
                  type="text"
                  defaultValue="Multi-Tenant Directory"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Admin Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email administrateur
                </label>
                <input
                  type="email"
                  defaultValue="admin@netzinformatique.fr"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Support Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email support
                </label>
                <input
                  type="email"
                  defaultValue="contact@netzinformatique.fr"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  defaultValue="03 67 31 07 70"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'domains' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Gestion des Domaines
              </h2>
              <Link
                href="/admin/domains"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Gérer les domaines
              </Link>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    20+ domaines configurés
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Tous vos domaines sont actifs et fonctionnels. Vous pouvez
                    gérer les paramètres spécifiques de chaque domaine via la
                    page de gestion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Paramètres SEO
              </h2>
              <Link
                href="/admin/seo-settings"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Gérer le SEO
              </Link>
            </div>

            <div className="space-y-4">
              {/* SEO Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Sitemap</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Sitemap XML dynamique pour tous les domaines
                  </p>
                  <Link
                    href="/admin/sitemap"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Voir le sitemap →
                  </Link>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Robots.txt
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Configuration automatique pour chaque domaine
                  </p>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Voir robots.txt →
                  </a>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Meta Tags
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Personnalisez les meta tags par domaine
                  </p>
                  <Link
                    href="/admin/seo-settings"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Configurer →
                  </Link>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Schema.org
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Structured data automatique (LocalBusiness, etc.)
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Activé
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Intégrations
            </h2>

            <div className="space-y-4">
              {/* Google Maps */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      🗺️
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Google Maps API
                      </h3>
                      <p className="text-sm text-gray-500">
                        Affichage des cartes sur les pages entreprises
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Configuration requise
                  </span>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    Voir le fichier{' '}
                    <code className="px-2 py-1 bg-gray-100 rounded">
                      GOOGLE_MAPS_SETUP.md
                    </code>{' '}
                    pour les instructions de configuration.
                  </p>
                </div>
              </div>

              {/* Cloudinary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      📷
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Cloudinary</h3>
                      <p className="text-sm text-gray-500">
                        Upload et gestion des images
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Actif
                  </span>
                </div>
              </div>

              {/* Google Analytics */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      📊
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Google Analytics 4
                      </h3>
                      <p className="text-sm text-gray-500">
                        Tracking ID: G-RXFKWB8YQJ
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    À intégrer
                  </span>
                </div>
              </div>

              {/* SendGrid */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      ✉️
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">SendGrid</h3>
                      <p className="text-sm text-gray-500">
                        Envoi d&apos;emails (contact form, notifications)
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    À intégrer
                  </span>
                </div>
              </div>

              {/* NextAuth */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      🔐
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">NextAuth.js</h3>
                      <p className="text-sm text-gray-500">
                        Authentication (Credentials + Google OAuth)
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Actif
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/legal-pages"
          className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <h3 className="font-medium text-gray-900 mb-2">Pages Légales</h3>
          <p className="text-sm text-gray-600">
            Gérez vos mentions légales, CGU et politique de confidentialité
          </p>
        </Link>

        <Link
          href="/admin/companies"
          className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <h3 className="font-medium text-gray-900 mb-2">Entreprises</h3>
          <p className="text-sm text-gray-600">
            Gérez les fiches entreprises et leur contenu
          </p>
        </Link>

        <Link
          href="/admin/dashboard"
          className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <h3 className="font-medium text-gray-900 mb-2">Tableau de bord</h3>
          <p className="text-sm text-gray-600">
            Vue d&apos;ensemble des statistiques et activités
          </p>
        </Link>
      </div>
    </div>
  );
}
