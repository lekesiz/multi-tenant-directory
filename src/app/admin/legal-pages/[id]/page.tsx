'use client';

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface LegalPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
  domainId: number | null;
}

export default function EditLegalPagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [page, setPage] = useState<LegalPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    isActive: true,
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchPage();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/admin/legal-pages/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPage(data);
        setFormData({
          slug: data.slug,
          title: data.title,
          content: data.content,
          isActive: data.isActive,
        });
      } else {
        setError('Page non trouvée');
      }
    } catch (error) {
      logger.error('Error fetching page:', error);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = id === 'new' 
        ? '/api/admin/legal-pages'
        : `/api/admin/legal-pages/${id}`;
      
      const method = id === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/legal-pages');
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      logger.error('Error saving page:', error);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/legal-pages/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/legal-pages');
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (error) {
      logger.error('Error deleting page:', error);
      setError('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/legal-pages"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Retour
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {id === 'new' ? 'Nouvelle Page Légale' : 'Modifier la Page'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Mentions Légales"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL)
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: mentions-legales"
          />
          <p className="text-sm text-gray-500 mt-1">
            URL: /{formData.slug || 'slug'}
          </p>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Contenu (HTML/Markdown supporté)
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows={20}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Entrez le contenu HTML ou Markdown..."
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Page active (visible publiquement)
          </label>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <div>
            {id !== 'new' && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/legal-pages"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>

      {id !== 'new' && formData.slug && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Prévisualiser:</strong>{' '}
            <Link
              href={`/${formData.slug}`}
              target="_blank"
              className="underline hover:text-blue-900"
            >
              /{formData.slug}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
