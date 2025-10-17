'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface GenerateCoverButtonProps {
  companyId: number;
  companyName: string;
  hasCoverImage: boolean;
  onSuccess?: () => void;
}

export default function GenerateCoverButton({
  companyId,
  companyName,
  hasCoverImage,
  onSuccess,
}: GenerateCoverButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerateCover = async () => {
    if (hasCoverImage) {
      toast.info('Cette entreprise a déjà une image de couverture');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/generate-cover-image`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      toast.success(`Image de couverture générée pour ${companyName}`);

      // Refresh page after 2 seconds to show the new image
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération');
      console.error('Error generating cover image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerateCover}
      disabled={loading || hasCoverImage}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        hasCoverImage
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
          : loading
            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
            : 'bg-purple-600 text-white hover:bg-purple-700'
      } font-medium text-sm`}
      title={hasCoverImage ? 'Image de couverture existante' : 'Générer une image de couverture avec l\'IA'}
    >
      {loading ? (
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
      ) : hasCoverImage ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
          Image existante
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
  );
}
