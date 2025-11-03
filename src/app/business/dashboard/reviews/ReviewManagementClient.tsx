'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

interface Review {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
  isVerified: boolean;
  company: {
    id: number;
    name: string;
    slug: string;
  };
  reply: {
    id: string;
    content: string;
    createdAt: string;
  } | null;
  votes: any[];
}

interface Company {
  id: number;
  name: string;
  slug: string;
}

export default function ReviewManagementClient({
  reviews: initialReviews,
  companies,
}: {
  reviews: Review[];
  companies: Company[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [selectedCompany, setSelectedCompany] = useState<string | number>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    if (selectedCompany !== 'all' && review.company.id !== selectedCompany) {
      return false;
    }

    if (filter === 'pending' && review.reply) {
      return false;
    }

    if (filter === 'replied' && !review.reply) {
      return false;
    }

    return true;
  });

  // Handle reply submission
  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/business/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update reviews list
        setReviews(reviews.map((r) =>
          r.id === reviewId
            ? { ...r, reply: data.reply }
            : r
        ));

        setReplyingTo(null);
        setReplyText('');
      }
    } catch (error) {
      logger.error('Error submitting reply:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle reply deletion
  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/business/reviews/${reviewId}/reply`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update reviews list
        setReviews(reviews.map((r) =>
          r.id === reviewId
            ? { ...r, reply: null }
            : r
        ));
      }
    } catch (error) {
      logger.error('Error deleting reply:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate AI reply
  const handleGenerateAIReply = async (reviewId: string, rating: number, comment: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-review-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, reviewText: comment }),
      });

      if (response.ok) {
        const data = await response.json();
        setReplyText(data.response);
      }
    } catch (error) {
      logger.error('Error generating AI reply:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Company Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entreprise
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="all">Toutes</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En Attente
              </button>
              <button
                onClick={() => setFilter('replied')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'replied'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Répondus
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Aucun avis trouvé
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {review.authorName}
                    </h3>
                    {review.isVerified && (
                      <CheckBadgeIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span className="text-blue-600">{review.company.name}</span>
                  </div>
                </div>

                {!review.reply && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    En attente
                  </span>
                )}
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Existing Reply */}
              {review.reply && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2 mb-2">
                    <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-blue-900 mb-1">
                        Votre réponse
                      </div>
                      <p className="text-gray-700">{review.reply.content}</p>
                      <div className="text-sm text-gray-600 mt-2">
                        {new Date(review.reply.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReply(review.id)}
                    disabled={loading}
                    className="text-sm text-red-600 hover:text-red-700 mt-2"
                  >
                    Supprimer la réponse
                  </button>
                </div>
              )}

              {/* Reply Form */}
              {!review.reply && replyingTo === review.id && (
                <div className="border-t pt-4">
                  <div className="mb-3">
                    <button
                      onClick={() => handleGenerateAIReply(review.id, review.rating, review.comment)}
                      disabled={loading}
                      className="text-sm text-blue-600 hover:text-blue-700 mb-2"
                    >
                      ✨ Générer une réponse avec l'IA
                    </button>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Écrivez votre réponse..."
                    className="w-full border border-gray-300 rounded-lg p-3 mb-3"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReplySubmit(review.id)}
                      disabled={loading || !replyText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Envoi...' : 'Envoyer'}
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Reply Button */}
              {!review.reply && replyingTo !== review.id && (
                <button
                  onClick={() => setReplyingTo(review.id)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  Répondre
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

