'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface FilterBarProps {
  categories: string[];
  cities: string[];
  totalResults: number;
}

export default function FilterBar({ categories, cities, totalResults }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name-asc');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/annuaire?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateFilters({ category, city: selectedCity, sort: sortBy, q: searchQuery });
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    updateFilters({ category: selectedCategory, city, sort: sortBy, q: searchQuery });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateFilters({ category: selectedCategory, city: selectedCity, sort, q: searchQuery });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ category: selectedCategory, city: selectedCity, sort: sortBy, q: searchQuery });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setSortBy('name-asc');
    setSearchQuery('');
    router.push('/annuaire');
  };

  const hasActiveFilters = selectedCategory || selectedCity || searchQuery;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, adresse ou catégorie..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Rechercher
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ville
          </label>
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les villes</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trier par
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name-asc">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
            <option value="newest">Plus récent</option>
            <option value="oldest">Plus ancien</option>
          </select>
        </div>
      </div>

      {/* Results Summary and Clear Filters */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{totalResults}</span> résultat{totalResults !== 1 ? 's' : ''} trouvé{totalResults !== 1 ? 's' : ''}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Effacer les filtres
          </button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Recherche: "{searchQuery}"
              <button
                onClick={() => {
                  setSearchQuery('');
                  updateFilters({ category: selectedCategory, city: selectedCity, sort: sortBy, q: '' });
                }}
                className="ml-2 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Catégorie: {selectedCategory}
              <button
                onClick={() => handleCategoryChange('')}
                className="ml-2 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedCity && (
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Ville: {selectedCity}
              <button
                onClick={() => handleCityChange('')}
                className="ml-2 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

