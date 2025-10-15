# VS Code Developer - Yeni Görevler (Sprint 3 - Gün 1)

**Tarih:** 15 Ekim 2025, 18:45 GMT+2  
**Sprint:** 3 (Gün 1/14)  
**Assigned:** VS Code Developer  
**Priority:** HIGH

---

## 📋 Görev Özeti

Security & Testing infrastructure'ı başarıyla tamamladın! 🎉

Şimdi iki kritik frontend görevi var:
1. **Business Dashboard Layout** (TASK-005)
2. **Profil Düzenleme UI** (TASK-006)

---

## 🎯 GÖREV 1: Business Dashboard Layout (TASK-005)

### Görev Detayı

İşletme sahipleri için modern, responsive dashboard layout oluştur.

**Hedef:** `/business/dashboard` route'u için tam fonksiyonel layout

---

### 📐 Design Requirements

#### Layout Structure

```
┌─────────────────────────────────────────────────┐
│  Topbar (Logo, User Menu, Notifications)       │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │  Main Content Area                   │
│          │                                      │
│ - Home   │  [Dynamic Content]                   │
│ - Profil │                                      │
│ - Photos │                                      │
│ - Hours  │                                      │
│ - Reviews│                                      │
│ - Stats  │                                      │
│          │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

---

### 🎨 Component Structure

#### 1. Dashboard Layout Component

**Dosya:** `src/app/business/dashboard/layout.tsx`

```typescript
import { Sidebar } from '@/components/business/Sidebar';
import { Topbar } from '@/components/business/Topbar';

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <Topbar />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

#### 2. Sidebar Component

**Dosya:** `src/components/business/Sidebar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UserIcon, 
  PhotoIcon, 
  ClockIcon, 
  StarIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Aperçu', href: '/business/dashboard', icon: HomeIcon },
  { name: 'Mon Profil', href: '/business/dashboard/profile', icon: UserIcon },
  { name: 'Photos', href: '/business/dashboard/photos', icon: PhotoIcon },
  { name: 'Horaires', href: '/business/dashboard/hours', icon: ClockIcon },
  { name: 'Avis', href: '/business/dashboard/reviews', icon: StarIcon },
  { name: 'Statistiques', href: '/business/dashboard/analytics', icon: ChartBarIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r border-gray-200">
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg
                transition-colors duration-200
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
    </aside>
  );
}
```

---

#### 3. Topbar Component

**Dosya:** `src/components/business/Topbar.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

export function Topbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <button
            className="lg:hidden mr-4"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <Link href="/business/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">
              Business Dashboard
            </span>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.[0] || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium">
                {session?.user?.name || 'User'}
              </span>
            </Menu.Button>

            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/business/dashboard/profile"
                      className={`block px-4 py-2 text-sm ${active ? 'bg-gray-50' : ''}`}
                    >
                      Mon Profil
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/business/dashboard/settings"
                      className={`block px-4 py-2 text-sm ${active ? 'bg-gray-50' : ''}`}
                    >
                      Paramètres
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${active ? 'bg-gray-50' : ''}`}
                    >
                      Déconnexion
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          {/* Mobile navigation items */}
        </div>
      )}
    </header>
  );
}
```

---

#### 4. Dashboard Overview Page

**Dosya:** `src/app/business/dashboard/page.tsx`

```typescript
import { StatsCard } from '@/components/business/StatsCard';
import { RecentReviews } from '@/components/business/RecentReviews';
import { QuickActions } from '@/components/business/QuickActions';

export default async function BusinessDashboardPage() {
  // Fetch user's company data
  const companyData = await getCompanyData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Aperçu
        </h1>
        <p className="mt-2 text-gray-600">
          Bienvenue sur votre tableau de bord professionnel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Vues totales"
          value={companyData.totalViews}
          change="+12%"
          trend="up"
        />
        <StatsCard
          title="Avis"
          value={companyData.totalReviews}
          change="+3"
          trend="up"
        />
        <StatsCard
          title="Note moyenne"
          value={companyData.averageRating}
          suffix="/5"
        />
        <StatsCard
          title="Clics"
          value={companyData.totalClicks}
          change="+8%"
          trend="up"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Reviews */}
      <RecentReviews reviews={companyData.recentReviews} />
    </div>
  );
}
```

---

### 📦 Required Dependencies

```bash
# Install Headless UI for dropdowns/menus
npm install @headlessui/react

# Install Heroicons for icons
npm install @heroicons/react
```

---

### 🎨 Styling Guidelines

#### Colors
```css
/* Primary */
--blue-50: #eff6ff
--blue-600: #2563eb
--blue-700: #1d4ed8

/* Gray */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-600: #4b5563
--gray-900: #111827
```

#### Responsive Breakpoints
```css
/* Mobile first */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

---

## 🎯 GÖREV 2: Profil Düzenleme UI (TASK-006)

### Görev Detayı

İşletme profil düzenleme formu oluştur.

**Hedef:** `/business/dashboard/profile` sayfası

---

### 📝 Form Fields

```typescript
interface CompanyProfileForm {
  // Basic Info
  name: string;
  description: string;
  category: string;
  
  // Contact
  email: string;
  phone: string;
  website?: string;
  
  // Address
  address: string;
  city: string;
  postalCode: string;
  
  // Location
  latitude: number;
  longitude: number;
}
```

---

### 🎨 Profile Edit Page

**Dosya:** `src/app/business/dashboard/profile/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().min(5, 'Adresse invalide'),
  city: z.string().min(2, 'Ville invalide'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileEditPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Update failed');

      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Modifier mon profil
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entreprise *
              </label>
              <input
                {...register('name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="NETZ Informatique"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez votre entreprise..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <input
                {...register('website')}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

### 📦 Additional Dependencies

```bash
# Toast notifications
npm install sonner

# Form validation
npm install react-hook-form @hookform/resolvers zod
```

---

## 🧪 Testing Checklist

### Dashboard Layout
- [ ] Sidebar navigation çalışıyor
- [ ] Active link highlighting doğru
- [ ] Mobile menu açılıyor/kapanıyor
- [ ] User dropdown çalışıyor
- [ ] Logout fonksiyonu çalışıyor
- [ ] Responsive (mobile, tablet, desktop)

### Profile Edit
- [ ] Form validation çalışıyor
- [ ] Error messages gösteriliyor
- [ ] Submit başarılı
- [ ] Toast notifications gösteriliyor
- [ ] Loading state çalışıyor
- [ ] Cancel button çalışıyor

---

## 📝 Git Commit

```bash
git add src/app/business/dashboard/
git add src/components/business/
git commit -m "feat: business dashboard layout and profile edit UI

TASK-005: Dashboard Layout
- Sidebar navigation with active states
- Topbar with user menu and notifications
- Responsive mobile menu
- Dashboard overview page with stats

TASK-006: Profile Edit UI
- Form with validation (Zod)
- React Hook Form integration
- Toast notifications (Sonner)
- Responsive design

Dependencies:
- @headlessui/react
- @heroicons/react
- react-hook-form
- @hookform/resolvers
- sonner

Status: ✅ UI Complete, Ready for API integration"

git push
```

---

## 🎯 Success Criteria

### TASK-005 (Dashboard Layout)
- [x] Layout component oluşturuldu
- [x] Sidebar navigation çalışıyor
- [x] Topbar user menu çalışıyor
- [x] Mobile responsive
- [x] Overview page stats gösteriyor

### TASK-006 (Profile Edit)
- [x] Form validation çalışıyor
- [x] Error handling mevcut
- [x] Loading states implemented
- [x] Toast notifications çalışıyor
- [x] Responsive design

---

## 📚 Referanslar

- [Headless UI Documentation](https://headlessui.com/)
- [Heroicons](https://heroicons.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Sonner Toast](https://sonner.emilkowal.ski/)

---

## 🆘 Sorun Yaşarsan

### Hata: "Module not found: @headlessui/react"
```bash
npm install @headlessui/react @heroicons/react
```

### Hata: "useSession() must be wrapped in SessionProvider"
```typescript
// app/business/layout.tsx
import { SessionProvider } from 'next-auth/react';

export default function BusinessLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### Hata: "Hydration mismatch"
```typescript
// Use 'use client' directive
'use client';
```

---

**İyi çalışmalar! UI harika olacak! 🎨**

**Tahmini Süre:** 6-8 saat (Her iki task)  
**Priority:** 🟡 HIGH  
**Deadline:** 17 Ekim, 18:00

---

**Hazırlayan:** Manus AI  
**Sprint:** 3 (Gün 1/14)  
**Status:** 🔄 READY TO START

