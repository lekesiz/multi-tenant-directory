'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  analytics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: Date;
}

interface Segment {
  id: string;
  name: string;
  memberCount: number;
  campaignCount: number;
  rules: any[];
}

interface LeadScore {
  id: string;
  userId: string;
  score: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  company: {
    name: string;
  };
}

interface MarketingDashboardProps {
  businessOwnerId: string;
}

export default function MarketingDashboard({ businessOwnerId }: MarketingDashboardProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [businessOwnerId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch campaigns, segments, and lead scores in parallel
      const [campaignsRes, segmentsRes, scoresRes] = await Promise.all([
        fetch('/api/marketing/campaigns'),
        fetch('/api/marketing/segments'),
        fetch('/api/marketing/lead-scores?limit=10'),
      ]);

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.campaigns || []);
      }

      if (segmentsRes.ok) {
        const segmentsData = await segmentsRes.json();
        setSegments(segmentsData.segments || []);
      }

      if (scoresRes.ok) {
        const scoresData = await scoresRes.json();
        setLeadScores(scoresData.leadScores || []);
      }
    } catch (error) {
      console.error('Error fetching marketing data:', error);
      toast.error('Erreur lors du chargement des données marketing');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalStats = () => {
    return campaigns.reduce(
      (totals, campaign) => ({
        sent: totals.sent + (campaign.analytics.sent || 0),
        opened: totals.opened + (campaign.analytics.opened || 0),
        clicked: totals.clicked + (campaign.analytics.clicked || 0),
        converted: totals.converted + (campaign.analytics.converted || 0),
      }),
      { sent: 0, opened: 0, clicked: 0, converted: 0 }
    );
  };

  const totalStats = calculateTotalStats();
  const openRate = totalStats.sent > 0 ? (totalStats.opened / totalStats.sent) * 100 : 0;
  const clickRate = totalStats.opened > 0 ? (totalStats.clicked / totalStats.opened) * 100 : 0;
  const conversionRate = totalStats.clicked > 0 ? (totalStats.converted / totalStats.clicked) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
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
            <div className="p-2 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Marketing Automation</h3>
              <p className="text-gray-600 text-sm">Campagnes, segments et scoring automatique</p>
            </div>
          </div>
          
          <button
            onClick={() => window.location.href = '/business/dashboard/marketing/campaigns/new'}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Nouvelle campagne
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-600">Emails envoyés</p>
                <p className="text-2xl font-bold text-blue-900">{totalStats.sent.toLocaleString()}</p>
              </div>
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-600">Taux d'ouverture</p>
                <p className="text-2xl font-bold text-green-900">{openRate.toFixed(1)}%</p>
              </div>
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-600">Taux de clic</p>
                <p className="text-2xl font-bold text-yellow-900">{clickRate.toFixed(1)}%</p>
              </div>
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-600">Conversions</p>
                <p className="text-2xl font-bold text-purple-900">{conversionRate.toFixed(1)}%</p>
              </div>
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', name: 'Vue d\'ensemble' },
            { id: 'campaigns', name: 'Campagnes' },
            { id: 'segments', name: 'Segments' },
            { id: 'scores', name: 'Lead Scoring' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-purple-500 text-purple-600'
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
            {/* Recent Campaigns */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Campagnes récentes</h4>
              <div className="space-y-3">
                {campaigns.slice(0, 3).map((campaign) => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{campaign.name}</h5>
                        <p className="text-sm text-gray-600">
                          {campaign.type} • {campaign.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {campaign.analytics.sent} envoyés
                        </p>
                        <p className="text-xs text-gray-600">
                          {campaign.analytics.opened} ouvertures
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Segments clients</h4>
                <div className="space-y-2">
                  {segments.slice(0, 3).map((segment) => (
                    <div key={segment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{segment.name}</span>
                      <span className="text-sm text-gray-600">{segment.memberCount} membres</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Lead Scores</h4>
                <div className="space-y-2">
                  {leadScores.slice(0, 3).map((score) => (
                    <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {score.user.firstName} {score.user.lastName}
                        </p>
                        <p className="text-xs text-gray-600">{score.user.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        score.score >= 80 ? 'bg-red-100 text-red-800' :
                        score.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {score.score} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'campaigns' && (
          <div className="space-y-4">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{campaign.name}</h4>
                      <p className="text-sm text-gray-600">
                        Type: {campaign.type} • Statut: {campaign.status}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{campaign.analytics.sent}</div>
                      <div className="text-xs text-gray-600">Envoyés</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{campaign.analytics.opened}</div>
                      <div className="text-xs text-gray-600">Ouverts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{campaign.analytics.clicked}</div>
                      <div className="text-xs text-gray-600">Clics</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{campaign.analytics.converted}</div>
                      <div className="text-xs text-gray-600">Conversions</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 mb-4">Aucune campagne créée</p>
                <button
                  onClick={() => window.location.href = '/business/dashboard/marketing/campaigns/new'}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Créer ma première campagne
                </button>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'segments' && (
          <div className="space-y-4">
            {segments.length > 0 ? (
              segments.map((segment) => (
                <div key={segment.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{segment.name}</h4>
                      <p className="text-sm text-gray-600">
                        {segment.memberCount} membres • {segment.campaignCount} campagnes
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Règles de segmentation:</p>
                    <div className="space-y-1">
                      {segment.rules.slice(0, 3).map((rule, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          {rule.field} {rule.operator} {rule.value}
                        </p>
                      ))}
                      {segment.rules.length > 3 && (
                        <p className="text-xs text-gray-500">+{segment.rules.length - 3} autres règles</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500">Aucun segment créé</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'scores' && (
          <div className="space-y-4">
            {leadScores.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entreprise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leadScores.map((score) => (
                      <tr key={score.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {score.user.firstName} {score.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{score.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {score.company.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{score.score}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            score.score >= 80 ? 'bg-red-100 text-red-800' :
                            score.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {score.score >= 80 ? 'Hot' : score.score >= 50 ? 'Warm' : 'Cold'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500">Aucun score de lead disponible</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}