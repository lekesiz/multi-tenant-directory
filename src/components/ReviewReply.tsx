'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReviewReplyProps {
  reviewId: number;
  reply?: {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    owner?: {
      firstName?: string;
      lastName?: string;
    };
  };
  companyName: string;
  isBusinessOwner?: boolean;
  onReplySuccess?: () => void;
}

export function ReviewReply({
  reviewId,
  reply,
  companyName,
  isBusinessOwner = false,
  onReplySuccess,
}: ReviewReplyProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(reply?.content || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/business/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setIsEditing(false);
      if (onReplySuccess) {
        onReplySuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/business/reviews/${reviewId}/reply`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      setContent('');
      if (onReplySuccess) {
        onReplySuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (reply && !isEditing) {
    return (
      <div className="mt-4 ml-12 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-900">
                Réponse de {companyName}
              </span>
              <span className="text-sm text-gray-500">
                {format(new Date(reply.createdAt), 'PPP', { locale: fr })}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
          </div>
          {isBusinessOwner && (
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isBusinessOwner && (isEditing || !reply)) {
    return (
      <form onSubmit={handleSubmit} className="mt-4 ml-12">
        <div className="space-y-4">
          <div>
            <label htmlFor={`reply-${reviewId}`} className="sr-only">
              Votre réponse
            </label>
            <textarea
              id={`reply-${reviewId}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrivez votre réponse..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              minLength={10}
              maxLength={1000}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setContent(reply?.content || '');
                setError('');
              }}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || content.length < 10}
            >
              {loading ? 'Envoi...' : reply ? 'Mettre à jour' : 'Répondre'}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return null;
}