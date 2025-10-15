# VS Code Developer - Yeni Görevler (Round 2)

**Tarih:** 15 Ekim 2025, 19:30 GMT+2  
**Sprint:** 3 (Gün 1/14)  
**Assigned:** VS Code Developer  
**Priority:** HIGH

---

## 🎉 Önceki Görevler Tamamlandı!

Harika iş! Dashboard ve Profile UI başarıyla tamamlandı:
- ✅ Business Dashboard Layout
- ✅ Profile Edit UI
- ✅ Sonner Toast Provider

---

## 📋 Yeni Görevler

### 🎯 GÖREV 1: Photo Gallery Management UI

**Priority:** 🟡 HIGH  
**Estimate:** 4-5 saat  
**Deadline:** 16 Ekim, 18:00

#### Görev Detayı

Business dashboard'a fotoğraf yönetimi sayfası ekle.

**Hedef:** `/business/dashboard/photos` sayfası

---

#### Design Requirements

```
┌─────────────────────────────────────────────────┐
│  Photo Gallery Management                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Upload Photos] [Delete Selected]             │
│                                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  │     │ │     │ │     │ │     │              │
│  │ IMG │ │ IMG │ │ IMG │ │ IMG │              │
│  │     │ │     │ │     │ │     │              │
│  └─────┘ └─────┘ └─────┘ └─────┘              │
│  [✓] [X] [✓] [X] [✓] [X] [✓] [X]              │
│                                                 │
│  Drag & Drop Zone                               │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │   📁 Drop files here or click to upload  │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Limits: 50 photos max, 5MB per photo          │
└─────────────────────────────────────────────────┘
```

---

#### Implementation

**Dosya:** `src/app/business/dashboard/photos/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PhotoIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Photo {
  id: string;
  url: string;
  uploadedAt: string;
}

export default function PhotosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/business/photos');
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des photos');
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validation
    const maxPhotos = 50;
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (photos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos autorisées`);
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} n'est pas une image`);
        return false;
      }
      if (file.size > maxFileSize) {
        toast.error(`${file.name} est trop volumineux (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('photos', file);
      });

      const response = await fetch('/api/business/photos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setPhotos(prev => [...prev, ...data.photos]);
      toast.success(`${validFiles.length} photo(s) téléchargée(s)`);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedPhotos.size === 0) return;

    setIsDeleting(true);

    try {
      const response = await fetch('/api/business/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds: Array.from(selectedPhotos) }),
      });

      if (!response.ok) throw new Error('Delete failed');

      setPhotos(prev => prev.filter(p => !selectedPhotos.has(p.id)));
      setSelectedPhotos(new Set());
      toast.success(`${selectedPhotos.size} photo(s) supprimée(s)`);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Galerie Photos
        </h1>
        <p className="mt-2 text-gray-600">
          Gérez les photos de votre entreprise ({photos.length}/50)
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <label className="relative cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={isUploading || photos.length >= 50}
          />
          <button
            type="button"
            disabled={isUploading || photos.length >= 50}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            {isUploading ? 'Téléchargement...' : 'Télécharger des photos'}
          </button>
        </label>

        {selectedPhotos.size > 0 && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            {isDeleting ? 'Suppression...' : `Supprimer (${selectedPhotos.size})`}
          </button>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                selectedPhotos.has(photo.id)
                  ? 'border-blue-600'
                  : 'border-gray-200'
              }`}
            >
              <img
                src={photo.url}
                alt="Photo"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                <button
                  onClick={() => togglePhotoSelection(photo.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  {selectedPhotos.has(photo.id) ? '✓' : '○'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-300 bg-gray-50'
        }`}
      >
        <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Glissez-déposez vos photos ici
        </p>
        <p className="text-sm text-gray-500">
          ou cliquez sur le bouton "Télécharger des photos" ci-dessus
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Formats acceptés : JPG, PNG, GIF • Max 5MB par photo • Max 50 photos
        </p>
      </div>

      {/* Empty State */}
      {photos.length === 0 && !isUploading && (
        <div className="text-center py-12">
          <PhotoIcon className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aucune photo
          </h3>
          <p className="text-gray-500 mb-6">
            Commencez par télécharger des photos de votre entreprise
          </p>
        </div>
      )}
    </div>
  );
}
```

---

### 🎯 GÖREV 2: Business Hours Management UI

**Priority:** 🟡 HIGH  
**Estimate:** 3-4 saat  
**Deadline:** 17 Ekim, 12:00

#### Görev Detayı

Business dashboard'a çalışma saatleri yönetimi sayfası ekle.

**Hedef:** `/business/dashboard/hours` sayfası

---

#### Design Requirements

```
┌─────────────────────────────────────────────────┐
│  Horaires d'ouverture                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  Lundi      [09:00] - [18:00]  [Fermé] [✓]     │
│  Mardi      [09:00] - [18:00]  [Fermé] [✓]     │
│  Mercredi   [09:00] - [18:00]  [Fermé] [✓]     │
│  Jeudi      [09:00] - [18:00]  [Fermé] [✓]     │
│  Vendredi   [09:00] - [18:00]  [Fermé] [✓]     │
│  Samedi     [Fermé]            [Ouvert] [ ]     │
│  Dimanche   [Fermé]            [Ouvert] [ ]     │
│                                                 │
│  [Enregistrer les modifications]                │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Horaires spéciaux (jours fériés, vacances)    │
│                                                 │
│  [+ Ajouter un horaire spécial]                │
│                                                 │
│  • 25 Déc 2025: Fermé (Noël)          [X]      │
│  • 1 Jan 2026: Fermé (Nouvel An)      [X]      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

#### Implementation

**Dosya:** `src/app/business/dashboard/hours/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ClockIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface DayHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface SpecialHours {
  id?: string;
  date: string;
  reason: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

const DAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

export default function BusinessHoursPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [regularHours, setRegularHours] = useState<DayHours[]>(
    DAYS.map(day => ({
      day,
      isOpen: day !== 'Samedi' && day !== 'Dimanche',
      openTime: '09:00',
      closeTime: '18:00',
    }))
  );
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchBusinessHours();
  }, []);

  const fetchBusinessHours = async () => {
    try {
      const response = await fetch('/api/business/hours');
      if (!response.ok) throw new Error('Failed to fetch hours');
      const data = await response.json();
      
      if (data.regularHours) {
        setRegularHours(data.regularHours);
      }
      if (data.specialHours) {
        setSpecialHours(data.specialHours);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des horaires');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/business/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regularHours,
          specialHours,
        }),
      });

      if (!response.ok) throw new Error('Save failed');

      toast.success('Horaires enregistrés avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const updateDayHours = (index: number, field: keyof DayHours, value: any) => {
    setRegularHours(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addSpecialHours = () => {
    setSpecialHours(prev => [
      ...prev,
      {
        date: '',
        reason: '',
        isOpen: false,
      },
    ]);
  };

  const updateSpecialHours = (index: number, field: keyof SpecialHours, value: any) => {
    setSpecialHours(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeSpecialHours = (index: number) => {
    setSpecialHours(prev => prev.filter((_, i) => i !== index));
  };

  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Horaires d'ouverture
        </h1>
        <p className="mt-2 text-gray-600">
          Gérez vos horaires d'ouverture hebdomadaires et spéciaux
        </p>
      </div>

      {/* Regular Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Horaires réguliers</h2>
        
        <div className="space-y-4">
          {regularHours.map((dayHours, index) => (
            <div key={dayHours.day} className="flex items-center gap-4">
              <div className="w-32 font-medium text-gray-700">
                {dayHours.day}
              </div>
              
              {dayHours.isOpen ? (
                <>
                  <input
                    type="time"
                    value={dayHours.openTime}
                    onChange={(e) => updateDayHours(index, 'openTime', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="time"
                    value={dayHours.closeTime}
                    onChange={(e) => updateDayHours(index, 'closeTime', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </>
              ) : (
                <div className="px-3 py-2 text-gray-500">Fermé</div>
              )}

              <button
                onClick={() => updateDayHours(index, 'isOpen', !dayHours.isOpen)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  dayHours.isOpen
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {dayHours.isOpen ? 'Fermer' : 'Ouvrir'}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>

      {/* Special Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Horaires spéciaux</h2>
          <button
            onClick={addSpecialHours}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Ajouter
          </button>
        </div>

        {specialHours.length > 0 ? (
          <div className="space-y-4">
            {specialHours.map((special, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <input
                  type="date"
                  value={special.date}
                  onChange={(e) => updateSpecialHours(index, 'date', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={special.reason}
                  onChange={(e) => updateSpecialHours(index, 'reason', e.target.value)}
                  placeholder="Raison (ex: Noël)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={special.isOpen ? 'open' : 'closed'}
                  onChange={(e) => updateSpecialHours(index, 'isOpen', e.target.value === 'open')}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="closed">Fermé</option>
                  <option value="open">Ouvert</option>
                </select>
                <button
                  onClick={() => removeSpecialHours(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Aucun horaire spécial défini
          </p>
        )}
      </div>
    </div>
  );
}
```

---

### 🧪 Testing Checklist

#### Photo Gallery
- [ ] Photos load correctly
- [ ] Upload works (single & multiple)
- [ ] Drag & drop works
- [ ] File validation works (type, size)
- [ ] Photo selection works
- [ ] Delete works
- [ ] Loading states show
- [ ] Error messages display
- [ ] Toast notifications work
- [ ] Responsive design

#### Business Hours
- [ ] Regular hours load
- [ ] Time inputs work
- [ ] Open/Close toggle works
- [ ] Save works
- [ ] Special hours can be added
- [ ] Special hours can be edited
- [ ] Special hours can be deleted
- [ ] Form validation works
- [ ] Toast notifications work
- [ ] Responsive design

---

### 📝 Git Commit

```bash
git add src/app/business/dashboard/photos/
git add src/app/business/dashboard/hours/

git commit -m "feat: photo gallery & business hours UI ✅

Photo Gallery:
- Upload multiple photos
- Drag & drop support
- Photo selection & deletion
- 50 photos limit, 5MB per photo
- Grid layout with responsive design

Business Hours:
- Regular hours (weekly schedule)
- Special hours (holidays, vacations)
- Open/Close toggle
- Time picker inputs
- Add/Edit/Delete special hours

Status: ✅ COMPLETE
UI/UX: ✅ Professional"

git push
```

---

## 🎯 Success Criteria

### Photo Gallery
- [x] Upload UI implemented
- [x] Drag & drop works
- [x] Photo grid displays
- [x] Selection & deletion works
- [x] Validation & limits enforced
- [x] Responsive design
- [x] Loading states
- [x] Error handling

### Business Hours
- [x] Regular hours UI
- [x] Time pickers work
- [x] Open/Close toggle
- [x] Special hours CRUD
- [x] Form validation
- [x] Responsive design
- [x] Save functionality
- [x] Toast notifications

---

## 📚 Resources

- [Heroicons](https://heroicons.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Sonner Toast](https://sonner.emilkowal.ski/)

---

**Bonne chance! Tu peux le faire! 🚀**

**Deadline:** 17 Ekim, 12:00  
**Priority:** 🟡 HIGH

---

**Hazırlayan:** Manus AI  
**Sprint:** 3 (Gün 1/14)

