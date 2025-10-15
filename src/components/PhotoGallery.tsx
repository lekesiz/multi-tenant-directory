'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PhotoGalleryProps {
  photos: string[] | null;
  companyName: string;
  coverImage?: string | null;
}

export default function PhotoGallery({ photos, companyName, coverImage }: PhotoGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
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
              onClick={() => !imageError[photo] && setSelectedImage(photo)}
            >
              {!imageError[photo] ? (
                <Image
                  src={photo}
                  alt={`${companyName} - Photo ${index + 1}`}
                  fill
                  sizes={index === 0 && allPhotos.length > 1 ? "(max-width: 768px) 100vw, 400px" : "(max-width: 768px) 50vw, 200px"}
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(photo)}
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
            onClick={() => setSelectedImage(allPhotos[0])}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Voir toutes les photos ({allPhotos.length})
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage}
                alt={`${companyName} - Full size`}
                width={1200}
                height={800}
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>

            {/* Navigation buttons */}
            {allPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = allPhotos.indexOf(selectedImage);
                    const prevIndex = currentIndex === 0 ? allPhotos.length - 1 : currentIndex - 1;
                    setSelectedImage(allPhotos[prevIndex]);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = allPhotos.indexOf(selectedImage);
                    const nextIndex = currentIndex === allPhotos.length - 1 ? 0 : currentIndex + 1;
                    setSelectedImage(allPhotos[nextIndex]);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}