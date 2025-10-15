'use client';

import { useState, useEffect } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons/react/24/solid';

interface ReviewVoteButtonsProps {
  reviewId: number;
  initialHelpfulCount?: number;
}

export function ReviewVoteButtons({ reviewId, initialHelpfulCount = 0 }: ReviewVoteButtonsProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has already voted
    const checkVoteStatus = async () => {
      try {
        const response = await fetch(`/api/reviews/${reviewId}/vote`);
        if (response.ok) {
          const data = await response.json();
          setHasVoted(data.hasVoted);
          setIsHelpful(data.isHelpful);
          setHelpfulCount(data.helpfulCount);
        }
      } catch (error) {
        console.error('Error checking vote status:', error);
      }
    };

    checkVoteStatus();
  }, [reviewId]);

  const handleVote = async (helpful: boolean) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHelpful: helpful }),
      });

      if (response.ok) {
        const data = await response.json();
        setHelpfulCount(data.helpfulCount);
        setHasVoted(true);
        setIsHelpful(helpful);
      } else {
        const error = await response.json();
        console.error('Vote error:', error.error);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-3">
      <span className="text-sm text-gray-600">Cet avis vous a-t-il été utile ?</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleVote(true)}
          disabled={loading}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
            hasVoted && isHelpful === true
              ? 'bg-green-100 text-green-700'
              : 'text-gray-600 hover:bg-gray-100'
          } disabled:opacity-50`}
          title="Oui, cet avis est utile"
        >
          {hasVoted && isHelpful === true ? (
            <HandThumbUpSolidIcon className="w-4 h-4" />
          ) : (
            <HandThumbUpIcon className="w-4 h-4" />
          )}
          <span>Oui</span>
          {helpfulCount > 0 && <span className="font-medium">({helpfulCount})</span>}
        </button>

        <button
          onClick={() => handleVote(false)}
          disabled={loading}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
            hasVoted && isHelpful === false
              ? 'bg-red-100 text-red-700'
              : 'text-gray-600 hover:bg-gray-100'
          } disabled:opacity-50`}
          title="Non, cet avis n'est pas utile"
        >
          {hasVoted && isHelpful === false ? (
            <HandThumbDownSolidIcon className="w-4 h-4" />
          ) : (
            <HandThumbDownIcon className="w-4 h-4" />
          )}
          <span>Non</span>
        </button>
      </div>
    </div>
  );
}