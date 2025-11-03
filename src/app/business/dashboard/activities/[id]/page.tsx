'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { Activity, ActivityType } from '@/types/activity';

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [sharing, setSharing] = useState(false);

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  const loadActivity = async () => {
    try {
      const res = await fetch(`/api/business/activities/${activityId}`);
      if (res.ok) {
        const data = await res.json();
        setActivity(data.activity);
      } else {
        alert('Activité non trouvée');
        router.push('/business/dashboard/activities');
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activity) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/business/activities/${activityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
      });

      if (res.ok) {
        alert('Activité sauvegardée!');
        loadActivity();
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!activity) return;

    const publishDate = prompt('Date de publication (laissez vide pour publier maintenant, format: YYYY-MM-DD HH:MM)');

    try {
      const res = await fetch(`/api/business/activities/${activityId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledFor: publishDate || undefined,
        }),
      });

      if (res.ok) {
        alert(publishDate ? 'Activité programmée!' : 'Activité publiée!');
        loadActivity();
      } else {
        alert('Erreur lors de la publication');
      }
    } catch (error) {
      console.error('Failed to publish activity:', error);
      alert('Erreur lors de la publication');
    }
  };

  const handleGenerateImage = async () => {
    if (!activity) return;

    setImageGenerating(true);
    try {
      const res = await fetch(`/api/business/activities/${activityId}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activity.title + ' - ' + activity.excerpt,
          style: 'professional',
          aspectRatio: '16:9',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActivity(prev => prev ? { ...prev, aiGeneratedImageUrl: data.imageUrl } : null);
        alert('Image générée avec succès!');
      } else {
        alert('Erreur lors de la génération de l\'image');
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Erreur lors de la génération de l\'image');
    } finally {
      setImageGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!activity) return;

    setVideoGenerating(true);
    try {
      const res = await fetch(`/api/business/activities/${activityId}/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activity.title + ' - ' + activity.content.substring(0, 200),
          duration: 10,
          style: 'professional',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActivity(prev => prev ? { ...prev, aiGeneratedVideoUrl: data.videoUrl } : null);
        alert('Vidéo générée avec succès!');
      } else {
        alert('Erreur lors de la génération de la vidéo');
      }
    } catch (error) {
      console.error('Failed to generate video:', error);
      alert('Erreur lors de la génération de la vidéo');
    } finally {
      setVideoGenerating(false);
    }
  };

  const handleShare = async (platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram') => {
    if (!activity) return;

    setSharing(true);
    try {
      const res = await fetch(`/api/business/activities/${activityId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });

      if (res.ok) {
        alert(`Partagé sur ${platform}!`);
        loadActivity();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors du partage');
      }
    } catch (error) {
      console.error('Failed to share activity:', error);
      alert('Erreur lors du partage');
    } finally {
      setSharing(false);
    }
  };

  const handleAddTag = () => {
    if (!activity || !tagInput.trim()) return;
    if (activity.tags.includes(tagInput.trim())) return;

    setActivity(prev => prev ? {
      ...prev,
      tags: [...prev.tags, tagInput.trim()],
    } : null);
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!activity) return;
    setActivity(prev => prev ? {
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    } : null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link
          href="/business/dashboard/activities"
          className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
        >
          ← Retour aux activités
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier l'Activité</h1>
            <p className="text-gray-600 mt-2">ID: {activity.id}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
            </button>
            {activity.status === 'draft' && (
              <button
                onClick={handlePublish}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                📢 Publier
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Informations de base</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input
                  type="text"
                  value={activity.title}
                  onChange={(e) => setActivity({ ...activity, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={activity.type}
                  onChange={(e) => setActivity({ ...activity, type: e.target.value as ActivityType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="announcement">📢 Annonce</option>
                  <option value="event">📅 Événement</option>
                  <option value="offer">🎁 Offre</option>
                  <option value="update">🔄 Mise à jour</option>
                  <option value="story">📖 Histoire</option>
                  <option value="news">📰 Actualité</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenu *</label>
                <textarea
                  value={activity.content}
                  onChange={(e) => setActivity({ ...activity, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Extrait</label>
                <textarea
                  value={activity.excerpt || ''}
                  onChange={(e) => setActivity({ ...activity, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* AI Content Generation */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>✨</span> Génération de Médias AI
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGenerateImage}
                disabled={imageGenerating}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {imageGenerating ? '🎨 Génération...' : '🎨 Générer Image'}
              </button>

              <button
                onClick={handleGenerateVideo}
                disabled={videoGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {videoGenerating ? '🎬 Génération...' : '🎬 Générer Vidéo'}
              </button>
            </div>

            {activity.aiGeneratedImageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Image générée par AI:</p>
                <img src={activity.aiGeneratedImageUrl} alt="AI Generated" className="rounded-lg max-h-64" />
              </div>
            )}

            {activity.aiGeneratedVideoUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Vidéo générée par AI:</p>
                <video src={activity.aiGeneratedVideoUrl} controls className="rounded-lg max-h-64 w-full" />
              </div>
            )}
          </div>

          {/* Social Sharing */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Partager sur les réseaux sociaux</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleShare('facebook')}
                disabled={sharing || activity.sharedOnFacebook}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {activity.sharedOnFacebook ? '✓ Facebook' : 'Facebook'}
              </button>

              <button
                onClick={() => handleShare('twitter')}
                disabled={sharing || activity.sharedOnTwitter}
                className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {activity.sharedOnTwitter ? '✓ Twitter' : 'Twitter'}
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                disabled={sharing || activity.sharedOnLinkedIn}
                className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {activity.sharedOnLinkedIn ? '✓ LinkedIn' : 'LinkedIn'}
              </button>

              <button
                onClick={() => handleShare('instagram')}
                disabled={sharing || activity.sharedOnInstagram}
                className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {activity.sharedOnInstagram ? '✓ Instagram' : 'Instagram'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Statut</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Statut:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activity.status === 'published' ? 'bg-green-100 text-green-800' :
                  activity.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  activity.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {activity.status}
                </span>
              </div>

              {activity.publishedAt && (
                <div className="text-sm text-gray-600">
                  <span>Publié le:</span>
                  <div className="font-medium">{new Date(activity.publishedAt).toLocaleString('fr-FR')}</div>
                </div>
              )}

              {activity.scheduledFor && (
                <div className="text-sm text-gray-600">
                  <span>Programmé pour:</span>
                  <div className="font-medium text-blue-600">{new Date(activity.scheduledFor).toLocaleString('fr-FR')}</div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Statistiques</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">👁 Vues:</span>
                <span className="font-bold">{activity.viewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">❤️ J'aime:</span>
                <span className="font-bold">{activity.likeCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">💬 Commentaires:</span>
                <span className="font-bold">{activity.commentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">📤 Partages:</span>
                <span className="font-bold">{activity.shareCount}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Tags</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Nouveau tag..."
              />
              <button
                onClick={handleAddTag}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activity.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Image principale</h2>
            <input
              type="url"
              value={activity.featuredImage || ''}
              onChange={(e) => setActivity({ ...activity, featuredImage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
              placeholder="URL de l'image"
            />
            {activity.featuredImage && (
              <img src={activity.featuredImage} alt="Featured" className="rounded-lg" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
