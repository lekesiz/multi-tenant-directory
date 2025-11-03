'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface AIReviewResponseGeneratorProps {
  reviewId: number;
  reviewText: string;
  rating: number;
  businessContext: {
    name: string;
    category: string;
    city: string;
  };
  onResponseGenerated: (response: string) => void;
  onCancel: () => void;
}

export default function AIReviewResponseGenerator({
  reviewId,
  reviewText,
  rating,
  businessContext,
  onResponseGenerated,
  onCancel,
}: AIReviewResponseGeneratorProps) {
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const generateResponse = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/review-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewText,
          rating,
          businessContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la réponse');
      }

      const data = await response.json();
      setGeneratedResponse(data.response);
      setIsEditing(true);
    } catch (error) {
      logger.error('Error generating review response:', error);
      toast.error('Erreur lors de la génération de la réponse');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedResponse.trim()) {
      onResponseGenerated(generatedResponse);
      toast.success('Réponse générée avec succès');
    }
  };

  const handleRegenerate = () => {
    setGeneratedResponse('');
    setIsEditing(false);
    generateResponse();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Assistant IA - Réponse aux avis
            </h3>
            <p className="text-sm text-gray-600">
              Génération automatique de réponse professionnelle
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Original Review */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Avis à traiter</h4>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
        <p className="text-gray-700 text-sm italic">"{reviewText}"</p>
      </div>

      {/* Business Context */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-1">Contexte de l'entreprise</h4>
        <p className="text-blue-700 text-sm">
          {businessContext.name} • {businessContext.category} • {businessContext.city}
        </p>
      </div>

      {/* Generated Response */}
      {!generatedResponse && !isGenerating && (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-gray-500 mb-4">
            Cliquez sur "Générer" pour créer une réponse professionnelle à cet avis
          </p>
          <button
            onClick={generateResponse}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Générer une réponse
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Génération en cours...</span>
          </div>
        </div>
      )}

      {generatedResponse && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Réponse générée</h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {generatedResponse.length} caractères
                </span>
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                >
                  Régénérer
                </button>
              </div>
            </div>
            
            {isEditing ? (
              <textarea
                value={generatedResponse}
                onChange={(e) => setGeneratedResponse(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Modifiez la réponse si nécessaire..."
              />
            ) : (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{generatedResponse}</p>
              </div>
            )}
          </div>

          {/* AI Tips */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-yellow-800 text-sm font-medium">Conseils IA</p>
                <p className="text-yellow-700 text-xs mt-1">
                  {rating >= 4 
                    ? "Réponse positive détectée - l'IA a mis l'accent sur les remerciements et l'invitation à revenir."
                    : "Réponse négative détectée - l'IA a proposé des solutions et montré de l'empathie."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              {isEditing ? 'Aperçu' : 'Modifier'}
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Utiliser cette réponse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}