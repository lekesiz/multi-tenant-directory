'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Clock, DollarSign, Users } from 'lucide-react';

interface Subscription {
  id: number;
  name: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  cancelAtPeriodEnd: boolean;
  isFeatured: boolean;
  featuredTier: string | null;
  featuredUntil: string | null;
}

export default function AdminSubscriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'past_due'>('all');

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        let url = '/api/admin/subscriptions';
        if (filter === 'expiring') {
          url += '?expiring_soon=true';
        } else if (filter !== 'all') {
          url += `?status=${filter}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setSubscriptions(data.subscriptions);
        } else {
          setError('Failed to load subscriptions');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [filter]);

  const activeCount = subscriptions.filter(s => s.subscriptionStatus === 'active').length;
  const pastDueCount = subscriptions.filter(s => s.subscriptionStatus === 'past_due').length;
  const expiringCount = subscriptions.filter(s => {
    if (!s.subscriptionEnd) return false;
    const daysUntil = Math.ceil(
      (new Date(s.subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 7 && daysUntil > 0;
  }).length;

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Gestion des Abonnements</h1>
          <p className="mt-2 text-gray-600">
            Visualisez et gérez tous les abonnements des entreprises
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-lg bg-white p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total des Abonnements</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {subscriptions.length}
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-100" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {activeCount}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-100" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expirant Bientôt</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {expiringCount}
                </p>
              </div>
              <Clock className="h-12 w-12 text-yellow-100" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Attente de Paiement</p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {pastDueCount}
                </p>
              </div>
              <AlertCircle className="h-12 w-12 text-red-100" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(['all', 'active', 'expiring', 'past_due'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f === 'all' && 'Tous'}
              {f === 'active' && 'Actifs'}
              {f === 'expiring' && 'Expirant Bientôt'}
              {f === 'past_due' && 'En Attente'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Aucun abonnement trouvé</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Renouvellement
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Mis en Avant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{sub.name}</p>
                        <p className="text-sm text-gray-600">{sub.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block capitalize text-gray-900">
                        {sub.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sub.subscriptionStatus)}`}>
                        {sub.subscriptionStatus === 'active' && 'Actif'}
                        {sub.subscriptionStatus === 'past_due' && 'En Attente'}
                        {sub.subscriptionStatus === 'canceled' && 'Annulé'}
                        {sub.subscriptionStatus === 'trialing' && 'Essai'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {sub.subscriptionEnd ? (
                        <div>
                          <p className="text-sm text-gray-900">
                            {new Date(sub.subscriptionEnd).toLocaleDateString('fr-FR')}
                          </p>
                          {sub.cancelAtPeriodEnd && (
                            <p className="text-xs text-red-600">Annulation programmée</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub.isFeatured ? (
                        <div>
                          <span className="inline-block capitalize text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            {sub.featuredTier}
                          </span>
                          {sub.featuredUntil && (
                            <p className="text-xs text-gray-600 mt-1">
                              Jusqu'au {new Date(sub.featuredUntil).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
