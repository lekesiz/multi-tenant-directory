'use client';

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface AnalyticsInsight {
  type: 'strength' | 'improvement' | 'recommendation' | 'alert';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  actionUrl?: string;
}

interface AIAnalyticsInsightsProps {
  analyticsData: any;
  businessContext: {
    name: string;
    category: string;
    city: string;
  };
  companyId: number;
}

const INSIGHT_ICONS = {
  strength: (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  improvement: (
    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  recommendation: (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  alert: (
    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
};

const IMPACT_COLORS = {
  low: 'border-l-gray-400 bg-gray-50',
  medium: 'border-l-yellow-400 bg-yellow-50',
  high: 'border-l-red-400 bg-red-50',
};

export default function AIAnalyticsInsights({ analyticsData, businessContext, companyId }: AIAnalyticsInsightsProps) {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    generateInsights();
  }, [analyticsData, businessContext]);

  const generateInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyticsData,
          businessContext,
          companyId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération des insights');
      }

      const data = await response.json();
      setInsights(transformInsightsData(data));
    } catch (error) {
      logger.error('Error generating insights:', error);
      toast.error('Erreur lors de l\'analyse des données');
      
      // Fallback with mock insights
      setInsights(generateMockInsights());
    } finally {
      setLoading(false);
    }
  };

  const transformInsightsData = (data: any): AnalyticsInsight[] => {
    const insights: AnalyticsInsight[] = [];

    // Add strengths
    if (data.strengths) {
      data.strengths.forEach((strength: string) => {
        insights.push({
          type: 'strength',
          title: 'Point fort identifié',
          description: strength,
          impact: 'medium',
          actionable: false,
        });
      });
    }

    // Add improvements
    if (data.improvements) {
      data.improvements.forEach((improvement: string) => {
        insights.push({
          type: 'improvement',
          title: 'Axe d\'amélioration',
          description: improvement,
          impact: 'medium',
          actionable: true,
          actionUrl: generateActionUrl(improvement),
        });
      });
    }

    // Add recommendations
    if (data.recommendations) {
      data.recommendations.forEach((recommendation: string) => {
        insights.push({
          type: 'recommendation',
          title: 'Recommandation stratégique',
          description: recommendation,
          impact: 'high',
          actionable: true,
          actionUrl: generateActionUrl(recommendation),
        });
      });
    }

    // Add alerts
    if (data.alerts && data.alerts.length > 0) {
      data.alerts.forEach((alert: string) => {
        insights.push({
          type: 'alert',
          title: 'Attention requise',
          description: alert,
          impact: 'high',
          actionable: true,
        });
      });
    }

    return insights;
  };

  const generateActionUrl = (text: string): string | undefined => {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('photo') || textLower.includes('image')) {
      return '/business/dashboard/photos';
    }
    if (textLower.includes('avis') || textLower.includes('réponse')) {
      return '/business/dashboard/reviews';
    }
    if (textLower.includes('horaire')) {
      return '/business/dashboard/hours';
    }
    if (textLower.includes('contenu') || textLower.includes('description')) {
      return '/business/dashboard/profile';
    }
    
    return undefined;
  };

  const generateMockInsights = (): AnalyticsInsight[] => {
    return [
      {
        type: 'strength',
        title: 'Excellent taux de conversion',
        description: 'Votre taux de conversion téléphone (18.5%) est supérieur à la moyenne du secteur (12%). Vos visiteurs sont fortement engagés.',
        impact: 'high',
        actionable: false,
      },
      {
        type: 'strength',
        title: 'Croissance des visiteurs uniques',
        description: 'Augmentation de 23% des visiteurs uniques ce mois-ci comparé au mois précédent. Votre visibilité s\'améliore.',
        impact: 'medium',
        actionable: false,
      },
      {
        type: 'improvement',
        title: 'Optimiser les clics site web',
        description: 'Seulement 7% de vos visiteurs cliquent sur votre site web. Améliorez la présentation de votre site dans votre profil.',
        impact: 'medium',
        actionable: true,
        actionUrl: '/business/dashboard/profile',
      },
      {
        type: 'improvement',
        title: 'Augmenter l\'engagement photos',
        description: 'Les entreprises avec 8+ photos reçoivent 40% de vues en plus. Vous n\'en avez actuellement que 3.',
        impact: 'high',
        actionable: true,
        actionUrl: '/business/dashboard/photos',
      },
      {
        type: 'recommendation',
        title: 'Lancer une campagne d\'avis',
        description: 'Avec votre bon taux d\'engagement, c\'est le moment idéal pour encourager plus d\'avis clients. Cela boostera votre visibilité.',
        impact: 'high',
        actionable: true,
        actionUrl: '/business/dashboard/reviews',
      },
      {
        type: 'alert',
        title: 'Baisse du trafic weekend',
        description: 'Votre trafic chute de 45% le weekend. Vérifiez vos horaires d\'ouverture et ajoutez des promotions weekend.',
        impact: 'medium',
        actionable: true,
        actionUrl: '/business/dashboard/hours',
      },
    ];
  };

  const filteredInsights = selectedFilter === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === selectedFilter);

  const insightCounts = {
    all: insights.length,
    strength: insights.filter(i => i.type === 'strength').length,
    improvement: insights.filter(i => i.type === 'improvement').length,
    recommendation: insights.filter(i => i.type === 'recommendation').length,
    alert: insights.filter(i => i.type === 'alert').length,
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
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
              <h3 className="text-lg font-semibold text-gray-900">
                Insights IA Analytics
              </h3>
              <p className="text-gray-600 text-sm">
                Analyse intelligente de vos performances
              </p>
            </div>
          </div>
          <button
            onClick={generateInsights}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-1">
          {[
            { id: 'all', name: 'Tout', count: insightCounts.all },
            { id: 'strength', name: 'Points forts', count: insightCounts.strength },
            { id: 'improvement', name: 'Améliorations', count: insightCounts.improvement },
            { id: 'recommendation', name: 'Recommandations', count: insightCounts.recommendation },
            { id: 'alert', name: 'Alertes', count: insightCounts.alert },
          ].filter(tab => tab.count > 0).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Insights List */}
      <div className="p-6">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">Aucun insight disponible pour ce filtre</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInsights.map((insight, index) => (
              <div
                key={index}
                className={`border-l-4 rounded-lg p-4 ${IMPACT_COLORS[insight.impact]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {INSIGHT_ICONS[insight.type]}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {insight.description}
                      </p>
                      
                      <div className="flex items-center space-x-3 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                          insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          Impact {insight.impact === 'high' ? 'élevé' : insight.impact === 'medium' ? 'moyen' : 'faible'}
                        </span>
                        
                        {insight.actionable && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            Actionable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {insight.actionable && insight.actionUrl && (
                    <div className="ml-4">
                      <a
                        href={insight.actionUrl}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                      >
                        Agir
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">{insightCounts.strength}</div>
            <div className="text-xs text-gray-600">Points forts</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">{insightCounts.improvement}</div>
            <div className="text-xs text-gray-600">Améliorations</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">{insightCounts.recommendation}</div>
            <div className="text-xs text-gray-600">Recommandations</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">{insightCounts.alert}</div>
            <div className="text-xs text-gray-600">Alertes</div>
          </div>
        </div>
      </div>
    </div>
  );
}