'use client';

import { useState } from 'react';

interface AIContentGeneratorProps {
  companyId: number;
  companyName: string;
  category: string;
  city: string;
  address?: string;
  existingDescription?: string;
  onGenerated?: (description: string) => void;
}

export default function AIContentGenerator({
  companyId,
  companyName,
  category,
  city,
  address,
  existingDescription,
  onGenerated,
}: AIContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState('');
  const [usage, setUsage] = useState<{ current: number; limit: number } | null>(null);
  const [stats, setStats] = useState<{
    provider: string;
    model: string;
    tokensUsed?: number;
    costCents?: number;
  } | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setGeneratedContent('');

    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          name: companyName,
          category,
          city,
          address,
          existingDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setGeneratedContent(data.description);
      setUsage(data.usage);
      setStats({
        provider: data.provider,
        model: data.model,
        tokensUsed: data.tokensUsed,
        costCents: data.costCents,
      });

      if (onGenerated) {
        onGenerated(data.description);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      alert('Copié dans le presse-papier !');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Générateur de Description AI
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Créez une description professionnelle optimisée SEO avec l'IA
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
      </div>

      {/* Usage Counter */}
      {usage && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              Utilisation quotidienne
            </span>
            <span className="text-sm text-blue-700">
              {usage.current} / {usage.limit === -1 ? '∞' : usage.limit}
            </span>
          </div>
          {usage.limit !== -1 && (
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((usage.current / usage.limit) * 100, 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Company Info Preview */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Informations:</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p><strong>Nom:</strong> {companyName}</p>
          <p><strong>Catégorie:</strong> {category}</p>
          <p><strong>Ville:</strong> {city}</p>
          {address && <p><strong>Adresse:</strong> {address}</p>}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isGenerating ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
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
            <span>Génération en cours...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Générer avec l'IA</span>
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Erreur</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generated Content */}
      {generatedContent && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Description générée:
            </h4>
            <button
              onClick={handleCopy}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copier</span>
            </button>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {generatedContent}
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>
                  <strong>Provider:</strong> {stats.provider}
                </span>
                <span>
                  <strong>Model:</strong> {stats.model}
                </span>
                {stats.tokensUsed && (
                  <span>
                    <strong>Tokens:</strong> {stats.tokensUsed}
                  </span>
                )}
              </div>
              {stats.costCents !== undefined && (
                <span className="text-green-600 font-medium">
                  Coût: ~{stats.costCents.toFixed(4)}¢
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Conseils:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• La description est optimisée pour le référencement local</li>
          <li>• Vous pouvez régénérer plusieurs fois pour comparer</li>
          <li>• N'hésitez pas à personnaliser le texte généré</li>
          <li>• Incluez vos spécificités pour un meilleur résultat</li>
        </ul>
      </div>
    </div>
  );
}
