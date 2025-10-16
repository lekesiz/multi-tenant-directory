'use client';

import { useState } from 'react';
import { PhotoLightbox } from './PhotoLightbox';
import { OptimizedImage } from './ui/OptimizedImage';
import { LazySection } from './ui/LazySection';

interface PhotoGalleryProps {
  photos: string[] | null;
  companyName: string;
  coverImage?: string | null;
}

export default function PhotoGallery({ photos, companyName, coverImage }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

  // Combine cover image with other photos if available
  const allPhotos: string[] = [];
  if (coverImage) allPhotos.push(coverImage);
  if (photos && photos.length > 0) allPhotos.push(...photos);

  if (allPhotos.length === 0) {
    return null;
  }

  const handleImageError = (src: string) => {
    setImageError(prev => ({ ...prev, [src]: true }));
  };

  return (
    <>
      <LazySection
        className="bg-white rounded-lg shadow p-4 sm:p-6"
        skeleton={
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="col-span-2 row-span-2 h-40 sm:h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-20 sm:h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-20 sm:h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        }
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Photos
        </h3>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {allPhotos.slice(0, 4).map((photo, index) => (
            <div
              key={index}
              className={`relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 ${
                index === 0 && allPhotos.length > 1 ? 'col-span-2 row-span-2 h-40 sm:h-64' : 'h-20 sm:h-32'
              }`}
              onClick={() => !imageError[photo] && (setLightboxIndex(index), setLightboxOpen(true))}
            >
              {!imageError[photo] ? (
                <OptimizedImage
                  src={photo}
                  alt={`${companyName} - Photo ${index + 1}`}
                  fill
                  sizes={index === 0 && allPhotos.length > 1 ? "(max-width: 768px) 100vw, 400px" : "(max-width: 768px) 50vw, 200px"}
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  priority={index === 0}
                  quality={index === 0 ? 85 : 75}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">📷</span>
                </div>
              )}
              
              {index === 3 && allPhotos.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold">
                  +{allPhotos.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>

        {allPhotos.length > 4 && (
          <button
            onClick={() => (setLightboxIndex(0), setLightboxOpen(true))}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Voir toutes les photos ({allPhotos.length})
          </button>
        )}
      </LazySection>

      {/* Lightbox */}
      <PhotoLightbox
        photos={allPhotos.filter(photo => !imageError[photo])}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}