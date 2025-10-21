'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { toast } from 'sonner';

interface AIContentGeneratorProps {
  companyId: number;
  companyName: string;
  category: string;
  currentDescription?: string;
  onContentGenerated?: (content: string) => void;
}

export default function AIContentGenerator({
  companyId,
  companyName,
  category,
  currentDescription,
  onContentGenerated,
}: AIContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/companies/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          name: companyName,
          category,
          description: currentDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setGeneratedContent(data.content);
      setShowPreview(true);
      toast.success('Contenu généré avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération');
      logger.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveContent = () => {
    if (onContentGenerated) {
      onContentGenerated(generatedContent);
      toast.success('Contenu approuvé et sauvegardé');
      setShowPreview(false);
      setGeneratedContent('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Génération de Contenu IA</h3>
        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
          Expérimental
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {currentDescription
          ? "Améliorer et développer la description existante avec l'IA"
          : "Générer une nouvelle description professionnelle avec l'IA"}
      </p>

      {/* Generate Button */}
      <button
        onClick={handleGenerateContent}
        disabled={isGenerating}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors mb-4 ${
          isGenerating
            ? 'bg-purple-400 text-white cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        } flex items-center justify-center gap-2`}
      >
        {isGenerating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Génération en cours...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Générer avec l&apos;IA
          </>
        )}
      </button>

      {/* Content Preview */}
      {showPreview && generatedContent && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Aperçu du Contenu Généré</h4>

          <div className="mb-4 p-3 bg-white rounded border border-gray-200 max-h-64 overflow-y-auto">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{generatedContent}</p>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            ℹ️ Vous pouvez modifier ce contenu manuellement après l&apos;approbation
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleApproveContent}
              className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              ✓ Approuver et Utiliser
            </button>
            <button
              onClick={() => {
                setShowPreview(false);
                setGeneratedContent('');
              }}
              className="flex-1 py-2 px-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
            >
              ✕ Annuler
            </button>
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
              title="Générer une nouvelle version"
            >
              🔄 Régénérer
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800">
        <p className="font-semibold mb-1">💡 Comment ça marche:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>L&apos;IA génère un contenu SEO-optimisé basé sur {currentDescription ? 'votre description actuelle' : 'les infos de votre entreprise'}</li>
          <li>150-300 mots en français professionnel</li>
          <li>Vous pouvez vérifier et modifier avant de sauvegarder</li>
          <li>Plusieurs tentatives possibles pour trouver le meilleur contenu</li>
        </ul>
      </div>
    </div>
  );
}
