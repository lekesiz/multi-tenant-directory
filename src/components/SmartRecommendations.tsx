'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'Faible' | 'Moyen' | 'Élevé';
  difficulty: 'Facile' | 'Modéré' | 'Difficile';
  category: 'seo' | 'marketing' | 'customer_service' | 'analytics' | 'content';
  actionUrl?: string;
  completed?: boolean;
}

interface SmartRecommendationsProps {
  companyId: number;
  businessData: {
    name: string;
    category: string;
    city: string;
    currentFeatures: string[];
    analytics: any;
  };
}

const CATEGORY_ICONS = {
  seo: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  marketing: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  customer_service: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  analytics: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  content: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
};

const IMPACT_COLORS = {
  'Faible': 'text-green-600 bg-green-100',
  'Moyen': 'text-yellow-600 bg-yellow-100',
  'Élevé': 'text-red-600 bg-red-100',
};

const DIFFICULTY_COLORS = {
  'Facile': 'text-green-600 bg-green-100',
  'Modéré': 'text-yellow-600 bg-yellow-100',
  'Difficile': 'text-red-600 bg-red-100',
};

export default function SmartRecommendations({ companyId, businessData }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecommendations();
  }, [companyId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          businessData,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des recommandations');
      }

      const data = await response.json();
      setRecommendations(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Erreur lors du chargement des recommandations');
      
      // Fallback with mock data
      setRecommendations(generateMockRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecommendations = (): Recommendation[] => {
    return [
      {
        id: '1',
        title: 'Ajouter des photos de qualité',
        description: 'Les entreprises avec 5+ photos reçoivent 42% de vues en plus. Ajoutez des photos de votre établissement, équipe et services.',
        impact: 'Élevé',
        difficulty: 'Facile',
        category: 'marketing',
        actionUrl: '/business/dashboard/photos',
      },
      {
        id: '2',
        title: 'Optimiser la description SEO',
        description: 'Votre description manque de mots-clés locaux. Une description optimisée peut augmenter votre visibilité de 25%.',
        impact: 'Élevé',
        difficulty: 'Modéré',
        category: 'seo',
        actionUrl: '/business/dashboard/profile',
      },
      {
        id: '3',
        title: 'Répondre aux avis clients',
        description: 'Vous avez 3 avis sans réponse. Répondre aux avis améliore votre image et encourage de nouveaux clients.',
        impact: 'Moyen',
        difficulty: 'Facile',
        category: 'customer_service',
        actionUrl: '/business/dashboard/reviews',
      },
      {
        id: '4',
        title: 'Mettre à jour les horaires',
        description: 'Vos horaires ne sont pas renseignés. Les clients cherchent cette information avant de se déplacer.',
        impact: 'Moyen',
        difficulty: 'Facile',
        category: 'content',
        actionUrl: '/business/dashboard/hours',
      },
      {
        id: '5',
        title: 'Créer du contenu promotionnel',
        description: 'Ajoutez des offres spéciales pour attirer plus de clients. Les entreprises avec promotions ont +18% de conversions.',
        impact: 'Élevé',
        difficulty: 'Modéré',
        category: 'marketing',
      },
    ];
  };

  const markAsCompleted = (id: string) => {
    setCompletedIds(prev => new Set([...prev, id]));
    toast.success('Recommandation marquée comme terminée !');
  };

  const categories = [
    { id: 'all', name: 'Toutes', count: recommendations.length },
    { id: 'seo', name: 'SEO', count: recommendations.filter(r => r.category === 'seo').length },
    { id: 'marketing', name: 'Marketing', count: recommendations.filter(r => r.category === 'marketing').length },
    { id: 'customer_service', name: 'Service Client', count: recommendations.filter(r => r.category === 'customer_service').length },
    { id: 'content', name: 'Contenu', count: recommendations.filter(r => r.category === 'content').length },
    { id: 'analytics', name: 'Analytics', count: recommendations.filter(r => r.category === 'analytics').length },
  ].filter(cat => cat.count > 0);

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === selectedCategory);

  const completedCount = recommendations.filter(r => completedIds.has(r.id)).length;
  const progressPercentage = recommendations.length > 0 ? (completedCount / recommendations.length) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              Recommandations IA
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Suggestions personnalisées pour améliorer votre visibilité
            </p>
          </div>
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
          >
            Actualiser
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progression</span>
            <span className="font-medium">{completedCount}/{recommendations.length} terminées</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="p-6">
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">Aucune recommandation dans cette catégorie</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((recommendation) => {
              const isCompleted = completedIds.has(recommendation.id);
              
              return (
                <div
                  key={recommendation.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200 opacity-75' 
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${
                        isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          CATEGORY_ICONS[recommendation.category]
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {recommendation.title}
                        </h4>
                        <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                          {recommendation.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${IMPACT_COLORS[recommendation.impact]}`}>
                            Impact {recommendation.impact}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[recommendation.difficulty]}`}>
                            {recommendation.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!isCompleted && recommendation.actionUrl && (
                        <a
                          href={recommendation.actionUrl}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Agir
                        </a>
                      )}
                      
                      <button
                        onClick={() => markAsCompleted(recommendation.id)}
                        disabled={isCompleted}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          isCompleted
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isCompleted ? '✓ Terminé' : 'Marquer fait'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}