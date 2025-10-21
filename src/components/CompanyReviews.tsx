'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface Review {
  id: number;
  authorName: string;
  authorPhoto: string | null;
  rating: number;
  comment: string | null;
  commentFr: string | null;
  source: string;
  reviewDate: string;
}

interface CompanyReviewsProps {
  companyId: number;
  companyName: string;
  totalReviews?: number;
  googleRating?: number | null;
  googlePlaceId?: string | null;
  ratingDistribution?: Record<string, number> | null;
}

type SortOption = 'recent' | 'oldest' | 'highest' | 'lowest';
type FilterOption = 'all' | 'google' | 'manual';

export default function CompanyReviews({ companyId, companyName, totalReviews, googleRating, googlePlaceId, ratingDistribution }: CompanyReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showStats, setShowStats] = useState(true);
  const reviewsPerPage = 5;

  useEffect(() => {
    fetchReviews();
  }, [companyId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncGoogleReviews = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`/api/companies/${companyId}/sync-reviews`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message}`);
        fetchReviews();
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Error syncing reviews:', error);
      alert('❌ Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (reviews.length === 0) return null;

    const total = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
    
    // Use Google's rating distribution if available, otherwise calculate from local reviews
    let distribution;
    if (ratingDistribution && Object.keys(ratingDistribution).length > 0) {
      const totalDistribution = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);
      distribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: ratingDistribution[star.toString()] || 0,
        percentage: totalDistribution > 0 ? ((ratingDistribution[star.toString()] || 0) / totalDistribution) * 100 : 0,
      }));
    } else {
      distribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
        percentage: (reviews.filter((r) => r.rating === star).length / total) * 100,
      }));
    }

    return { total, avgRating, distribution };
  }, [reviews, ratingDistribution]);

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews;

    // Apply filter
    if (filterBy !== 'all') {
      filtered = reviews.filter((r) => r.source === filterBy);
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
        case 'oldest':
          return new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return sorted;
  }, [reviews, sortBy, filterBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReviews.length / reviewsPerPage);
  const paginatedReviews = filteredAndSortedReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filterBy]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Avis Clients ({totalReviews || reviews.length})
        </h2>
        <button
          onClick={syncGoogleReviews}
          disabled={syncing}
          className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm whitespace-nowrap"
        >
          {syncing ? '⏳ Sync...' : '🔄 Sync Google'}
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-600 mb-4">Aucun avis pour le moment</p>
          <p className="text-sm text-gray-500">
            Soyez le premier à laisser un avis sur {companyName}
          </p>
        </div>
      ) : (
        <>
          {/* Statistics Summary */}
          {stats && showStats && (
            <div className="mb-8 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                  aria-label="Masquer les statistiques"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Average Rating */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <span className="text-5xl font-bold text-gray-900">
                      {googleRating?.toFixed(1) || stats.avgRating.toFixed(1)}
                    </span>
                    <span className="text-4xl text-yellow-500">★</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Basé sur {totalReviews || stats.total} avis
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {stats.distribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-700 font-medium w-8">{star}★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-600 w-12 text-right">
                        {count > 0 ? count : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Business Profile Link */}
              {googlePlaceId && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <a
                    href={`https://search.google.com/local/writereview?placeid=${googlePlaceId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Voir sur Google
                  </a>
                </div>
              )}
            </div>
          )}

          {!showStats && (
            <button
              onClick={() => setShowStats(true)}
              className="mb-6 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Afficher les statistiques
            </button>
          )}

          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 pb-4 border-b border-gray-200">
            {/* Filter by source */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Filtrer par
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous les avis ({reviews.length})</option>
                <option value="google">
                  Google ({reviews.filter((r) => r.source === 'google').length})
                </option>
                <option value="manual">
                  Manuel ({reviews.filter((r) => r.source === 'manual').length})
                </option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="recent">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="highest">Note la plus haute</option>
                <option value="lowest">Note la plus basse</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {filteredAndSortedReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun avis ne correspond à vos critères
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {paginatedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-200 pb-6 last:border-0"
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      {review.authorPhoto ? (
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={review.authorPhoto}
                            alt={review.authorName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                          {review.authorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                {review.authorName}
                              </h4>
                              {review.source === 'google' && (
                                <span
                                  className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                                  title="Avis vérifié par Google"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Vérifié
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <div className="flex" aria-label={`Note: ${review.rating} sur 5`}>
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-sm sm:text-base ${
                                      i < review.rating
                                        ? 'text-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs sm:text-sm text-gray-500">
                                {new Date(review.reviewDate).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {(review.commentFr || review.comment) && (
                          <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">
                            {review.commentFr || review.comment}
                          </p>
                        )}
                        {/* Helpful buttons (placeholder for future implementation) */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <button
                            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            onClick={() => {
                              // Future: implement helpful counter
                              alert('Merci pour votre retour !');
                            }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                            Utile
                          </button>
                          <span>•</span>
                          <button className="hover:text-gray-700 transition-colors">
                            Signaler
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    aria-label="Page précédente"
                  >
                    ← Précédent
                  </button>

                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      // Show first, last, current, and adjacent pages
                      if (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    aria-label="Page suivante"
                  >
                    Suivant →
                  </button>
                </div>
              )}

              {/* Results info */}
              <p className="mt-4 text-center text-sm text-gray-500">
                Affichage de {(currentPage - 1) * reviewsPerPage + 1} à{' '}
                {Math.min(currentPage * reviewsPerPage, filteredAndSortedReviews.length)} sur{' '}
                {filteredAndSortedReviews.length} avis
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}

