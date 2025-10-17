'use client';

import { useState } from 'react';
import { isValidYouTubeUrl, extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube';
import Image from 'next/image';
import { toast } from 'sonner';

interface YouTubeVideosManagerProps {
  companyId: number;
  initialVideos?: string[];
  onSave?: (videos: string[]) => void;
}

export default function YouTubeVideosManager({
  companyId,
  initialVideos = [],
  onSave,
}: YouTubeVideosManagerProps) {
  const [videos, setVideos] = useState<string[]>(initialVideos);
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const addVideo = () => {
    const url = inputValue.trim();

    if (!url) {
      toast.error('Veuillez entrer une URL YouTube');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      toast.error('URL YouTube invalide. Utilisez youtube.com, youtu.be ou youtube.com/embed');
      return;
    }

    if (videos.includes(url)) {
      toast.warning('Cette vidéo est déjà ajoutée');
      return;
    }

    setVideos([...videos, url]);
    setInputValue('');
    toast.success('Vidéo ajoutée');
  };

  const removeVideo = (index: number) => {
    const removed = videos[index];
    setVideos(videos.filter((_, i) => i !== index));
    toast.success('Vidéo supprimée');
  };

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    const newVideos = [...videos];
    if (direction === 'up' && index > 0) {
      [newVideos[index], newVideos[index - 1]] = [newVideos[index - 1], newVideos[index]];
    } else if (direction === 'down' && index < videos.length - 1) {
      [newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]];
    }
    setVideos(newVideos);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/videos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeVideos: videos }),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      toast.success('Vidéos sauvegardées');
      if (onSave) onSave(videos);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vidéos YouTube</h3>

      {/* Add Video Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter une vidéo YouTube</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && addVideo()}
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addVideo}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ajouter
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Accepte: youtube.com, youtu.be, ou lien /embed
        </p>
      </div>

      {/* Videos List */}
      <div className="space-y-3 mb-6">
        {videos.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Aucune vidéo ajoutée</p>
        ) : (
          videos.map((video, index) => {
            const videoId = extractYouTubeId(video);
            const thumbnail = getYouTubeThumbnail(video, 'medium');

            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Thumbnail */}
                {thumbnail && (
                  <div className="relative flex-shrink-0">
                    <Image
                      src={thumbnail}
                      alt={`Vidéo ${index + 1}`}
                      width={80}
                      height={45}
                      className="rounded"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded">
                      <svg className="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{videoId}</p>
                  <p className="text-xs text-gray-500 truncate">{video}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  {index > 0 && (
                    <button
                      onClick={() => moveVideo(index, 'up')}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Déplacer vers le haut"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  )}
                  {index < videos.length - 1 && (
                    <button
                      onClick={() => moveVideo(index, 'down')}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Déplacer vers le bas"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => removeVideo(index)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Save Button */}
      {videos.length > 0 && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isSaving
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isSaving ? 'Enregistrement...' : `Enregistrer ${videos.length} vidéo${videos.length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}
