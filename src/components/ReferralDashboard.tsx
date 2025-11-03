'use client';

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ReferralStats {
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  activeReferrals: number;
  completedReferrals: number;
  conversionRate: number;
  signupRate: number;
  referrals: Array<{
    id: string;
    code: string;
    clicks: number;
    signups: number;
    conversions: number;
    status: string;
    createdAt: Date;
    expiresAt?: Date;
    referred?: {
      firstName?: string;
      lastName?: string;
      email: string;
      subscriptionTier: string;
    };
    referrerReward: string;
    referredReward: string;
  }>;
}

interface ReferralDashboardProps {
  businessOwnerId: string;
  businessName: string;
  baseUrl?: string;
}

export default function ReferralDashboard({ businessOwnerId, businessName, baseUrl = 'https://haguenau.pro' }: ReferralDashboardProps) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchReferralStats();
  }, [businessOwnerId]);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/referrals/${businessOwnerId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      logger.error('Error fetching referral stats:', error);
      toast.error('Erreur lors du chargement des données de parrainage');
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    try {
      setCreating(true);
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessOwnerId,
          businessName,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du code');
      }

      const newReferral = await response.json();
      toast.success('Code de parrainage créé avec succès !');
      
      // Refresh stats
      await fetchReferralStats();
    } catch (error) {
      logger.error('Error creating referral code:', error);
      toast.error('Erreur lors de la création du code de parrainage');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copié dans le presse-papiers !');
    } catch (error) {
      logger.error('Error copying to clipboard:', error);
      toast.error('Erreur lors de la copie');
    }
  };

  const shareOnSocial = (platform: string, referralUrl: string) => {
    const message = `Découvrez cette plateforme professionnelle incroyable ! Inscrivez-vous avec mon lien de parrainage et obtenez des avantages exclusifs : ${referralUrl}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Programme de Parrainage</h3>
              <p className="text-gray-600 text-sm">Gagnez des récompenses en invitant d'autres professionnels</p>
            </div>
          </div>
          
          {(!stats?.referrals || stats.referrals.length === 0) && (
            <button
              onClick={createReferralCode}
              disabled={creating}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Création...' : 'Créer mon code'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', name: 'Vue d\'ensemble' },
            { id: 'codes', name: 'Mes codes' },
            { id: 'history', name: 'Historique' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600">Clics totaux</p>
                    <p className="text-2xl font-bold text-blue-900">{stats?.totalClicks || 0}</p>
                  </div>
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-600">Inscriptions</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats?.totalSignups || 0}</p>
                  </div>
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-600">Conversions</p>
                    <p className="text-2xl font-bold text-green-900">{stats?.totalConversions || 0}</p>
                  </div>
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-600">Taux conversion</p>
                    <p className="text-2xl font-bold text-purple-900">{stats?.conversionRate || 0}%</p>
                  </div>
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600">Codes actifs</p>
                    <p className="text-2xl font-bold text-indigo-900">{stats?.activeReferrals || 0}</p>
                  </div>
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Rewards Info */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">🎁 Récompenses de Parrainage</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-green-900 mb-2">Pour vous (Parrain)</h5>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      1 mois gratuit par conversion
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Réductions cumulatives
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Statut VIP après 5 conversions
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-900 mb-2">Pour vos filleuls</h5>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      50% de réduction premier mois
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Setup gratuit
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Support prioritaire
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'codes' && (
          <div className="space-y-4">
            {stats?.referrals && stats.referrals.length > 0 ? (
              stats.referrals.map((referral) => {
                const referralUrl = `${baseUrl}/register?ref=${referral.code}`;
                
                return (
                  <div key={referral.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{referral.code}</h4>
                        <p className="text-sm text-gray-600">
                          Créé le {new Date(referral.createdAt).toLocaleDateString('fr-FR')}
                          {referral.expiresAt && ` • Expire le ${new Date(referral.expiresAt).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'active' ? 'bg-green-100 text-green-800' :
                        referral.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {referral.status === 'active' ? 'Actif' :
                         referral.status === 'completed' ? 'Terminé' : 'Expiré'}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{referral.clicks}</div>
                        <div className="text-xs text-gray-600">Clics</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{referral.signups}</div>
                        <div className="text-xs text-gray-600">Inscriptions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{referral.conversions}</div>
                        <div className="text-xs text-gray-600">Conversions</div>
                      </div>
                    </div>

                    {/* URL and Share */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien de parrainage
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={referralUrl}
                          readOnly
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                        />
                        <button
                          onClick={() => copyToClipboard(referralUrl)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Copier
                        </button>
                      </div>
                      
                      {/* Social Share Buttons */}
                      <div className="flex items-center space-x-2 mt-3">
                        <span className="text-sm text-gray-600">Partager:</span>
                        {[
                          { platform: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
                          { platform: 'twitter', name: 'Twitter', color: 'bg-sky-500' },
                          { platform: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
                          { platform: 'whatsapp', name: 'WhatsApp', color: 'bg-green-600' },
                        ].map((social) => (
                          <button
                            key={social.platform}
                            onClick={() => shareOnSocial(social.platform, referralUrl)}
                            className={`${social.color} text-white px-3 py-1 rounded text-xs hover:opacity-80 transition-opacity`}
                          >
                            {social.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-gray-500 mb-4">Aucun code de parrainage créé</p>
                <button
                  onClick={createReferralCode}
                  disabled={creating}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Création...' : 'Créer mon premier code'}
                </button>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'history' && (
          <div className="space-y-4">
            {stats?.referrals && stats.referrals.some(r => r.referred) ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Filleul
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code utilisé
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Abonnement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.referrals
                      .filter(r => r.referred)
                      .map((referral) => (
                        <tr key={referral.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {referral.referred?.firstName} {referral.referred?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {referral.referred?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {referral.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              referral.referred?.subscriptionTier === 'premium' ? 'bg-blue-100 text-blue-800' :
                              referral.referred?.subscriptionTier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {referral.referred?.subscriptionTier}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              referral.conversions > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {referral.conversions > 0 ? 'Converti' : 'En attente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(referral.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="text-gray-500">Aucun parrainage réussi pour le moment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}