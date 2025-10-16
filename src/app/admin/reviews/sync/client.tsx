'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Company {
  id: number;
  name: string;
  googlePlaceId: string | null;
  reviewCount: number;
}

interface Props {
  initialCompanies: Company[];
  apiKeyConfigured: boolean;
}

export default function GoogleReviewsSyncClient({ initialCompanies, apiKeyConfigured }: Props) {
  const router = useRouter();
  const [companies] = useState<Company[]>(initialCompanies);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);

  const syncCompanyReviews = async (companyId: number) => {
    setIsSyncing(true);
    setSelectedCompany(companyId);

    try {
      const response = await fetch(`/api/admin/companies/${companyId}/sync-reviews`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${data.reviewsAdded || 0} nouveaux avis synchronisés`);
        router.refresh(); // Refresh server component data
      } else {
        toast.error(data.error || 'Erreur lors de la synchronisation');
      }
    } catch (error) {
      console.error('Error syncing reviews:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setIsSyncing(false);
      setSelectedCompany(null);
    }
  };

  const syncAllReviews = async () => {
    if (!confirm('Voulez-vous vraiment synchroniser les avis de toutes les entreprises? Cela peut prendre plusieurs minutes.')) {
      return;
    }

    setIsSyncingAll(true);

    try {
      const response = await fetch('/api/admin/reviews/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syncAll: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Synchronisation terminée: ${data.totalReviewsAdded || 0} nouveaux avis pour ${data.companiesProcessed || 0} entreprises`
        );
        router.refresh(); // Refresh server component data
      } else {
        toast.error(data.message || 'Erreur lors de la synchronisation');
      }
    } catch (error) {
      console.error('Error syncing all reviews:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const companiesWithGooglePlaceId = companies.filter(c => c.googlePlaceId);

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Synchronisation Google Reviews
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Synchronisez les avis Google Maps avec votre base de données
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${
                  apiKeyConfigured ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {apiKeyConfigured ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  ) : (
                    <ExclamationCircleIcon className="h-6 w-6 text-red-400" />
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      API Google Maps
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {apiKeyConfigured ? 'Configurée' : 'Non configurée'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                  <ArrowPathIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Entreprises liées
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {companiesWithGooglePlaceId.length} / {companies.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-50 rounded-md p-3">
                  <ClockIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total avis
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {companies.reduce((sum, c) => sum + c.reviewCount, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sync All Button */}
        <div className="mb-6">
          <button
            onClick={syncAllReviews}
            disabled={isSyncingAll || !apiKeyConfigured}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isSyncingAll || !apiKeyConfigured
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            {isSyncingAll ? 'Synchronisation en cours...' : 'Synchroniser toutes les entreprises'}
          </button>
        </div>

        {/* Companies Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Entreprises ({companies.length})
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {companies.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">
                Aucune entreprise trouvée
              </li>
            ) : (
              companies.map((company) => (
                <li key={company.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {company.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {company.googlePlaceId ? (
                            <span className="text-green-600">
                              ✓ Google Place ID configuré
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              ✗ Pas de Google Place ID
                            </span>
                          )}
                          {' • '}
                          {company.reviewCount} avis
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          onClick={() => syncCompanyReviews(company.id)}
                          disabled={
                            !company.googlePlaceId ||
                            isSyncing ||
                            isSyncingAll ||
                            !apiKeyConfigured
                          }
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                            isSyncing && selectedCompany === company.id
                              ? 'bg-gray-100 text-gray-400'
                              : !company.googlePlaceId || isSyncing || isSyncingAll || !apiKeyConfigured
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          }`}
                        >
                          <ArrowPathIcon
                            className={`-ml-0.5 mr-2 h-4 w-4 ${
                              isSyncing && selectedCompany === company.id ? 'animate-spin' : ''
                            }`}
                          />
                          {isSyncing && selectedCompany === company.id
                            ? 'Sync...'
                            : 'Synchroniser'
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Instructions */}
        {!apiKeyConfigured && (
          <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Configuration requise
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    La clé API Google Maps n'est pas configurée.
                    Ajoutez <code className="bg-red-100 px-1 py-0.5 rounded">GOOGLE_MAPS_API_KEY</code> dans les variables d'environnement Vercel.
                  </p>
                  <p className="mt-2">
                    Consultez <a href="https://github.com/lekesiz/multi-tenant-directory/blob/main/docs/GOOGLE_MAPS_SETUP.md" className="underline font-medium" target="_blank" rel="noopener noreferrer">la documentation</a> pour plus d'informations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
