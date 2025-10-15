# Sprint 3 - Detailed Task Cards
**Multi-Tenant Directory Platform**  
**Sprint:** 16-29 Ekim 2025

---

## 🎴 Task Card Template

```markdown
# TASK-XXX: [Title]

**Priority:** P0/P1/P2  
**Assignee:** [Name]  
**Estimate:** X hours  
**Status:** Backlog/In Progress/Review/Done  
**Dependencies:** TASK-XXX, TASK-YYY

## Description
[Detailed description]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Details
[Implementation notes]

## Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Resources
- [Link to docs]
- [Link to design]
```

---

# 🔴 P0 - Critical Priority

## TASK-001: Yorumları Aktif Et

**Priority:** P0  
**Assignee:** Manus AI  
**Estimate:** 4 hours  
**Status:** Ready to Start  
**Dependencies:** None

### Description
Mevcut seed reviews'leri onaylayıp aktif hale getir. Ana sayfada ve şirket detay sayfalarında yorumların görünmesini sağla.

### Acceptance Criteria
- [ ] 5 seed review onaylandı (isApproved = true)
- [ ] Ana sayfada "50 Avis Clients" görünüyor (seed + test yorumları)
- [ ] Şirket detay sayfasında yorumlar listeleniyor
- [ ] Rating hesaplaması doğru çalışıyor
- [ ] Ortalama rating ana sayfada görünüyor

### Technical Details

**1. Database Update:**
```sql
-- Seed reviews'leri onayla
UPDATE reviews 
SET "isApproved" = true 
WHERE id IN (
  SELECT id FROM reviews 
  WHERE "isApproved" = false 
  LIMIT 5
);
```

**2. Review Query Update:**
```typescript
// src/lib/queries/review.ts
export async function getApprovedReviews(companyId: string) {
  return await prisma.review.findMany({
    where: {
      companyId,
      isApproved: true  // ✅ Sadece onaylı yorumlar
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    }
  });
}
```

**3. Homepage Stats Update:**
```typescript
// src/app/page.tsx
const totalReviews = await prisma.review.count({
  where: { isApproved: true }  // ✅ Sadece onaylı yorumlar
});

const avgRating = await prisma.review.aggregate({
  where: { isApproved: true },
  _avg: { rating: true }
});
```

### Testing
- [ ] Unit test: `getApprovedReviews()` fonksiyonu
- [ ] Integration test: Homepage stats
- [ ] Manual test: Ana sayfa, şirket detay sayfası
- [ ] Test all domains: haguenau.pro, mutzig.pro

### Resources
- Database: Neon dashboard
- Prisma Studio: `npx prisma studio`
- File: `src/lib/queries/review.ts`

---

## TASK-002: Google Maps API Düzeltmesi

**Priority:** P0  
**Assignee:** Manus AI  
**Estimate:** 6 hours  
**Status:** Ready to Start  
**Dependencies:** None

### Description
Google Maps entegrasyonunu düzelt. Şirket detay sayfasında interaktif harita göster, "Yol tarifi al" butonu ekle.

### Acceptance Criteria
- [ ] Google Maps API key çalışıyor
- [ ] Tüm domainlerde harita görünüyor (21+ domain)
- [ ] Harita interaktif (zoom, pan, marker)
- [ ] "Get Directions" butonu Google Maps'e yönlendiriyor
- [ ] Geocoding çalışıyor (adres → lat/lng)
- [ ] Mobil responsive

### Technical Details

**1. Environment Variables:**
```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

**2. Vercel Environment Variables:**
- Vercel Dashboard → Settings → Environment Variables
- Add: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Scope: Production, Preview, Development

**3. Google Cloud Console:**
- Enable APIs:
  - Maps JavaScript API
  - Geocoding API
- API Restrictions:
  - HTTP referrers: `*.haguenau.pro/*`, `*.mutzig.pro/*`, etc.
  - Or: None (for testing)

**4. Map Component:**
```typescript
// src/components/GoogleMap.tsx
'use client';

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface MapProps {
  lat: number;
  lng: number;
  companyName: string;
}

export default function Map({ lat, lng, companyName }: MapProps) {
  const mapStyles = {
    height: "400px",
    width: "100%"
  };

  const defaultCenter = {
    lat,
    lng
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={15}
        center={defaultCenter}
      >
        <Marker position={defaultCenter} title={companyName} />
      </GoogleMap>
    </LoadScript>
  );
}
```

**5. Geocoding Service:**
```typescript
// src/lib/geocoding.ts
export async function geocodeAddress(address: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  
  const data = await response.json();
  
  if (data.results[0]) {
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  }
  
  return null;
}
```

**6. Directions Button:**
```typescript
<a
  href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
  target="_blank"
  rel="noopener noreferrer"
  className="btn btn-primary"
>
  📍 Obtenir l'itinéraire
</a>
```

### Testing
- [ ] Unit test: Geocoding service
- [ ] Integration test: Map component renders
- [ ] Manual test: All domains (21+)
- [ ] Mobile test: Responsive, touch gestures
- [ ] API quota check: Google Cloud Console

### Resources
- Google Cloud Console: https://console.cloud.google.com
- React Google Maps: https://react-google-maps-api-docs.netlify.app
- Vercel Env Vars: https://vercel.com/docs/environment-variables

---

## TASK-003: Database Schema Genişletme

**Priority:** P0  
**Assignee:** Claude AI  
**Estimate:** 8 hours  
**Status:** Ready to Start  
**Dependencies:** None

### Description
Dashboard ve yeni özellikler için gerekli database tablolarını oluştur. Prisma schema'yı genişlet ve migration'ları hazırla.

### Acceptance Criteria
- [ ] `BusinessOwner` tablosu oluşturuldu
- [ ] `CompanyOwnership` tablosu oluşturuldu
- [ ] `Photo` tablosu oluşturuldu
- [ ] `BusinessHours` tablosu oluşturuldu
- [ ] `CompanyAnalytics` tablosu oluşturuldu
- [ ] Prisma migration başarılı
- [ ] Seed data hazır
- [ ] ER diagram güncellendi

### Technical Details

**1. Prisma Schema:**
```prisma
// prisma/schema.prisma

model BusinessOwner {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // Hashed with bcrypt
  firstName     String?
  lastName      String?
  phone         String?
  emailVerified DateTime?
  phoneVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  companies     CompanyOwnership[]
  
  @@map("business_owners")
}

model CompanyOwnership {
  id          String   @id @default(cuid())
  companyId   String
  ownerId     String
  role        String   @default("owner") // owner, manager, editor
  verified    Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  owner       BusinessOwner @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  
  @@unique([companyId, ownerId])
  @@index([ownerId])
  @@map("company_ownerships")
}

model Photo {
  id          String   @id @default(cuid())
  companyId   String
  url         String   // Vercel Blob URL
  thumbnail   String?  // Thumbnail URL
  caption     String?
  order       Int      @default(0)
  type        String   @default("gallery") // logo, cover, gallery, interior, product
  isPrimary   Boolean  @default(false)
  uploadedBy  String?  // BusinessOwner ID
  createdAt   DateTime @default(now())
  
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@index([companyId, order])
  @@map("photos")
}

model BusinessHours {
  id          String   @id @default(cuid())
  companyId   String   @unique
  
  // Weekly hours (JSON format)
  monday      Json?    // { open: "09:00", close: "18:00", closed: false }
  tuesday     Json?
  wednesday   Json?
  thursday    Json?
  friday      Json?
  saturday    Json?
  sunday      Json?
  
  // Special hours (holidays, etc.)
  specialHours Json?   // [{ date: "2025-12-25", closed: true, note: "Noël" }]
  
  timezone    String   @default("Europe/Paris")
  updatedAt   DateTime @updatedAt
  
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@map("business_hours")
}

model CompanyAnalytics {
  id              String   @id @default(cuid())
  companyId       String
  date            DateTime @default(now()) @db.Date
  
  // View metrics
  profileViews    Int      @default(0)
  uniqueVisitors  Int      @default(0)
  
  // Click metrics
  phoneClicks     Int      @default(0)
  websiteClicks   Int      @default(0)
  emailClicks     Int      @default(0)
  directionsClicks Int     @default(0)
  
  // Source metrics
  sourceOrganic   Int      @default(0)
  sourceSearch    Int      @default(0)
  sourceDirect    Int      @default(0)
  sourceReferral  Int      @default(0)
  
  company         Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@unique([companyId, date])
  @@index([companyId, date])
  @@map("company_analytics")
}

// Update Company model
model Company {
  // ... existing fields
  
  // New relations
  ownerships    CompanyOwnership[]
  photos        Photo[]
  businessHours BusinessHours?
  analytics     CompanyAnalytics[]
}
```

**2. Migration Commands:**
```bash
# Create migration
npx prisma migrate dev --name add_dashboard_tables

# Apply to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

**3. Seed Data:**
```typescript
// prisma/seed-dashboard.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test business owner
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const owner = await prisma.businessOwner.create({
    data: {
      email: 'owner@netzinformatique.fr',
      password: hashedPassword,
      firstName: 'Mikail',
      lastName: 'Lekesiz',
      emailVerified: new Date(),
    }
  });
  
  // Link to NETZ Informatique
  const company = await prisma.company.findFirst({
    where: { slug: 'netz-informatique' }
  });
  
  if (company) {
    await prisma.companyOwnership.create({
      data: {
        companyId: company.id,
        ownerId: owner.id,
        role: 'owner',
        verified: true
      }
    });
    
    // Add business hours
    await prisma.businessHours.create({
      data: {
        companyId: company.id,
        monday: { open: "09:00", close: "18:00", closed: false },
        tuesday: { open: "09:00", close: "18:00", closed: false },
        wednesday: { open: "09:00", close: "18:00", closed: false },
        thursday: { open: "09:00", close: "18:00", closed: false },
        friday: { open: "09:00", close: "18:00", closed: false },
        saturday: { closed: true },
        sunday: { closed: true },
      }
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Testing
- [ ] Migration runs successfully
- [ ] Seed data populates correctly
- [ ] Prisma Studio: Verify tables
- [ ] Foreign keys work
- [ ] Indexes created

### Resources
- Prisma Docs: https://www.prisma.io/docs
- Neon Dashboard: https://console.neon.tech
- ER Diagram Tool: https://dbdiagram.io

---

## TASK-004: Authentication System (NextAuth.js)

**Priority:** P0  
**Assignee:** Claude AI  
**Estimate:** 10 hours  
**Status:** Waiting (Dependency: TASK-003)  
**Dependencies:** TASK-003

### Description
NextAuth.js ile authentication sistemi kur. Email/password ile login, JWT session, protected routes.

### Acceptance Criteria
- [ ] NextAuth.js konfigüre edildi
- [ ] Credentials provider çalışıyor
- [ ] Login sayfası (/auth/login)
- [ ] Register sayfası (/auth/register)
- [ ] JWT session strategy
- [ ] Protected routes middleware
- [ ] Logout fonksiyonu
- [ ] Session persist (cookie)

### Technical Details

**1. Install Dependencies:**
```bash
npm install next-auth @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

**2. NextAuth Configuration:**
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const owner = await prisma.businessOwner.findUnique({
          where: { email: credentials.email }
        });

        if (!owner) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          owner.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: owner.id,
          email: owner.email,
          name: `${owner.firstName} ${owner.lastName}`,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**3. Middleware (Protected Routes):**
```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/login',
  },
});

export const config = {
  matcher: ['/dashboard/:path*']
};
```

**4. Login Page:**
```typescript
// src/app/auth/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Email ou mot de passe incorrect');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Connexion</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Se connecter
        </button>
        
        <p className="mt-4 text-center">
          Pas encore de compte?{' '}
          <a href="/auth/register" className="text-blue-600">
            S'inscrire
          </a>
        </p>
      </form>
    </div>
  );
}
```

**5. Register Page:**
```typescript
// src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      router.push('/auth/login?registered=true');
    } else {
      const data = await response.json();
      setError(data.error || 'Une erreur est survenue');
    }
  };

  return (
    // Similar form structure as login
  );
}
```

**6. Register API:**
```typescript
// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { email, password, firstName, lastName } = await request.json();

  // Validation
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email et mot de passe requis' },
      { status: 400 }
    );
  }

  // Check if user exists
  const existing = await prisma.businessOwner.findUnique({
    where: { email }
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Cet email est déjà utilisé' },
      { status: 400 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const owner = await prisma.businessOwner.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    }
  });

  return NextResponse.json({ success: true, id: owner.id });
}
```

### Testing
- [ ] Unit test: Password hashing
- [ ] Integration test: Login flow
- [ ] Integration test: Register flow
- [ ] Manual test: Login → Dashboard
- [ ] Manual test: Protected routes redirect
- [ ] Manual test: Logout

### Resources
- NextAuth.js Docs: https://next-auth.js.org
- Prisma Adapter: https://authjs.dev/reference/adapter/prisma
- bcryptjs: https://www.npmjs.com/package/bcryptjs

---

## TASK-005: Dashboard Layout ve Navigation

**Priority:** P0  
**Assignee:** VS Code Developer  
**Estimate:** 8 hours  
**Status:** Waiting (Dependency: TASK-004)  
**Dependencies:** TASK-004

### Description
Dashboard için layout ve navigation sistemi oluştur. Sidebar, topbar, responsive design.

### Acceptance Criteria
- [ ] Dashboard layout component
- [ ] Sidebar navigation (desktop)
- [ ] Mobile hamburger menu
- [ ] Top bar (user menu, logout)
- [ ] Breadcrumb navigation
- [ ] Active link highlighting
- [ ] Responsive (mobile, tablet, desktop)

### Technical Details

**1. Dashboard Layout:**
```typescript
// src/app/dashboard/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.Node;
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

**2. Sidebar Component:**
```typescript
// src/components/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UserIcon, 
  PhotoIcon, 
  ChartBarIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Mon Profil', href: '/dashboard/profile', icon: UserIcon },
  { name: 'Mes Photos', href: '/dashboard/photos', icon: PhotoIcon },
  { name: 'Statistiques', href: '/dashboard/stats', icon: ChartBarIcon },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
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
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg
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
      </div>
    </div>
  );
}
```

**3. Topbar Component:**
```typescript
// src/components/dashboard/Topbar.tsx
'use client';

import { signOut } from 'next-auth/react';
import { Menu } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/solid';

export default function Topbar({ user }: { user: any }) {
  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6">
      {/* Mobile menu button */}
      <button className="md:hidden">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* User menu */}
      <div className="ml-auto">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-2">
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium">{user.name}</span>
          </Menu.Button>

          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/dashboard/settings"
                  className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                >
                  Paramètres
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut()}
                  className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                >
                  Déconnexion
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

**4. Dashboard Overview Page:**
```typescript
// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Get user's companies
  const ownerships = await prisma.companyOwnership.findMany({
    where: { ownerId: session.user.id },
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Mes Entreprises</h3>
          <p className="text-3xl font-bold">{ownerships.length}</p>
        </div>
        {/* More stats... */}
      </div>

      {/* Companies list */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold p-6 border-b">
          Mes Entreprises
        </h2>
        <div className="p-6">
          {ownerships.map(({ company }) => (
            <div key={company.id} className="mb-4 p-4 border rounded">
              <h3 className="font-semibold">{company.name}</h3>
              <p className="text-sm text-gray-600">{company.city}</p>
              <div className="mt-2 flex space-x-4 text-sm">
                <span>{company._count.reviews} avis</span>
                <span>{company._count.photos} photos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Testing
- [ ] Visual test: Layout renders correctly
- [ ] Responsive test: Mobile, tablet, desktop
- [ ] Navigation test: All links work
- [ ] Active link highlighting
- [ ] User menu dropdown
- [ ] Logout functionality

### Resources
- Tailwind CSS: https://tailwindcss.com
- Heroicons: https://heroicons.com
- Headless UI: https://headlessui.com

---

# 🟡 P1 - High Priority

## TASK-006: Profil Düzenleme Sayfası

**Priority:** P1  
**Assignee:** VS Code Developer (Frontend) + Manus AI (Backend)  
**Estimate:** 10 hours (6h frontend + 4h backend)  
**Status:** Waiting (Dependency: TASK-005)  
**Dependencies:** TASK-005

### Description
İşletme profilini düzenlemek için form sayfası. Tüm bilgileri güncelleyebilme.

### Acceptance Criteria
- [ ] Profil formu UI tamamlandı
- [ ] Form validation (Zod)
- [ ] API endpoint çalışıyor
- [ ] Değişiklikler kaydediliyor
- [ ] Success/error feedback
- [ ] Loading states
- [ ] Responsive design

### Technical Details

**Frontend (VS Code Developer):**

```typescript
// src/app/dashboard/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  description: z.string().min(10, 'Description trop courte'),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  phone: z.string().regex(/^0[1-9]\d{8}$/, 'Téléphone invalide'),
  email: z.string().email('Email invalide'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  categories: z.array(z.string()).min(1, 'Au moins une catégorie'),
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);

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
        setCompany(data);
        reset(data);
      });
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    
    const response = await fetch('/api/dashboard/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert('Profil mis à jour avec succès!');
    } else {
      alert('Erreur lors de la mise à jour');
    }
    
    setLoading(false);
  };

  if (!company) return <div>Chargement...</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Informations de base</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom de l'entreprise *
              </label>
              <input
                {...register('name')}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ville *
              </label>
              <input
                {...register('city')}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Coordonnées</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Téléphone *
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Site web
              </label>
              <input
                {...register('website')}
                type="url"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="https://..."
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Réseaux sociaux</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Facebook
              </label>
              <input
                {...register('facebook')}
                type="url"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Instagram
              </label>
              <input
                {...register('instagram')}
                type="url"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                LinkedIn
              </label>
              <input
                {...register('linkedin')}
                type="url"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Backend (Manus AI):**

```typescript
// src/app/api/dashboard/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().regex(/^\d{5}$/),
  phone: z.string().regex(/^0[1-9]\d{8}$/),
  email: z.string().email(),
  website: z.string().url().optional().or(z.literal('')),
  categories: z.array(z.string()).min(1),
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
});

// GET - Fetch profile
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's first company
  const ownership = await prisma.companyOwnership.findFirst({
    where: { ownerId: session.user.id },
    include: { company: true }
  });

  if (!ownership) {
    return NextResponse.json({ error: 'No company found' }, { status: 404 });
  }

  return NextResponse.json(ownership.company);
}

// PUT - Update profile
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  // Validate
  const result = profileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error },
      { status: 400 }
    );
  }

  // Get user's company
  const ownership = await prisma.companyOwnership.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!ownership) {
    return NextResponse.json({ error: 'No company found' }, { status: 404 });
  }

  // Update company
  const updated = await prisma.company.update({
    where: { id: ownership.companyId },
    data: result.data,
  });

  return NextResponse.json(updated);
}
```

### Testing
- [ ] Form validation (all fields)
- [ ] API endpoint (GET, PUT)
- [ ] Success/error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Data persistence

### Resources
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
- Tailwind Forms: https://github.com/tailwindlabs/tailwindcss-forms

---

## TASK-007: Fotoğraf Yükleme Sistemi

**Priority:** P1  
**Assignee:** Manus AI (Backend) + VS Code Developer (Frontend)  
**Estimate:** 12 hours (6h backend + 6h frontend)  
**Status:** Waiting (Dependency: TASK-003)  
**Dependencies:** TASK-003

### Description
Drag & drop fotoğraf yükleme sistemi. Vercel Blob storage, thumbnail generation, galeri yönetimi.

### Acceptance Criteria
- [ ] Vercel Blob storage setup
- [ ] Upload API endpoint
- [ ] Image optimization (sharp)
- [ ] Thumbnail generation
- [ ] Drag & drop UI
- [ ] Photo grid (sortable)
- [ ] Delete functionality
- [ ] Set primary photo
- [ ] Lightbox galeri (frontend)

### Technical Details

**Backend (Manus AI):**

**1. Install Dependencies:**
```bash
npm install @vercel/blob sharp
```

**2. Upload API:**
```typescript
// src/app/api/dashboard/photos/upload/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  // Get user's company
  const ownership = await prisma.companyOwnership.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!ownership) {
    return NextResponse.json({ error: 'No company found' }, { status: 404 });
  }

  // Convert to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Optimize image
  const optimized = await sharp(buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Generate thumbnail
  const thumbnail = await sharp(buffer)
    .resize(400, 300, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Upload to Vercel Blob
  const filename = `${ownership.companyId}/${Date.now()}-${file.name}`;
  const thumbnailFilename = `${ownership.companyId}/thumbnails/${Date.now()}-${file.name}`;

  const [blobResult, thumbnailResult] = await Promise.all([
    put(filename, optimized, { access: 'public' }),
    put(thumbnailFilename, thumbnail, { access: 'public' }),
  ]);

  // Save to database
  const photo = await prisma.photo.create({
    data: {
      companyId: ownership.companyId,
      url: blobResult.url,
      thumbnail: thumbnailResult.url,
      type: 'gallery',
      uploadedBy: session.user.id,
    }
  });

  return NextResponse.json(photo);
}
```

**3. Photo CRUD API:**
```typescript
// src/app/api/dashboard/photos/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET - List photos
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ownership = await prisma.companyOwnership.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!ownership) {
    return NextResponse.json({ error: 'No company found' }, { status: 404 });
  }

  const photos = await prisma.photo.findMany({
    where: { companyId: ownership.companyId },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(photos);
}

// DELETE - Delete photo
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get('id');

  if (!photoId) {
    return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });
  }

  // Verify ownership
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: {
      company: {
        include: {
          ownerships: {
            where: { ownerId: session.user.id }
          }
        }
      }
    }
  });

  if (!photo || photo.company.ownerships.length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Delete from database
  await prisma.photo.delete({
    where: { id: photoId }
  });

  // TODO: Delete from Vercel Blob (optional, costs money)

  return NextResponse.json({ success: true });
}

// PATCH - Update photo order
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { photos } = await request.json(); // [{ id, order }]

  // Update orders
  await Promise.all(
    photos.map((photo: { id: string; order: number }) =>
      prisma.photo.update({
        where: { id: photo.id },
        data: { order: photo.order }
      })
    )
  );

  return NextResponse.json({ success: true });
}
```

**Frontend (VS Code Developer):**

```typescript
// src/app/dashboard/photos/page.tsx
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
      <button
        onClick={() => onDelete(photo.id)}
        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
      >
        🗑️
      </button>
    </div>
  );
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);

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

    for (const file of acceptedFiles) {
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
    }

    setUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
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
          border-2 border-dashed rounded-lg p-12 text-center mb-8
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        {uploading ? (
          <p>Téléchargement en cours...</p>
        ) : isDragActive ? (
          <p>Déposez les fichiers ici...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">Glissez-déposez des photos ici</p>
            <p className="text-sm text-gray-500">ou cliquez pour sélectionner</p>
            <p className="text-xs text-gray-400 mt-2">Max 5MB par fichier</p>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 ? (
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
      ) : (
        <div className="text-center text-gray-500 py-12">
          Aucune photo. Téléchargez votre première photo!
        </div>
      )}
    </div>
  );
}
```

**3. Install Frontend Dependencies:**
```bash
npm install react-dropzone @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Testing
- [ ] Upload single file
- [ ] Upload multiple files
- [ ] Drag & drop
- [ ] Image optimization (check file size)
- [ ] Thumbnail generation
- [ ] Delete photo
- [ ] Reorder photos (drag & drop)
- [ ] Error handling (file too large, wrong type)

### Resources
- Vercel Blob: https://vercel.com/docs/storage/vercel-blob
- Sharp: https://sharp.pixelplumbing.com
- React Dropzone: https://react-dropzone.js.org
- DnD Kit: https://dndkit.com

---

*[Diğer tasklar için benzer detaylı kartlar devam eder...]*

---

## 📝 Task Card Usage

### How to Use These Cards

1. **Pick a task:** Assignee checks their tasks
2. **Read carefully:** Understand acceptance criteria
3. **Follow technical details:** Use provided code snippets
4. **Test thoroughly:** Complete testing checklist
5. **Update status:** Move card in GitHub Projects
6. **Create PR:** Link to task card in description

### Task Status Flow
```
Backlog → In Progress → Review → Testing → Done
```

### Estimation Guide
- **2-4 hours:** Simple feature (1 file, basic logic)
- **4-8 hours:** Medium feature (multiple files, API + UI)
- **8-12 hours:** Complex feature (architecture, integration)
- **12+ hours:** Major feature (break into subtasks)

---

**Total Sprint 3 Tasks:** 13  
**Total Estimate:** 80 hours  
**Sprint Duration:** 2 weeks (14 days)  
**Daily Capacity:** ~6 hours/day (realistic)

**Let's build! 🚀**

