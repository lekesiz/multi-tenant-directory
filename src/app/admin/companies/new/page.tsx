'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface GooglePlace {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
}

export default function NewCompanyPage() {
  const router = useRouter();
  const [step, setStep] = useState<'search' | 'manual' | 'details'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GooglePlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    categories: [] as string[],
  });

  const handleGoogleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/google-maps/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.results) {
        setSearchResults(data.results);
      } else {
        setError('Aucun résultat trouvé');
      }
    } catch (err) {
      setError('Une erreur s\'est produite lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = async (place: GooglePlace) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/google-maps/place/${place.placeId}`);
      const data = await response.json();

      setSelectedPlace(data);
      setFormData({
        name: data.name || '',
        slug: data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '',
        address: data.address || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        phone: data.phone || '',
        email: '',
        website: data.website || '',
        categories: data.categories?.slice(0, 3) || [],
      });
      setStep('details');
    } catch (err) {
      setError('Impossible de récupérer les informations de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          googlePlaceId: selectedPlace?.placeId || null,
          latitude: selectedPlace?.latitude || null,
          longitude: selectedPlace?.longitude || null,
        }),
      });

      if (response.ok) {
        router.push('/admin/companies');
      } else {
        setError('Une erreur s\'est produite lors de l\'ajout de l\'entreprise');
      }
    } catch (err) {
      setError('Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Ajouter une Entreprise
            </h1>
            <p className="text-gray-600 mt-2">
              Recherchez via Google Maps ou ajoutez manuellement
            </p>
          </div>
          <Link
            href="/admin/companies"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Retour
          </Link>
        </div>
      </div>

      {step === 'search' && (
        <div className="max-w-3xl">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Comment souhaitez-vous ajouter?
            </h2>

            <div className="space-y-4">
              {/* Google Maps Search */}
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <svg
                      className="w-6 h-6 text-blue-600"
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
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Rechercher sur Google Maps (Recommandé)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Récupérer automatiquement les informations
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === 'Enter' && handleGoogleSearch()
                        }
                        placeholder="Nom de l'entreprise ou adresse..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <button
                        onClick={handleGoogleSearch}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Recherche...' : 'Rechercher'}
                      </button>
                    </div>

                    {error && (
                      <p className="text-red-600 text-sm mt-2">{error}</p>
                    )}

                    {searchResults.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {searchResults.map((place) => (
                          <button
                            key={place.placeId}
                            onClick={() => handleSelectPlace(place)}
                            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                          >
                            <div className="font-semibold text-gray-900">
                              {place.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {place.address}
                            </div>
                            {place.rating && (
                              <div className="text-sm text-yellow-600 mt-1">
                                ⭐ {place.rating} ({place.userRatingsTotal}{' '}
                                avis)
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Manual Entry */}
              <button
                onClick={handleManualEntry}
                className="w-full border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors text-left"
              >
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Saisie Manuelle
                    </h3>
                    <p className="text-sm text-gray-600">
                      Entrez toutes les informations vous-même
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'details' && (
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Informations de l'Entreprise
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'Entreprise *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code Postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('search')}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer l\'Entreprise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

