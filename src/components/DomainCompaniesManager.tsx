'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  companyCategories: {
    category: {
      id: number;
      name: string;
      nameFr: string | null;
    };
  }[];
  content: {
    id: number;
    isVisible: boolean;
  }[];
}

interface Domain {
  id: number;
  name: string;
  siteTitle: string | null;
  siteDescription: string | null;
  settings: any;
}

interface Props {
  domain: Domain;
  companies: Company[];
}

export default function DomainCompaniesManager({ domain, companies }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedCompanies, setSelectedCompanies] = useState<Set<number>>(new Set());
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(false);

  // Get currently assigned companies
  const assignedCompanyIds = useMemo(() => {
    return new Set(
      companies
        .filter(c => c.content.length > 0 && c.content[0].isVisible)
        .map(c => c.id)
    );
  }, [companies]);

  // Get all categories for filter
  const allCategories = useMemo(() => {
    const cats = new Map<number, { id: number; name: string }>();
    companies.forEach(company => {
      company.companyCategories.forEach(({ category }) => {
        if (!cats.has(category.id)) {
          cats.set(category.id, {
            id: category.id,
            name: category.nameFr || category.name,
          });
        }
      });
    });
    return Array.from(cats.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [companies]);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          company.name.toLowerCase().includes(search) ||
          company.city?.toLowerCase().includes(search) ||
          company.postalCode?.includes(search);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filterCategory !== 'all') {
        const hasCategory = company.companyCategories.some(
          c => c.category.id.toString() === filterCategory
        );
        if (!hasCategory) return false;
      }

      // Assignment filter
      if (showOnlyUnassigned && assignedCompanyIds.has(company.id)) {
        return false;
      }

      return true;
    });
  }, [companies, searchTerm, filterCategory, showOnlyUnassigned, assignedCompanyIds]);

  // Toggle company selection
  const toggleCompany = (companyId: number) => {
    const newSelected = new Set(selectedCompanies);
    if (newSelected.has(companyId)) {
      newSelected.delete(companyId);
    } else {
      newSelected.add(companyId);
    }
    setSelectedCompanies(newSelected);
  };

  // Select all filtered companies
  const selectAllFiltered = () => {
    const newSelected = new Set(selectedCompanies);
    filteredCompanies.forEach(company => {
      if (!assignedCompanyIds.has(company.id)) {
        newSelected.add(company.id);
      }
    });
    setSelectedCompanies(newSelected);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedCompanies(new Set());
  };

  // Assign selected companies
  const handleAssignCompanies = async () => {
    if (selectedCompanies.size === 0) {
      setError('Aucune entreprise sélectionnée');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/domains/${domain.id}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyIds: Array.from(selectedCompanies),
          isVisible: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'attribution');
      }

      const result = await response.json();
      setSuccess(`${result.count} entreprise(s) attribuée(s) avec succès`);
      setSelectedCompanies(new Set());

      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Remove selected companies
  const handleRemoveCompanies = async () => {
    if (selectedCompanies.size === 0) {
      setError('Aucune entreprise sélectionnée');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/domains/${domain.id}/companies`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyIds: Array.from(selectedCompanies),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      const result = await response.json();
      setSuccess(`${result.count} entreprise(s) retirée(s) avec succès`);
      setSelectedCompanies(new Set());

      // Refresh the page
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Filtres</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, ville, code postal..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">Toutes les catégories</option>
              {allCategories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignment filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyUnassigned}
                onChange={(e) => setShowOnlyUnassigned(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Afficher uniquement non attribuées
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {selectedCompanies.size} entreprise(s) sélectionnée(s) sur {filteredCompanies.length}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={selectAllFiltered}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Tout sélectionner
            </button>
            <button
              onClick={clearSelection}
              disabled={loading || selectedCompanies.size === 0}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Désélectionner
            </button>
            <button
              onClick={handleAssignCompanies}
              disabled={loading || selectedCompanies.size === 0}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Attribuer'}
            </button>
            <button
              onClick={handleRemoveCompanies}
              disabled={loading || selectedCompanies.size === 0}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Retirer
            </button>
          </div>
        </div>
      </div>

      {/* Companies list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sélection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ville
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code Postal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucune entreprise trouvée
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => {
                  const isAssigned = assignedCompanyIds.has(company.id);
                  const isSelected = selectedCompanies.has(company.id);

                  return (
                    <tr
                      key={company.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCompany(company.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500">{company.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.city || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.postalCode || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {company.companyCategories.slice(0, 2).map(({ category }) => (
                            <span
                              key={category.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {category.nameFr || category.name}
                            </span>
                          ))}
                          {company.companyCategories.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{company.companyCategories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isAssigned ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Attribuée
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Non attribuée
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
