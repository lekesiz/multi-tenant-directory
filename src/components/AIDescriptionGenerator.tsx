'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { toast } from 'sonner';

interface AIDescriptionGeneratorProps {
  companyId: number;
  companyName: string;
  category: string;
  location: string;
  currentDescription?: string;
  onGenerated: (description: string) => void;
}

export default function AIDescriptionGenerator({
  companyId,
  companyName,
  category,
  location,
  currentDescription,
  onGenerated,
}: AIDescriptionGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/admin/companies/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          companyId,
          name: companyName,
          category,
          description: currentDescription,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      
      if (data.content) {
        onGenerated(data.content);
        toast.success('✨ Description générée avec succès!');
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      logger.error('Error generating description:', error);
      toast.error('❌ Erreur lors de la génération de la description');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={generating}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      title="Générer une description avec l'IA"
    >
      {generating ? (
        <>
          <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Génération en cours...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          ✨ Générer avec l'IA
        </>
      )}
    </button>
  );
}

