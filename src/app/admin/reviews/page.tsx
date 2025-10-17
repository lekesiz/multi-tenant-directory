'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface Review {
  id: number;
  comment: string | null;
  commentFr: string | null;
  rating: number;
  isApproved: boolean;
  isActive: boolean;
  source: string;
  createdAt: string;
  originalLanguage?: string;
  company: {
    id: number;
    name: string;
    city: string;
  };
  authorName: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminReviewsPage() {
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>(
    (searchParams.get('filter') as any) || 'all'
  );
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(
    searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined
  );

  useEffect(() => {
    fetchReviews();
  }, [currentPage, filter, ratingFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (filter === 'approved') params.append('isApproved', 'true');
      if (filter === 'pending') params.append('isApproved', 'false');
      if (ratingFilter) params.append('rating', ratingFilter.toString());

      const response = await fetch(`/api/admin/reviews?${params}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Erreur lors du chargement des avis');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: number) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, isApproved: true }),
      });

      if (!response.ok) throw new Error('Failed to approve review');

      toast.success('Avis approuvé');
      fetchReviews();
    } catch (error) {
      toast.error('Erreur lors de l\'approbation');
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, isApproved: false }),
      });

      if (!response.ok) throw new Error('Failed to reject review');

      toast.success('Avis rejeté');
      fetchReviews();
    } catch (error) {
      toast.error('Erreur lors du rejet');
      console.error('Error rejecting review:', error);
    }
  };

  const handleToggleActive = async (reviewId: number, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to toggle review visibility');

      toast.success(currentStatus ? 'Avis masqué' : 'Avis affiché');
      fetchReviews();
    } catch (error) {
      toast.error('Erreur lors du changement de visibilité');
      console.error('Error toggling review visibility:', error);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete review');

      toast.success('Avis supprimé');
      fetchReviews();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting review:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Chargement des avis...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Avis</h1>
          <p className="text-gray-600 mt-2">
            {pagination?.total} avis au total
          </p>
        </div>
        <Link
          href="/admin/reviews/sync"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Synchroniser avec Google
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter by status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Tous les avis</option>
              <option value="approved">Approuvés</option>
              <option value="pending">En attente</option>
            </select>
          </div>

          {/* Filter by rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <select
              value={ratingFilter || ''}
              onChange={(e) => {
                setRatingFilter(e.target.value ? parseInt(e.target.value) : undefined);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Toutes les notes</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 étoiles)</option>
              <option value="4">⭐⭐⭐⭐ (4 étoiles)</option>
              <option value="3">⭐⭐⭐ (3 étoiles)</option>
              <option value="2">⭐⭐ (2 étoiles)</option>
              <option value="1">⭐ (1 étoile)</option>
            </select>
          </div>

          {/* Reset filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter('all');
                setRatingFilter(undefined);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucun avis trouvé avec les filtres actuels.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auteur & Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visibilité
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {review.company.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {review.company.city}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {review.authorName}
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">
                        {'⭐'.repeat(review.rating)}
                      </span>
                      <span className="text-gray-400">
                        {'⭐'.repeat(5 - review.rating)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-gray-600 truncate">
                      {review.commentFr || review.comment}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        review.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {review.isApproved ? '✓ Approuvé' : '⏳ En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        review.isActive
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {review.isActive ? '👁️ Visible' : '🚫 Masqué'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    {!review.isApproved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Approuver
                      </button>
                    )}
                    {review.isApproved && (
                      <button
                        onClick={() => handleReject(review.id)}
                        className="text-yellow-600 hover:text-yellow-900 font-medium"
                      >
                        Rejeter
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleActive(review.id, review.isActive)}
                      className={`font-medium ${
                        review.isActive
                          ? 'text-blue-600 hover:text-blue-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {review.isActive ? '👁️ Masquer' : '🚫 Afficher'}
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            ← Précédent
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
            disabled={currentPage === pagination.pages}
            className="px-3 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
