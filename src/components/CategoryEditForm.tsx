'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BusinessCategory } from '@prisma/client';

type CategoryEditFormProps = {
  category?: BusinessCategory;
};

export default function CategoryEditForm({ category }: CategoryEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    googleCategory: category?.googleCategory || '',
    frenchName: category?.frenchName || '',
    icon: category?.icon || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = category
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories';
      
      const method = category ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      router.push('/admin/categories');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      router.push('/admin/categories');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="googleCategory" className="block text-sm font-medium text-gray-700 mb-2">
          Google Category (identifiant unique)
        </label>
        <input
          type="text"
          id="googleCategory"
          value={formData.googleCategory}
          onChange={(e) => setFormData({ ...formData, googleCategory: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          required
          disabled={!!category} // Google category cannot be changed after creation
        />
        {category && (
          <p className="mt-1 text-sm text-gray-500">
            La catégorie Google ne peut pas être modifiée après la création
          </p>
        )}
      </div>

      <div>
        <label htmlFor="frenchName" className="block text-sm font-medium text-gray-700 mb-2">
          Nom en Français
        </label>
        <input
          type="text"
          id="frenchName"
          value={formData.frenchName}
          onChange={(e) => setFormData({ ...formData, frenchName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
          Icône (emoji)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="text"
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
            maxLength={2}
          />
          <div className="text-4xl">{formData.icon}</div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Utilisez un emoji pour représenter la catégorie
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : category ? 'Mettre à jour' : 'Créer'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
        >
          Annuler
        </button>

        {category && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="ml-auto bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}

