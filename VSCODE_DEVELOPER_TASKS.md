# VS Code Developer - Sprint 3 Görevleri
**Sprint:** 16-29 Ekim 2025 (2 hafta)  
**Rol:** Frontend Developer + UI/UX  
**Workload:** 25% (20 saat)  
**Koordinatör:** Manus AI

---

## 👋 Hoş Geldin!

Bu dosya senin Sprint 3 görevlerini içeriyor. Toplam **3 task** ve **20 saat** iş yükün var. Sen frontend development ve UI/UX konusunda uzman olduğun için dashboard ve kullanıcı arayüzü görevleri sana atandı.

---

## 🎯 Senin Görevlerin

### ✅ Öncelik Sırası
1. **TASK-005:** Dashboard Layout ve Navigation (8h) - **18 Ekim'de başla**
2. **TASK-006:** Profil Düzenleme Frontend (6h) - **TASK-005'ten sonra**
3. **TASK-007:** Fotoğraf Upload Frontend (6h) - **TASK-006 ile paralel**

---

## 📋 TASK-005: Dashboard Layout ve Navigation

**Priority:** P0 (Critical)  
**Estimate:** 8 saat  
**Başlangıç:** 18 Ekim 2025, 09:00  
**Dependencies:** TASK-004 (Authentication - Claude AI yapacak)  
**Blocker:** TASK-004 tamamlanmalı

### Açıklama
Dashboard için layout ve navigation sistemi oluştur. Sidebar, topbar, responsive design.

### Acceptance Criteria
- [ ] Dashboard layout component
- [ ] Sidebar navigation (desktop)
- [ ] Mobile hamburger menu
- [ ] Top bar (user menu, logout)
- [ ] Breadcrumb navigation
- [ ] Active link highlighting
- [ ] Responsive (mobile, tablet, desktop)

### Teknik Detaylar

**1. Dependencies Yükle:**

```bash
npm install @headlessui/react @heroicons/react
```

**2. Dashboard Layout:**

Dosya: `src/app/dashboard/layout.tsx`

```typescript
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar user={session.user} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**3. Sidebar Component:**

Dosya: `src/components/dashboard/Sidebar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UserIcon, 
  PhotoIcon, 
  ChartBarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Mon Profil', href: '/dashboard/profile', icon: UserIcon },
  { name: 'Mes Photos', href: '/dashboard/photos', icon: PhotoIcon },
  { name: 'Horaires', href: '/dashboard/hours', icon: ClockIcon },
  { name: 'Avis', href: '/dashboard/reviews', icon: ChatBubbleLeftRightIcon },
  { name: 'Statistiques', href: '/dashboard/stats', icon: ChartBarIcon },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">
              Espace Pro
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition
                    ${isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-gray-500 text-center">
              © 2025 Haguenau.PRO
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar (TODO: Add mobile menu) */}
    </>
  );
}
```

**4. Topbar Component:**

Dosya: `src/components/dashboard/Topbar.tsx`

```typescript
'use client';

import { signOut } from 'next-auth/react';
import { Menu } from '@headlessui/react';
import { UserCircleIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function Topbar({ user }: { user: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6">
      {/* Mobile menu button */}
      <button 
        className="md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Bars3Icon className="w-6 h-6 text-gray-600" />
      </button>

      {/* Breadcrumb (optional) */}
      <div className="hidden md:block">
        <h2 className="text-lg font-semibold text-gray-800">
          Bienvenue, {user.name || 'Utilisateur'}
        </h2>
      </div>

      {/* User menu */}
      <div className="ml-auto">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition">
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium hidden md:block">{user.name}</span>
          </Menu.Button>

          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/dashboard/settings"
                  className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                >
                  ⚙️ Paramètres
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/dashboard/profile"
                  className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                >
                  👤 Mon Profil
                </a>
              )}
            </Menu.Item>
            <div className="border-t my-1"></div>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${active ? 'bg-gray-100' : ''}`}
                >
                  🚪 Déconnexion
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </header>
  );
}
```

**5. Dashboard Overview Page:**

Dosya: `src/app/dashboard/page.tsx`

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Get user's companies
  const ownerships = await prisma.companyOwnership.findMany({
    where: { ownerId: session!.user.id },
    include: {
      company: {
        include: {
          _count: {
            select: { reviews: true, photos: true }
          }
        }
      }
    }
  });

  const company = ownerships[0]?.company;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Vues du profil</p>
              <p className="text-3xl font-bold mt-2">245</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              👁️
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+12% ce mois</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avis</p>
              <p className="text-3xl font-bold mt-2">{company?._count.reviews || 0}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              ⭐
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Note moyenne: 4.7/5</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Photos</p>
              <p className="text-3xl font-bold mt-2">{company?._count.photos || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              📸
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Galerie complète</p>
        </div>
      </div>

      {/* Company info */}
      {company && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Mon Entreprise</h2>
          <div className="flex items-start space-x-4">
            <div className="bg-gray-200 w-20 h-20 rounded-lg flex items-center justify-center text-3xl">
              🏢
            </div>
            <div>
              <h3 className="font-semibold text-lg">{company.name}</h3>
              <p className="text-gray-600">{company.address}</p>
              <p className="text-gray-600">{company.postalCode} {company.city}</p>
              <div className="mt-2 flex space-x-4">
                <a href={`tel:${company.phone}`} className="text-blue-600 text-sm">
                  📞 {company.phone}
                </a>
                {company.website && (
                  <a href={company.website} target="_blank" className="text-blue-600 text-sm">
                    🌐 Site web
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Testing Checklist
- [ ] Layout renders correctly
- [ ] Sidebar navigation works
- [ ] Active link highlighting
- [ ] User menu dropdown
- [ ] Logout functionality
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Protected route (redirect if not logged in)

### Çıktı
- ✅ Dashboard layout component
- ✅ Sidebar navigation
- ✅ Topbar with user menu
- ✅ Overview page

---

## 📋 TASK-006: Profil Düzenleme Frontend

**Priority:** P1 (High)  
**Estimate:** 6 saat  
**Başlangıç:** 20 Ekim 2025, 09:00  
**Dependencies:** TASK-005  
**Partner:** Manus AI (Backend API)

### Açıklama
İşletme profilini düzenlemek için form sayfası. Tüm bilgileri güncelleyebilme.

### Acceptance Criteria
- [ ] Profil formu UI tamamlandı
- [ ] Form validation (Zod + React Hook Form)
- [ ] Loading states
- [ ] Success/error feedback
- [ ] Responsive design
- [ ] API entegrasyonu

### Teknik Detaylar

**1. Dependencies Yükle:**

```bash
npm install react-hook-form @hookform/resolvers zod
```

**2. Profil Düzenleme Sayfası:**

Dosya: `src/app/dashboard/profile/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  description: z.string().min(10, 'Description trop courte'),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  phone: z.string().regex(/^0[1-9]\d{8}$/, 'Téléphone invalide'),
  email: z.string().email('Email invalide'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    // Fetch company data
    fetch('/api/dashboard/profile')
      .then(res => res.json())
      .then(data => {
        reset(data);
      });
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setSuccess(false);
    
    const response = await fetch('/api/dashboard/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (response.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          ✅ Profil mis à jour avec succès!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Informations de base */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Informations de base</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                {...register('name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <input
                {...register('city')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez votre entreprise..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                {...register('address')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal *
              </label>
              <input
                {...register('postalCode')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="67000"
              />
              {errors.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Coordonnées</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0612345678"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web
              </label>
              <input
                {...register('website')}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.exemple.fr"
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Réseaux sociaux</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                {...register('facebook')}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://facebook.com/votre-page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                {...register('instagram')}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://instagram.com/votre-compte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                {...register('linkedin')}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/company/votre-entreprise"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

### Testing Checklist
- [ ] Form renders correctly
- [ ] Validation works (all fields)
- [ ] API call successful
- [ ] Success message shows
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design

### Çıktı
- ✅ Profil edit form
- ✅ Validation logic
- ✅ API integration

---

## 📋 TASK-007: Fotoğraf Upload Frontend

**Priority:** P1 (High)  
**Estimate:** 6 saat  
**Başlangıç:** 20 Ekim 2025, 14:00  
**Dependencies:** TASK-005  
**Partner:** Manus AI (Backend API)

### Açıklama
Drag & drop fotoğraf yükleme UI. Photo grid, sortable, delete functionality.

### Acceptance Criteria
- [ ] Drag & drop upload UI
- [ ] Image preview
- [ ] Progress bar
- [ ] Photo grid (sortable)
- [ ] Delete confirmation modal
- [ ] Set primary photo
- [ ] Responsive design

### Teknik Detaylar

**1. Dependencies Yükle:**

```bash
npm install react-dropzone @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**2. Photos Page:**

Dosya: `src/app/dashboard/photos/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  order: number;
}

function SortablePhoto({ photo, onDelete }: { photo: Photo; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group cursor-move"
    >
      <img
        src={photo.thumbnail}
        alt=""
        className="w-full h-48 object-cover rounded-lg"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition rounded-lg"></div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(photo.id);
        }}
        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
      >
        🗑️
      </button>
      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition">
        ✋ Glisser pour réorganiser
      </div>
    </div>
  );
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const response = await fetch('/api/dashboard/photos');
    const data = await response.json();
    setPhotos(data);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/dashboard/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newPhoto = await response.json();
        setPhotos(prev => [...prev, newPhoto]);
      }

      setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex(p => p.id === active.id);
      const newIndex = photos.findIndex(p => p.id === over.id);

      const newPhotos = arrayMove(photos, oldIndex, newIndex).map((photo, index) => ({
        ...photo,
        order: index
      }));

      setPhotos(newPhotos);

      // Update server
      await fetch('/api/dashboard/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: newPhotos.map(p => ({ id: p.id, order: p.order }))
        }),
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette photo?')) return;

    const response = await fetch(`/api/dashboard/photos?id=${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setPhotos(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Mes Photos</h1>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center mb-8 transition
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:bg-gray-50'}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        {uploading ? (
          <div>
            <p className="text-lg mb-4">Téléchargement en cours...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{Math.round(uploadProgress)}%</p>
          </div>
        ) : isDragActive ? (
          <div>
            <p className="text-lg text-blue-600">📸 Déposez les fichiers ici...</p>
          </div>
        ) : (
          <div>
            <div className="text-6xl mb-4">📸</div>
            <p className="text-lg mb-2 font-semibold">Glissez-déposez des photos ici</p>
            <p className="text-sm text-gray-500">ou cliquez pour sélectionner</p>
            <p className="text-xs text-gray-400 mt-2">Max 5MB par fichier • PNG, JPG, JPEG, WEBP</p>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Galerie ({photos.length} photo{photos.length > 1 ? 's' : ''})
          </h2>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <SortablePhoto
                    key={photo.id}
                    photo={photo}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-lg">Aucune photo</p>
          <p className="text-sm">Téléchargez votre première photo ci-dessus!</p>
        </div>
      )}
    </div>
  );
}
```

### Testing Checklist
- [ ] Drag & drop works
- [ ] File upload successful
- [ ] Progress bar shows
- [ ] Photo grid displays
- [ ] Reorder (drag & drop) works
- [ ] Delete confirmation
- [ ] Error handling (file too large)
- [ ] Responsive design

### Çıktı
- ✅ Drag & drop upload UI
- ✅ Photo grid with sortable
- ✅ Delete functionality

---

## 📊 Senin Sprint 3 Özeti

### Toplam İş Yükü
- **3 task**
- **20 saat**
- **25% sprint capacity**

### Timeline
- **18 Ekim:** TASK-005 (Dashboard Layout)
- **20 Ekim:** TASK-006 (Profil) + TASK-007 (Photos)

### Bağımlılıklar
- TASK-005 → TASK-004'e bağımlı (Claude AI yapacak)
- TASK-006 → TASK-005'e bağımlı
- TASK-007 → TASK-005'e bağımlı

### Koordinasyon
- **Claude AI:** TASK-004 yapacak (Authentication)
- **Manus AI:** TASK-006, TASK-007 için backend API yapacak

---

## 📞 İletişim

### Daily Standup
**Her gün saat 10:00 (GitHub Discussions)**

Format:
```markdown
### Dün:
- ✅ Tamamladığım işler

### Bugün:
- 🔄 Yapacağım işler

### Blocker:
- ⚠️ Varsa engeller
```

### Code Review
- Pull Request aç
- `@manus-ai` mention et
- Review bekle (max 4 saat)

---

## 🎯 Başarı Kriterleri

### Sprint Sonunda
- [ ] 3/3 task tamamlandı
- [ ] Tüm sayfalar responsive
- [ ] UI/UX kaliteli
- [ ] Production'da çalışıyor

### Kalite Standartları
- [ ] TypeScript errors yok
- [ ] Tailwind CSS kullanıldı
- [ ] Accessibility (a11y) standartları
- [ ] Loading states mevcut
- [ ] Error handling

---

## 🚀 Hadi Başlayalım!

**İlk Görevin:** TASK-005 (Dashboard Layout)  
**Başlangıç:** 18 Ekim 2025, 09:00  
**Süre:** 8 saat

**Adımlar:**
1. Dependencies yükle
2. Layout component oluştur
3. Sidebar component
4. Topbar component
5. Overview page
6. Test et
7. PR aç

**Başarılar! 🎉**

---

**Hazırlayan:** Manus AI (Proje Yöneticisi)  
**Tarih:** 15 Ekim 2025  
**Sprint:** 3 (16-29 Ekim 2025)

