'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Review {
  id: number;
  authorName: string;
  authorPhoto: string | null;
  rating: number;
  comment: string | null;
  source: string;
  reviewDate: string;
}

interface CompanyReviewsProps {
  companyId: number;
  companyName: string;
}

export default function CompanyReviews({ companyId, companyName }: CompanyReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Avis Clients ({reviews.length})
        </h2>
        <button
          onClick={syncGoogleReviews}
          disabled={syncing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm"
        >
          {syncing ? '⏳ Synchronisation...' : '🔄 Sync Google'}
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-600 mb-4">
            Aucun avis pour le moment
          </p>
          <p className="text-sm text-gray-500">
            Soyez le premier à laisser un avis sur {companyName}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex items-start space-x-4">
                {review.authorPhoto ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={review.authorPhoto}
                      alt={review.authorName}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {review.authorName.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.authorName}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.reviewDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    {review.source === 'google' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Google
                      </span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

