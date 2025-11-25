'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CompanyStatusToggle from '@/app/admin/companies/company-status-toggle';

type Company = {
  id: number;
  name: string;
  slug: string;
  city: string | null;
  isActive: boolean;
  googlePlaceId: string | null;
  createdAt: Date;
  content: Array<{
    domainId: number;
    domain: {
      id: number;
      name: string;
    };
  }>;
  _count: {
    reviews: number;
  };
};

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
};

type FiltersInfo = {
  search: string;
  city: string;
  status: string;
};

interface CompaniesTableProps {
  companies: Company[];
  cities: string[];
  pagination: PaginationInfo;
  filters: FiltersInfo;
}

export default function CompaniesTable({
  companies,
  cities,
  pagination,
  filters,
}: CompaniesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [cityFilter, setCityFilter] = useState(filters.city);
  const [statusFilter, setStatusFilter] = useState(filters.status);

  // Build URL with params
  const buildUrl = useCallback(
    (params: { page?: number; search?: string; city?: string; status?: string }) => {
      const newParams = new URLSearchParams();

      const search = params.search !== undefined ? params.search : searchTerm;
      const city = params.city !== undefined ? params.city : cityFilter;
      const status = params.status !== undefined ? params.status : statusFilter;
      const page = params.page || 1;

      if (page > 1) newParams.set('page', page.toString());
      if (search) newParams.set('search', search);
      if (city) newParams.set('city', city);
      if (status && status !== 'all') newParams.set('status', status);

      const queryString = newParams.toString();
      return `/admin/companies${queryString ? `?${queryString}` : ''}`;
    },
    [searchTerm, cityFilter, statusFilter]
  );

  // Handle filter changes
  const handleSearch = () => {
    router.push(buildUrl({ page: 1, search: searchTerm, city: cityFilter, status: statusFilter }));
  };

  const handleCityChange = (city: string) => {
    setCityFilter(city);
    router.push(buildUrl({ page: 1, city }));
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    router.push(buildUrl({ page: 1, status }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCityFilter('');
    setStatusFilter('all');
    router.push('/admin/companies');
  };

  const hasActiveFilters = filters.search || filters.city || filters.status !== 'all';

  // Calculate display range
  const startItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const endItem = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalCount);

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nom, ville, slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ville
            </label>
            <select
              value={cityFilter}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les villes</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Effacer les filtres
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600 flex items-center justify-between">
          <span>
            Affichage de {startItem}-{endItem} sur {pagination.totalCount} entreprise{pagination.totalCount !== 1 ? 's' : ''}
          </span>
          {hasActiveFilters && (
            <span className="text-blue-600">
              Filtres actifs
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ville
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domaine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Aucune entreprise trouvée
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {company.name}
                      </div>
                      <div className="text-sm text-gray-500">{company.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.content[0]?.domain.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company._count.reviews}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CompanyStatusToggle
                      companyId={company.id}
                      isActive={company.isActive}
                      companyName={company.name}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/companies/${company.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {pagination.currentPage} sur {pagination.totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* First Page */}
            <Link
              href={buildUrl({ page: 1 })}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pagination.currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </Link>

            {/* Previous Page */}
            <Link
              href={buildUrl({ page: Math.max(1, pagination.currentPage - 1) })}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pagination.currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {generatePageNumbers(pagination.currentPage, pagination.totalPages).map((pageNum, idx) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">...</span>
                ) : (
                  <Link
                    key={pageNum}
                    href={buildUrl({ page: pageNum as number })}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pagination.currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              ))}
            </div>

            {/* Next Page */}
            <Link
              href={buildUrl({ page: Math.min(pagination.totalPages, pagination.currentPage + 1) })}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pagination.currentPage === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Last Page */}
            <Link
              href={buildUrl({ page: pagination.totalPages })}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pagination.currentPage === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Quick Jump */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-gray-600">Aller à:</span>
            <input
              type="number"
              min={1}
              max={pagination.totalPages}
              defaultValue={pagination.currentPage}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const page = Math.max(1, Math.min(pagination.totalPages, parseInt((e.target as HTMLInputElement).value) || 1));
                  router.push(buildUrl({ page }));
                }
              }}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Generate page numbers with ellipsis
function generatePageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];
  const showEllipsis = totalPages > 7;

  if (!showEllipsis) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
  }

  return pages;
}
