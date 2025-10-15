# Claude AI - Sprint 3 Görevleri
**Sprint:** 16-29 Ekim 2025 (2 hafta)  
**Rol:** Backend Developer + Architecture  
**Workload:** 35% (28 saat)  
**Koordinatör:** Manus AI

---

## 👋 Hoş Geldin Claude!

Bu dosya senin Sprint 3 görevlerini içeriyor. Toplam **4 task** ve **28 saat** iş yükün var. Sen backend development ve architecture konusunda uzman olduğun için kritik görevler sana atandı.

---

## 🎯 Senin Görevlerin

### ✅ Öncelik Sırası
1. **TASK-003:** Database Schema Genişletme (8h) - **HEMEN BAŞLA**
2. **TASK-004:** Authentication System (10h) - **TASK-003'ten sonra**
3. **TASK-008:** Çalışma Saatleri Backend (4h) - **Hafta 2**
4. **TASK-010:** Yorum Yönetimi (6h) - **Hafta 2**

---

## 📋 TASK-003: Database Schema Genişletme

**Priority:** P0 (Critical)  
**Estimate:** 8 saat  
**Başlangıç:** 16 Ekim 2025, 09:00  
**Dependencies:** Yok  
**Blocker:** Yok

### Açıklama
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

### Teknik Detaylar

**1. Prisma Schema Güncellemesi:**

Dosya: `prisma/schema.prisma`

```prisma
// Yeni tablolar ekle

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

// Company model'i güncelle
model Company {
  // ... mevcut alanlar
  
  // Yeni relations ekle
  ownerships    CompanyOwnership[]
  photos        Photo[]
  businessHours BusinessHours?
  analytics     CompanyAnalytics[]
}
```

**2. Migration Komutları:**

```bash
# Development migration oluştur
npx prisma migrate dev --name add_dashboard_tables

# Production migration (Manus AI yapacak)
# npx prisma migrate deploy

# Prisma Client güncelle
npx prisma generate
```

**3. Seed Data:**

Dosya: `prisma/seed-dashboard.ts` (yeni oluştur)

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting dashboard seed...');

  // Create test business owner
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const owner = await prisma.businessOwner.create({
    data: {
      email: 'owner@netzinformatique.fr',
      password: hashedPassword,
      firstName: 'Mikail',
      lastName: 'Lekesiz',
      phone: '0612345678',
      emailVerified: new Date(),
    }
  });

  console.log('✅ Business owner created:', owner.email);

  // Find NETZ Informatique
  const company = await prisma.company.findFirst({
    where: { slug: 'netz-informatique' }
  });

  if (company) {
    // Link owner to company
    await prisma.companyOwnership.create({
      data: {
        companyId: company.id,
        ownerId: owner.id,
        role: 'owner',
        verified: true
      }
    });

    console.log('✅ Company ownership created');

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

    console.log('✅ Business hours created');

    // Add sample analytics
    const today = new Date();
    await prisma.companyAnalytics.create({
      data: {
        companyId: company.id,
        date: today,
        profileViews: 45,
        uniqueVisitors: 32,
        phoneClicks: 8,
        websiteClicks: 12,
        emailClicks: 3,
        directionsClicks: 15,
        sourceOrganic: 20,
        sourceSearch: 18,
        sourceDirect: 7,
      }
    });

    console.log('✅ Analytics created');
  }

  console.log('🎉 Dashboard seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**4. Package.json Script Ekle:**

```json
{
  "scripts": {
    "db:seed:dashboard": "npx tsx prisma/seed-dashboard.ts"
  }
}
```

### Testing Checklist
- [ ] Migration runs successfully (local)
- [ ] Seed data populates correctly
- [ ] Prisma Studio: Verify tables exist
- [ ] Foreign keys work correctly
- [ ] Indexes created
- [ ] No TypeScript errors after `npx prisma generate`

### Resources
- Prisma Docs: https://www.prisma.io/docs
- Prisma Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- bcryptjs: https://www.npmjs.com/package/bcryptjs

### Çıktı
- ✅ 5 yeni tablo oluşturuldu
- ✅ Migration dosyası hazır
- ✅ Seed script çalışıyor
- ✅ Test data mevcut

---

## 📋 TASK-004: Authentication System (NextAuth.js)

**Priority:** P0 (Critical)  
**Estimate:** 10 saat  
**Başlangıç:** 18 Ekim 2025, 09:00  
**Dependencies:** TASK-003 (Database schema)  
**Blocker:** TASK-003 tamamlanmalı

### Açıklama
NextAuth.js ile authentication sistemi kur. Email/password ile login, JWT session, protected routes.

### Acceptance Criteria
- [ ] NextAuth.js konfigüre edildi
- [ ] Credentials provider çalışıyor
- [ ] Login sayfası (`/auth/login`)
- [ ] Register sayfası (`/auth/register`)
- [ ] JWT session strategy
- [ ] Protected routes middleware
- [ ] Logout fonksiyonu
- [ ] Session persist (cookie)

### Teknik Detaylar

**1. Dependencies Yükle:**

```bash
npm install next-auth @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

**2. NextAuth Configuration:**

Dosya: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
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
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        const owner = await prisma.businessOwner.findUnique({
          where: { email: credentials.email }
        });

        if (!owner) {
          throw new Error('Email ou mot de passe incorrect');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          owner.password
        );

        if (!isPasswordValid) {
          throw new Error('Email ou mot de passe incorrect');
        }

        return {
          id: owner.id,
          email: owner.email,
          name: `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
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
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**3. Middleware (Protected Routes):**

Dosya: `src/middleware.ts`

```typescript
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

Dosya: `src/app/auth/login/page.tsx`

```typescript
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Email ou mot de passe incorrect');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Connexion
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Pas encore de compte?{' '}
          <a href="/auth/register" className="text-blue-600 hover:underline font-semibold">
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  );
}
```

**5. Register Page:**

Dosya: `src/app/auth/register/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setLoading(false);

    if (response.ok) {
      router.push('/auth/login?registered=true');
    } else {
      const data = await response.json();
      setError(data.error || 'Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Créer un compte
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition mt-6"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte?{' '}
          <a href="/auth/login" className="text-blue-600 hover:underline font-semibold">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
```

**6. Register API:**

Dosya: `src/app/api/auth/register/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
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
        phone,
      }
    });

    return NextResponse.json({ 
      success: true, 
      id: owner.id 
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
```

**7. Environment Variables:**

`.env.local` dosyasına ekle:

```bash
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
```

Generate secret:
```bash
openssl rand -base64 32
```

### Testing Checklist
- [ ] Register flow works (new user creation)
- [ ] Login flow works (existing user)
- [ ] Wrong password shows error
- [ ] Protected routes redirect to login
- [ ] Session persists after page refresh
- [ ] Logout works
- [ ] Password hashing works (check in Prisma Studio)

### Resources
- NextAuth.js Docs: https://next-auth.js.org
- Credentials Provider: https://next-auth.js.org/providers/credentials
- Prisma Adapter: https://authjs.dev/reference/adapter/prisma

### Çıktı
- ✅ Login/Register sayfaları çalışıyor
- ✅ JWT session management
- ✅ Protected routes middleware
- ✅ Password hashing (bcrypt)

---

## 📋 TASK-008: Çalışma Saatleri Yönetimi

**Priority:** P1 (High)  
**Estimate:** 4 saat  
**Başlangıç:** 23 Ekim 2025, 09:00  
**Dependencies:** TASK-003  
**Partner:** VS Code Developer (Frontend)

### Açıklama
İşletme çalışma saatlerini yönetmek için backend API. CRUD operations, validation, "şimdi açık/kapalı" hesaplama.

### Acceptance Criteria
- [ ] BusinessHours CRUD API
- [ ] `GET/PUT /api/dashboard/hours` endpoint
- [ ] Time format validation
- [ ] Special hours support (holidays)
- [ ] "Şimdi açık/kapalı" logic
- [ ] Timezone handling

### Teknik Detaylar

**API Endpoint:**

Dosya: `src/app/api/dashboard/hours/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const daySchema = z.object({
  open: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  close: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  closed: z.boolean(),
}).nullable();

const hoursSchema = z.object({
  monday: daySchema,
  tuesday: daySchema,
  wednesday: daySchema,
  thursday: daySchema,
  friday: daySchema,
  saturday: daySchema,
  sunday: daySchema,
  specialHours: z.array(z.object({
    date: z.string(),
    closed: z.boolean(),
    note: z.string().optional(),
  })).optional(),
});

// GET - Fetch business hours
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ownership = await prisma.companyOwnership.findFirst({
    where: { ownerId: session.user.id },
    include: {
      company: {
        include: {
          businessHours: true
        }
      }
    }
  });

  if (!ownership) {
    return NextResponse.json({ error: 'No company found' }, { status: 404 });
  }

  return NextResponse.json(ownership.company.businessHours || {});
}

// PUT - Update business hours
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  // Validate
  const result = hoursSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error },
      { status: 400 }
    );
  }

  const ownership = await prisma.companyOwnership.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!ownership) {
    return NextResponse.json({ error: 'No company found' }, { status: 404 });
  }

  // Upsert business hours
  const hours = await prisma.businessHours.upsert({
    where: { companyId: ownership.companyId },
    update: result.data,
    create: {
      companyId: ownership.companyId,
      ...result.data,
    }
  });

  return NextResponse.json(hours);
}
```

**Helper Function (Şimdi Açık/Kapalı):**

Dosya: `src/lib/business-hours.ts`

```typescript
interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

interface BusinessHours {
  monday?: DayHours | null;
  tuesday?: DayHours | null;
  wednesday?: DayHours | null;
  thursday?: DayHours | null;
  friday?: DayHours | null;
  saturday?: DayHours | null;
  sunday?: DayHours | null;
  timezone?: string;
}

export function isOpenNow(hours: BusinessHours): boolean {
  if (!hours) return false;

  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[now.getDay()] as keyof BusinessHours;
  
  const todayHours = hours[dayName] as DayHours | null;
  
  if (!todayHours || todayHours.closed) {
    return false;
  }

  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

export function getNextOpenTime(hours: BusinessHours): string | null {
  // Implementation for "Ouvre à 09:00 demain"
  // ... (optional, can be added later)
  return null;
}
```

### Testing Checklist
- [ ] GET endpoint returns hours
- [ ] PUT endpoint updates hours
- [ ] Validation works (invalid time format)
- [ ] isOpenNow() logic correct
- [ ] Timezone handling

### Çıktı
- ✅ Business hours CRUD API
- ✅ Validation logic
- ✅ "Şimdi açık/kapalı" helper

---

## 📋 TASK-010: Yorum Yönetimi (Dashboard)

**Priority:** P1 (High)  
**Estimate:** 6 saat  
**Başlangıç:** 25 Ekim 2025, 09:00  
**Dependencies:** TASK-001 (Reviews active)

### Açıklama
İşletme sahiplerinin yorumları görmesi ve cevap vermesi için dashboard API.

### Acceptance Criteria
- [ ] `GET /api/dashboard/reviews` endpoint
- [ ] Review list (company'nin yorumları)
- [ ] `POST /api/dashboard/reviews/:id/reply` endpoint
- [ ] Email notification (yeni yorum)
- [ ] Reply validation

### Teknik Detaylar

**API Endpoints:**

Dosya: `src/app/api/dashboard/reviews/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - List company reviews
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

  const reviews = await prisma.review.findMany({
    where: { companyId: ownership.companyId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return NextResponse.json(reviews);
}
```

Dosya: `src/app/api/dashboard/reviews/[id]/reply/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reply } = await request.json();

  if (!reply || reply.length < 10) {
    return NextResponse.json(
      { error: 'La réponse doit contenir au moins 10 caractères' },
      { status: 400 }
    );
  }

  // Verify ownership
  const review = await prisma.review.findUnique({
    where: { id: params.id },
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

  if (!review || review.company.ownerships.length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Update review with reply
  const updated = await prisma.review.update({
    where: { id: params.id },
    data: {
      ownerReply: reply,
      ownerRepliedAt: new Date(),
    }
  });

  // TODO: Send email notification to user
  // await sendReplyNotification(review.user.email, reply);

  return NextResponse.json(updated);
}
```

### Testing Checklist
- [ ] GET reviews works
- [ ] POST reply works
- [ ] Validation (min length)
- [ ] Authorization check
- [ ] Reply appears on company page

### Çıktı
- ✅ Review list API
- ✅ Reply API
- ✅ Authorization logic

---

## 📊 Senin Sprint 3 Özeti

### Toplam İş Yükü
- **4 task**
- **28 saat**
- **35% sprint capacity**

### Timeline
- **Hafta 1 (16-22 Ekim):** TASK-003, TASK-004
- **Hafta 2 (23-29 Ekim):** TASK-008, TASK-010

### Bağımlılıklar
- TASK-004 → TASK-003'e bağımlı
- TASK-008 → TASK-003'e bağımlı
- TASK-010 → TASK-001'e bağımlı (Manus AI yapacak)

### Koordinasyon
- **VS Code Developer:** TASK-008 için frontend yapacak
- **Manus AI:** TASK-001 yapacak (TASK-010 için gerekli)

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

### Sorular
- GitHub Discussions'da sor
- Urgent: Direct message

---

## 🎯 Başarı Kriterleri

### Sprint Sonunda
- [ ] 4/4 task tamamlandı
- [ ] Tüm testler geçti
- [ ] Code review yapıldı
- [ ] Production'da çalışıyor

### Kalite Standartları
- [ ] TypeScript errors yok
- [ ] Prisma migrations çalışıyor
- [ ] API endpoints documented
- [ ] Error handling mevcut

---

## 🚀 Hadi Başlayalım!

**İlk Görevin:** TASK-003 (Database Schema)  
**Başlangıç:** 16 Ekim 2025, 09:00  
**Süre:** 8 saat

**Adımlar:**
1. Prisma schema'yı güncelle
2. Migration oluştur
3. Seed script yaz
4. Test et
5. PR aç

**Başarılar! 🎉**

---

**Hazırlayan:** Manus AI (Proje Yöneticisi)  
**Tarih:** 15 Ekim 2025  
**Sprint:** 3 (16-29 Ekim 2025)

