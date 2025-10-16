'use client';

import { useState } from 'react';

interface Review {
  id: number;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

interface ReviewAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  topics: {
    service?: 'positive' | 'neutral' | 'negative' | null;
    quality?: 'positive' | 'neutral' | 'negative' | null;
    price?: 'positive' | 'neutral' | 'negative' | null;
    ambiance?: 'positive' | 'neutral' | 'negative' | null;
    hygiene?: 'positive' | 'neutral' | 'negative' | null;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

interface AIReviewAnalyzerProps {
  review: Review;
  onAnalyzed?: (analysis: ReviewAnalysis) => void;
}

export default function AIReviewAnalyzer({ review, onAnalyzed }: AIReviewAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ReviewAnalysis | null>(null);
  const [error, setError] = useState('');
  const [usage, setUsage] = useState<{ current: number; limit: number } | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await fetch('/api/ai/analyze-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId: review.id,
          rating: review.rating,
          comment: review.comment,
          authorName: review.authorName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse');
      }

      setAnalysis(data.analysis);
      setUsage(data.usage);

      if (onAnalyzed) {
        onAnalyzed(data.analysis);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getTopicIcon = (sentiment: 'positive' | 'neutral' | 'negative' | null) => {
    switch (sentiment) {
      case 'positive':
        return '✅';
      case 'negative':
        return '❌';
      case 'neutral':
        return '➖';
      default:
        return '❓';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Review Preview */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">{review.authorName}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-3">{review.comment}</p>
      </div>

      {/* Analyze Button */}
      {!analysis && (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Analyse en cours...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>Analyser avec l'IA</span>
            </>
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="mt-4 space-y-4">
          {/* Sentiment */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sentiment:</h4>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(analysis.sentiment)}`}
            >
              {analysis.sentiment === 'positive' && '😊 Positif'}
              {analysis.sentiment === 'neutral' && '😐 Neutre'}
              {analysis.sentiment === 'negative' && '😞 Négatif'}
            </span>
          </div>

          {/* Summary */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Résumé:</h4>
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{analysis.summary}</p>
          </div>

          {/* Topics */}
          {Object.keys(analysis.topics).some((k) => analysis.topics[k as keyof typeof analysis.topics] !== null) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Thèmes abordés:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(analysis.topics).map(
                  ([topic, sentiment]) =>
                    sentiment && (
                      <div
                        key={topic}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm capitalize">{topic}</span>
                        <span>{getTopicIcon(sentiment)}</span>
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Keywords */}
          {analysis.keywords.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Mots-clés:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Points forts:</h4>
              <ul className="space-y-1">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-start space-x-2">
                    <span>✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {analysis.weaknesses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Points à améliorer:</h4>
              <ul className="space-y-1">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start space-x-2">
                    <span>✗</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Usage Counter */}
          {usage && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>Utilisation: {usage.current} / {usage.limit === -1 ? '∞' : usage.limit}</span>
                <button
                  onClick={() => setAnalysis(null)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Nouvelle analyse
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
