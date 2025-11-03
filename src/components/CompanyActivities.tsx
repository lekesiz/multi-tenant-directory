'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Activity {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  type: string;
  featuredImage: string | null;
  isAiGenerated: boolean;
  publishedAt: Date | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  tags: string[];
}

interface CompanyActivitiesProps {
  companyId: number;
  companySlug: string;
}

export default function CompanyActivities({ companyId, companySlug }: CompanyActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadActivities();
  }, [companyId, filter]);

  const loadActivities = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('type', filter);
      }

      const res = await fetch(`/api/companies/${companyId}/activities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return '📢';
      case 'event': return '📅';
      case 'offer': return '🎁';
      case 'update': return '🔄';
      case 'story': return '📖';
      case 'news': return '📰';
      default: return '📝';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'announcement': return 'Annonce';
      case 'event': return 'Événement';
      case 'offer': return 'Offre';
      case 'update': return 'Mise à jour';
      case 'story': return 'Histoire';
      case 'news': return 'Actualité';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Chargement des activités...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Aucune activité publiée pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'announcement', 'event', 'offer', 'update', 'story', 'news'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? '🗂 Tous' : `${getTypeIcon(type)} ${getTypeLabel(type)}`}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <article
            key={activity.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            {activity.featuredImage && (
              <div className="relative h-48 bg-gray-200">
                <img
                  src={activity.featuredImage}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />
                {activity.isAiGenerated && (
                  <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    ✨ Généré par AI
                  </span>
                )}
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{getTypeIcon(activity.type)}</span>
                <span className="text-xs text-gray-500 font-medium">{getTypeLabel(activity.type)}</span>
                {activity.publishedAt && (
                  <span className="ml-auto text-xs text-gray-500">
                    {new Date(activity.publishedAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>

              {activity.excerpt && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{activity.excerpt}</p>
              )}

              {activity.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {activity.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {activity.tags.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{activity.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                <span title="Vues">👁 {activity.viewCount}</span>
                <span title="J'aime">❤️ {activity.likeCount}</span>
                <span title="Commentaires">💬 {activity.commentCount}</span>
                <span title="Partages">📤 {activity.shareCount}</span>
              </div>

              <button
                onClick={() => {
                  // Open modal or navigate to full activity page
                  const modal = document.getElementById(`activity-modal-${activity.id}`);
                  if (modal) {
                    modal.classList.remove('hidden');
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Lire la suite →
              </button>
            </div>

            {/* Activity Modal */}
            <div
              id={`activity-modal-${activity.id}`}
              className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  e.currentTarget.classList.add('hidden');
                }
              }}
            >
              <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {activity.featuredImage && (
                  <div className="relative h-64 bg-gray-200">
                    <img
                      src={activity.featuredImage}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl">{getTypeIcon(activity.type)}</span>
                    <div>
                      <span className="text-sm text-gray-500 font-medium">{getTypeLabel(activity.type)}</span>
                      {activity.publishedAt && (
                        <div className="text-xs text-gray-500">
                          {new Date(activity.publishedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const modal = document.getElementById(`activity-modal-${activity.id}`);
                        if (modal) modal.classList.add('hidden');
                      }}
                      className="ml-auto text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{activity.title}</h2>

                  <div className="prose max-w-none mb-6">
                    {activity.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {activity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {activity.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-gray-600 border-t pt-6">
                    <button className="flex items-center gap-2 hover:text-red-600 transition-colors">
                      <span>❤️</span>
                      <span>{activity.likeCount}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                      <span>💬</span>
                      <span>{activity.commentCount}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-600 transition-colors">
                      <span>📤</span>
                      <span>{activity.shareCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
