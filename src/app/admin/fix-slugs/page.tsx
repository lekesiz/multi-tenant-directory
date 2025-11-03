'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FixedSlug {
  id: number;
  name: string;
  oldSlug: string;
  newSlug: string;
}

export default function FixSlugsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fixed, setFixed] = useState<FixedSlug[]>([]);

  const handleFixSlugs = async () => {
    if (!confirm('Êtes-vous sûr de vouloir corriger tous les slugs invalides?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setFixed([]);

    try {
      const response = await fetch('/api/admin/fix-slugs', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        if (data.fixed && data.fixed.length > 0) {
          setSuccess(`✅ ${data.fixed.length} entreprises corrigées avec succès`);
          setFixed(data.fixed);
        } else {
          setSuccess('✅ Tous les slugs sont déjà valides');
        }
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
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
              Corriger les URLs invalides
            </h1>
            <p className="text-gray-600 mt-2">
              Corriger automatiquement les slugs d'URL invalides (espaces, majuscules, caractères spéciaux)
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

      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Correction automatique des slugs
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Cette opération va :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 mb-6">
              <li>Détecter tous les slugs invalides (avec espaces, majuscules, caractères spéciaux)</li>
              <li>Générer de nouveaux slugs valides automatiquement</li>
              <li>Gérer les doublons en ajoutant des numéros</li>
              <li>Mettre à jour la base de données</li>
            </ul>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-semibold">{success}</p>
            </div>
          )}

          <button
            onClick={handleFixSlugs}
            disabled={loading}
            className="w-full bg-amber-600 text-white px-6 py-4 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Correction en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Lancer la correction
              </>
            )}
          </button>

          {fixed.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Entreprises corrigées ({fixed.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nom
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ancien Slug
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nouveau Slug
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fixed.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <code className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                            {item.oldSlug}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <code className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                            {item.newSlug}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Astuce:</strong> Les anciennes URLs seront automatiquement redirigées vers les nouvelles.
                  Les liens existants continueront de fonctionner.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
