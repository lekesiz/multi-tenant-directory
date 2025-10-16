'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface SyncStatus {
  apiKeyConfigured: boolean;
  cronEnabled: boolean;
  lastSyncTime: string | null;
}

interface Company {
  id: number;
  name: string;
  googlePlaceId: string | null;
  reviewCount: number;
}

export default function GoogleReviewsSyncPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user?.role !== 'admin')) {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, session, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch sync status
      const statusResponse = await fetch('/api/admin/sync-all-reviews');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSyncStatus(statusData);
      }

      // Fetch companies
      const companiesResponse = await fetch('/api/admin/companies');
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData.companies || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const syncCompanyReviews = async (companyId: number) => {
    setIsSyncing(true);
    setSelectedCompany(companyId);
    
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/sync-reviews`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${data.reviewsAdded} nouveaux avis synchronisés`);
        fetchData(); // Refresh data
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
      const response = await fetch('/api/admin/sync-all-reviews', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Synchronisation terminée: ${data.totalReviewsAdded} nouveaux avis pour ${data.companiesProcessed} entreprises`
        );
        fetchData(); // Refresh data
      } else {
        toast.error(data.error || 'Erreur lors de la synchronisation');
      }
    } catch (error) {
      console.error('Error syncing all reviews:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setIsSyncingAll(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
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
                syncStatus?.apiKeyConfigured ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {syncStatus?.apiKeyConfigured ? (
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
                    {syncStatus?.apiKeyConfigured ? 'Configurée' : 'Non configurée'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${
                syncStatus?.cronEnabled ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <ClockIcon className={`h-6 w-6 ${
                  syncStatus?.cronEnabled ? 'text-green-400' : 'text-yellow-400'
                }`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Synchronisation automatique
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {syncStatus?.cronEnabled ? 'Activée (2h00 UTC)' : 'Désactivée'}
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
                    Dernière synchronisation
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {syncStatus?.lastSyncTime 
                      ? new Date(syncStatus.lastSyncTime).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
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
          disabled={isSyncingAll || !syncStatus?.apiKeyConfigured}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            isSyncingAll || !syncStatus?.apiKeyConfigured
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
          {companies.map((company) => (
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
                          Google Place ID: {company.googlePlaceId}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          Pas de Google Place ID
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
                        isSyncing || 
                        isSyncingAll || 
                        !syncStatus?.apiKeyConfigured
                      }
                      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                        isSyncing && selectedCompany === company.id
                          ? 'bg-gray-100 text-gray-400'
                          : isSyncing || isSyncingAll || !syncStatus?.apiKeyConfigured
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
                        ? 'Synchronisation...'
                        : 'Synchroniser'
                      }
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Configuration requise
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Ajoutez GOOGLE_MAPS_API_KEY dans les variables d'environnement Vercel
                </li>
                <li>
                  Ajoutez CRON_SECRET pour sécuriser le endpoint cron
                </li>
                <li>
                  Ajoutez GOOGLE_SYNC_CRON_ENABLED=true pour activer la synchronisation automatique
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}