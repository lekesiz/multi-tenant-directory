'use client';

import { useState } from 'react';
import Image from 'next/image';
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube';

interface YouTubeVideosProps {
  videos?: string[];
  companyName?: string;
}

export default function YouTubeVideos({ videos = [], companyName = 'Company' }: YouTubeVideosProps) {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!videos || videos.length === 0) {
    return null;
  }

  // Filter and validate YouTube URLs
  const validVideos = videos
    .map(url => ({
      url: url.trim(),
      id: extractYouTubeId(url.trim()),
      thumbnail: getYouTubeThumbnail(url.trim(), 'high'),
    }))
    .filter(v => v.id !== null);

  if (validVideos.length === 0) {
    return null;
  }

  const selectedVideo = validVideos[selectedVideoIndex];

  return (
    <div className="w-full">
      {/* Main Video Player */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${selectedVideo.id}`}
          title={`Video ${selectedVideoIndex + 1}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Video Info */}
      <div className="mt-4 mb-4">
        <p className="text-sm text-gray-600">
          Vidéo {selectedVideoIndex + 1} sur {validVideos.length}
        </p>
      </div>

      {/* Video Thumbnails Grid */}
      {validVideos.length > 1 && (
        <>
          <div
            className={`grid gap-3 ${
              isExpanded ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'
            } transition-all duration-300`}
          >
            {validVideos.slice(0, isExpanded ? validVideos.length : 3).map((video, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedVideoIndex(index);
                  // Scroll to main video
                  const mainPlayer = document.querySelector('[data-video-player]');
                  mainPlayer?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                  index === selectedVideoIndex ? 'ring-2 ring-blue-500 scale-105' : 'hover:opacity-80'
                }`}
                title={`Vidéo ${index + 1}`}
              >
                {video.thumbnail ? (
                  <Image
                    src={video.thumbnail}
                    alt={`Vidéo ${index + 1}`}
                    width={120}
                    height={68}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Video {index + 1}</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 transition-all">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Expand/Collapse Button */}
          {validVideos.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 w-full py-2 px-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {isExpanded ? 'Afficher moins' : `Afficher plus (${validVideos.length - 3} vidéos)`}
            </button>
          )}
        </>
      )}

      {/* Desktop Gallery View */}
      {validVideos.length > 1 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Galerie ({validVideos.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {validVideos.map((video, index) => (
              <button
                key={index}
                onClick={() => setSelectedVideoIndex(index)}
                className={`relative rounded overflow-hidden transition-all ${
                  index === selectedVideoIndex ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {video.thumbnail ? (
                  <Image
                    src={video.thumbnail}
                    alt={`Vidéo ${index + 1}`}
                    width={160}
                    height={90}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">Video {index + 1}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
