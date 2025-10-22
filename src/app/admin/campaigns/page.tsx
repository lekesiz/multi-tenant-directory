'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all');

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/admin/campaigns'
        : `/api/admin/campaigns?status=${filter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    const labels = {
      draft: 'Brouillon',
      scheduled: 'Programmé',
      sending: 'Envoi en cours',
      sent: 'Envoyé',
      failed: 'Échoué',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const calculateOpenRate = (campaign: Campaign) => {
    if (campaign.recipientCount === 0) return 0;
    return ((campaign.openCount / campaign.recipientCount) * 100).toFixed(1);
  };

  const calculateClickRate = (campaign: Campaign) => {
    if (campaign.recipientCount === 0) return 0;
    return ((campaign.clickCount / campaign.recipientCount) * 100).toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campagnes Email</h1>
            <p className="mt-2 text-sm text-gray-600">
              Créez et gérez vos campagnes d'email marketing
            </p>
          </div>
          <Link
            href="/admin/campaigns/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle Campagne
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['all', 'draft', 'scheduled', 'sent'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === status
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              {status === 'all' && 'Toutes'}
              {status === 'draft' && 'Brouillons'}
              {status === 'scheduled' && 'Programmées'}
              {status === 'sent' && 'Envoyées'}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Chargement...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune campagne</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer votre première campagne email.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/campaigns/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer une campagne
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {campaign.name}
                        </h3>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {campaign.subject}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>
                          👥 {campaign.recipientCount} destinataires
                        </span>
                        {campaign.status === 'sent' && (
                          <>
                            <span>
                              📧 {calculateOpenRate(campaign)}% ouverture
                            </span>
                            <span>
                              🖱️ {calculateClickRate(campaign)}% clics
                            </span>
                          </>
                        )}
                        {campaign.scheduledAt && (
                          <span>
                            📅 {new Date(campaign.scheduledAt).toLocaleString('fr-FR')}
                          </span>
                        )}
                        {campaign.sentAt && (
                          <span>
                            ✅ Envoyé le {new Date(campaign.sentAt).toLocaleString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {campaign.status === 'draft' && (
                        <Link
                          href={`/admin/campaigns/${campaign.id}/edit`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Modifier
                        </Link>
                      )}
                      <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Voir
                      </Link>
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => deleteCampaign(campaign.id)}
                          className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

