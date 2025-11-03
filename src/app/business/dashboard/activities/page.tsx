'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Activity } from '@/types/activity';

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'published' | 'archived'>('all');

  useEffect(() => {
    loadActivities();
  }, [filter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const res = await fetch(`/api/business/activities?${params.toString()}`);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette activité?')) return;

    try {
      const res = await fetch(`/api/business/activities/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadActivities();
      }
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Activités</h1>
            <p className="text-gray-600 mt-2">Gérez vos publications, actualités et événements</p>
          </div>
          <Link
            href="/business/dashboard/activities/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + Nouvelle Activité
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'draft', 'scheduled', 'published', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Tous' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">Aucune activité trouvée</p>
          <Link
            href="/business/dashboard/activities/new"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Créer votre première activité →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {activity.featuredImage && (
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={activity.featuredImage}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                  />
                  {activity.isAiGenerated && (
                    <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      AI
                    </span>
                  )}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{getTypeIcon(activity.type)}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>

                {activity.excerpt && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.excerpt}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>👁 {activity.viewCount}</span>
                  <span>❤️ {activity.likeCount}</span>
                  <span>💬 {activity.commentCount}</span>
                  <span>📤 {activity.shareCount}</span>
                </div>

                {activity.publishedAt && (
                  <p className="text-xs text-gray-500 mb-4">
                    Publié le {new Date(activity.publishedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}

                {activity.scheduledFor && activity.status === 'scheduled' && (
                  <p className="text-xs text-blue-600 mb-4">
                    Programmé pour le {new Date(activity.scheduledFor).toLocaleDateString('fr-FR')}
                  </p>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/business/dashboard/activities/${activity.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-12 grid gap-6 md:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-blue-600">
            {activities.filter(a => a.status === 'published').length}
          </div>
          <div className="text-gray-600 mt-2">Publiées</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-gray-600">
            {activities.filter(a => a.status === 'draft').length}
          </div>
          <div className="text-gray-600 mt-2">Brouillons</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-purple-600">
            {activities.reduce((sum, a) => sum + a.viewCount, 0)}
          </div>
          <div className="text-gray-600 mt-2">Vues Totales</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-green-600">
            {activities.reduce((sum, a) => sum + a.shareCount, 0)}
          </div>
          <div className="text-gray-600 mt-2">Partages</div>
        </div>
      </div>
    </div>
  );
}
