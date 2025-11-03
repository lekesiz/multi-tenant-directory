'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ActivityType } from '@/types/activity';

export default function NewActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    type: 'announcement' as ActivityType,
    tags: [] as string[],
    featuredImage: '',
    status: 'draft',
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/business/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/business/dashboard/activities/${data.activity.id}`);
      } else {
        alert('Erreur lors de la création de l\'activité');
      }
    } catch (error) {
      console.error('Failed to create activity:', error);
      alert('Erreur lors de la création de l\'activité');
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.title) {
      alert('Veuillez entrer un titre avant de générer du contenu');
      return;
    }

    setAiGenerating(true);

    try {
      const res = await fetch('/api/business/activities/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          tone: 'professional',
          length: 'medium',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          content: data.content || '',
          excerpt: data.excerpt || '',
          tags: data.tags || [],
        }));
      } else {
        alert('Erreur lors de la génération du contenu');
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
      alert('Erreur lors de la génération du contenu');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/business/dashboard/activities"
          className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
        >
          ← Retour aux activités
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle Activité</h1>
        <p className="text-gray-600 mt-2">Créez une nouvelle publication pour votre entreprise</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type d'activité
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: 'announcement', label: 'Annonce', icon: '📢' },
              { value: 'event', label: 'Événement', icon: '📅' },
              { value: 'offer', label: 'Offre', icon: '🎁' },
              { value: 'update', label: 'Mise à jour', icon: '🔄' },
              { value: 'story', label: 'Histoire', icon: '📖' },
              { value: 'news', label: 'Actualité', icon: '📰' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: type.value as ActivityType }))}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.type === type.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-medium text-sm">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre *
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Nouvelle offre de printemps"
          />
        </div>

        {/* AI Content Generation */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>✨</span> Génération AI de contenu
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Laissez l'IA créer du contenu professionnel pour vous
              </p>
            </div>
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={aiGenerating || !formData.title}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {aiGenerating ? 'Génération...' : 'Générer avec AI'}
            </button>
          </div>
          {aiGenerating && (
            <div className="flex items-center gap-3 text-purple-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="text-sm">L'IA rédige votre contenu...</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Contenu *
          </label>
          <textarea
            id="content"
            required
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Décrivez votre activité en détail..."
          />
        </div>

        {/* Excerpt */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
            Extrait (résumé court)
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Un court résumé de votre activité..."
          />
        </div>

        {/* Tags */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ajouter un tag..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Ajouter
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Featured Image URL */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-2">
            Image principale (URL)
          </label>
          <input
            id="featuredImage"
            type="url"
            value={formData.featuredImage}
            onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
          {formData.featuredImage && (
            <div className="mt-4">
              <img
                src={formData.featuredImage}
                alt="Preview"
                className="max-w-md rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Création...' : 'Créer en brouillon'}
          </button>
          <Link
            href="/business/dashboard/activities"
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
