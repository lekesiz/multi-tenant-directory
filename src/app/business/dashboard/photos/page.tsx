'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { PhotoIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const MAX_PHOTOS = 50;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
  createdAt: string;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch existing photos
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch('/api/business/photos');
        if (response.ok) {
          const data = await response.json();
          setPhotos(data.photos || []);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des photos');
      } finally {
        setIsFetching(false);
      }
    }

    fetchPhotos();
  }, []);

  // Handle file validation
  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];

    for (const file of files) {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Format non supporté (JPG, PNG, WebP uniquement)`);
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: Fichier trop volumineux (max 5MB)`);
        continue;
      }

      validFiles.push(file);
    }

    // Check total photo limit
    if (photos.length + validFiles.length > MAX_PHOTOS) {
      toast.error(`Limite de ${MAX_PHOTOS} photos atteinte`);
      return validFiles.slice(0, MAX_PHOTOS - photos.length);
    }

    return validFiles;
  };

  // Handle file upload
  const handleUpload = async (files: File[]) => {
    const validFiles = validateFiles(files);

    if (validFiles.length === 0) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append('photos', file);
      });

      const response = await fetch('/api/business/photos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setPhotos([...photos, ...data.photos]);
      toast.success(`${validFiles.length} photo(s) téléchargée(s)`);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(Array.from(e.target.files));
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      handleUpload(files);
    },
    [photos]
  );

  // Handle photo selection
  const togglePhotoSelection = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (selectedPhotos.size === 0) return;

    if (!confirm(`Supprimer ${selectedPhotos.size} photo(s) ?`)) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/business/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoIds: Array.from(selectedPhotos),
        }),
      });

      if (!response.ok) throw new Error('Delete failed');

      setPhotos(photos.filter((p) => !selectedPhotos.has(p.id)));
      setSelectedPhotos(new Set());
      toast.success(`${selectedPhotos.size} photo(s) supprimée(s)`);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle set primary photo
  const handleSetPrimary = async (photoId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/business/photos/${photoId}/primary`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Update failed');

      setPhotos(
        photos.map((p) => ({
          ...p,
          isPrimary: p.id === photoId,
        }))
      );
      toast.success('Photo principale mise à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Galerie photos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {photos.length} / {MAX_PHOTOS} photos
          </p>
        </div>

        {selectedPhotos.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            Supprimer ({selectedPhotos.size})
          </button>
        )}
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-8 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            Sélectionner des photos
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isLoading || photos.length >= MAX_PHOTOS}
            className="hidden"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          ou glissez-déposez vos photos ici
        </p>
        <p className="mt-1 text-xs text-gray-400">
          JPG, PNG, WebP jusqu'à 5MB par fichier
        </p>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune photo</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par télécharger vos premières photos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedPhotos.has(photo.id)}
                  onChange={() => togglePhotoSelection(photo.id)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* Primary Badge */}
              {photo.isPrimary && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-600 text-white">
                    Principale
                  </span>
                </div>
              )}

              {/* Photo */}
              <img
                src={photo.url}
                alt=""
                className="w-full h-48 object-cover"
              />

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {!photo.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(photo.id)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
                    >
                      Définir comme principale
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
