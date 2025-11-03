'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@prisma/client';
import { slugify } from '@/lib/utils';

type CategoryWithParent = Category & {
  parent?: Category | null;
};

type CategoryEditFormProps = {
  category?: CategoryWithParent;
  categories?: Category[]; // For parent selection
};

export default function CategoryEditForm({ category, categories = [] }: CategoryEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Category[]>(categories);

  const [formData, setFormData] = useState({
    slug: category?.slug || '',
    name: category?.name || '',
    nameFr: category?.nameFr || '',
    nameEn: category?.nameEn || '',
    nameDe: category?.nameDe || '',
    description: category?.description || '',
    icon: category?.icon || '',
    color: category?.color || '#3B82F6',
    parentId: category?.parentId?.toString() || '',
    googleTypes: category?.googleTypes?.join(', ') || '',
    order: category?.order?.toString() || '0',
  });

  // Fetch available categories for parent selection
  useEffect(() => {
    if (categories.length === 0) {
      fetch('/api/admin/categories/list')
        .then(res => res.json())
        .then(data => setAvailableCategories(data))
        .catch(err => console.error('Error fetching categories:', err));
    }
  }, [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = category
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories/create';

      const method = category ? 'PUT' : 'POST';

      // Process form data
      const processedData = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        googleTypes: formData.googleTypes
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0),
        order: parseInt(formData.order) || 0,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
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

  // Filter categories to exclude current category and its children (prevent circular references)
  const selectableCategories = availableCategories.filter(
    cat => !category || (cat.id !== category.id && cat.parentId !== category.id)
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL) *
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            URL: /categories/{formData.slug || 'votre-slug'}
          </p>
        </div>

        {/* Name (default) */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nom (défaut) *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => {
              const newName = e.target.value;
              setFormData({
                ...formData,
                name: newName,
                slug: category ? formData.slug : slugify(newName)
              });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* French Name */}
        <div>
          <label htmlFor="nameFr" className="block text-sm font-medium text-gray-700 mb-2">
            Nom en Français
          </label>
          <input
            type="text"
            id="nameFr"
            value={formData.nameFr}
            onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* English Name */}
        <div>
          <label htmlFor="nameEn" className="block text-sm font-medium text-gray-700 mb-2">
            Nom en Anglais
          </label>
          <input
            type="text"
            id="nameEn"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* German Name */}
        <div>
          <label htmlFor="nameDe" className="block text-sm font-medium text-gray-700 mb-2">
            Nom en Allemand
          </label>
          <input
            type="text"
            id="nameDe"
            value={formData.nameDe}
            onChange={(e) => setFormData({ ...formData, nameDe: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Icon */}
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              maxLength={4}
            />
            <div className="text-3xl">{formData.icon || '📁'}</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Parent Category */}
        <div>
          <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie Parente
          </label>
          <select
            id="parentId"
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Aucune (catégorie principale)</option>
            {selectableCategories
              .filter(cat => !cat.parentId) // Only show top-level categories as parent options
              .map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
            Couleur
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="#3B82F6"
            />
          </div>
        </div>

        {/* Order */}
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
            Ordre d'affichage
          </label>
          <input
            type="number"
            id="order"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>
      </div>

      {/* Google Types */}
      <div>
        <label htmlFor="googleTypes" className="block text-sm font-medium text-gray-700 mb-2">
          Types Google Places (séparés par des virgules)
        </label>
        <input
          type="text"
          id="googleTypes"
          value={formData.googleTypes}
          onChange={(e) => setFormData({ ...formData, googleTypes: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="restaurant, food, establishment"
        />
        <p className="mt-1 text-xs text-gray-500">
          Voir: https://developers.google.com/maps/documentation/places/web-service/supported_types
        </p>
      </div>

      <div className="flex gap-4 pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="ml-auto bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}

