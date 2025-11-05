'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

interface GooglePlace {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
}

export default function NewCompanyPage() {
  const router = useRouter();
  const [step, setStep] = useState<'search' | 'manual' | 'siret' | 'details'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [siretInput, setSiretInput] = useState('');
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
    logoUrl: '',
    coverImageUrl: '',
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
        slug: slugify(data.name || ''),
        address: data.address || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        phone: data.phone || '',
        email: '',
        website: data.website || '',
        logoUrl: '',
        coverImageUrl: '',
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

  const handleSiretEntry = () => {
    setStep('siret');
  };

  const handleSiretSearch = async () => {
    if (!siretInput.trim() || siretInput.replace(/\s/g, '').length !== 14) {
      setError('Le SIRET doit contenir exactement 14 chiffres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/companies/from-siret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siret: siretInput.replace(/\s/g, ''),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Company created successfully
        router.push(`/admin/companies/${data.company.id}`);
      } else {
        setError(data.message || 'Une erreur s\'est produite');
      }
    } catch (err) {
      setError('Une erreur s\'est produite lors de la recherche');
    } finally {
      setLoading(false);
    }
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
              Recherchez via SIRET, Google Maps ou ajoutez manuellement
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

              {/* SIRET Entry - Optional method for adding companies */}
              <button
                onClick={handleSiretEntry}
                className="w-full border-2 border-gray-200 rounded-lg p-6 hover:border-purple-500 transition-colors text-left"
              >
                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Recherche par SIRET
                    </h3>
                    <p className="text-sm text-gray-600">
                      Données officielles + Google + IA (Recommandé)
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      ✓ Vérifié • ✓ Complet • ✓ Optimisé SEO
                    </p>
                  </div>
                </div>
              </button>

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

      {step === 'siret' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-lg shadow p-8">
            <button
              onClick={() => setStep('search')}
              className="text-gray-600 hover:text-gray-900 mb-6 flex items-center"
            >
              ← Retour aux options
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Recherche par SIRET
            </h2>
            <p className="text-gray-600 mb-6">
              Entrez le numéro SIRET à 14 chiffres. Nous récupérerons automatiquement les données officielles, les informations Google Maps et générerons une description professionnelle par IA.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro SIRET *
                </label>
                <input
                  type="text"
                  value={siretInput}
                  onChange={(e) => {
                    // Allow only numbers and spaces
                    const value = e.target.value.replace(/[^\d\s]/g, '');
                    setSiretInput(value);
                    setError('');
                  }}
                  placeholder="123 456 789 01234"
                  maxLength={17}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-lg"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Format attendu: 14 chiffres (espaces optionnels)
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Qu'est-ce que le SIRET ?
                </h3>
                <p className="text-sm text-purple-800">
                  Le SIRET est un numéro unique à 14 chiffres qui identifie chaque établissement d'une entreprise française. Il est composé du SIREN (9 chiffres) + 5 chiffres supplémentaires.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  🚀 Ce qui sera créé automatiquement:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Données officielles (Annuaire des Entreprises)</li>
                  <li>✓ Localisation et coordonnées GPS</li>
                  <li>✓ Informations Google Maps (avis, horaires, photos)</li>
                  <li>✓ Description professionnelle générée par IA</li>
                  <li>✓ Liste des services suggérés</li>
                  <li>✓ Badge "Entreprise Vérifiée"</li>
                </ul>
              </div>

              <button
                onClick={handleSiretSearch}
                disabled={loading || siretInput.replace(/\s/g, '').length !== 14}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? 'Recherche en cours...' : 'Rechercher et Créer'}
              </button>

              {loading && (
                <div className="text-center text-gray-600 text-sm">
                  <p>⏳ Récupération des données...</p>
                  <p className="mt-1 text-xs">Cela peut prendre quelques secondes</p>
                </div>
              )}
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
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData({
                        ...formData,
                        name: newName,
                        slug: slugify(newName)
                      });
                    }}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      (Généré automatiquement, modifiable)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: slugify(e.target.value) })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="ex: mon-entreprise"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    URL finale: /companies/{formData.slug || 'votre-slug'}
                  </p>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, logoUrl: e.target.value })
                    }
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {formData.logoUrl && (
                    <div className="mt-2">
                      <img src={formData.logoUrl} alt="Logo preview" className="h-16 w-16 object-contain border rounded" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de couverture URL
                  </label>
                  <input
                    type="url"
                    value={formData.coverImageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, coverImageUrl: e.target.value })
                    }
                    placeholder="https://example.com/cover.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {formData.coverImageUrl && (
                    <div className="mt-2">
                      <img src={formData.coverImageUrl} alt="Cover preview" className="h-24 w-full object-cover border rounded" />
                    </div>
                  )}
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

