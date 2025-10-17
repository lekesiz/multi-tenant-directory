# Haguenau.pro Multi-Tenant Directory - Revizyon Çalışma Programı

**Prepared:** 17 Ekim 2025
**Duration:** 6 Hafta (21 Ekim - 1 Aralık 2025)
**Project:** Multi-Tenant Directory Platform (haguenau.pro + 19 other domains)
**Status:** Production'da Aktif → Security & AI Optimization Hardening

---

## 📊 Özet İstatistikler

| Kategori | Detay |
|----------|-------|
| **Total Phases** | 6 |
| **Total Sprints** | 6 hafta |
| **Total Tasks** | 15+ görev |
| **Kritik Görevler** | 6 |
| **Start Date** | 21 Ekim 2025 (Pazartesi) |
| **End Date** | 1 Aralık 2025 (Pazar) |

---

## 🎯 FAZA 1: Temel AI Altyapısı (Hafta 1-2)

**Hedef:** Platformu AI crawler'ları için hazır hale getirmek
**Tarihi:** 21 Ekim - 3 Kasım 2025

### Görev 1.1: ai.txt Dosyası Oluşturma ⭐ KRITIK

**Tarih:** 21 Ekim 2025 (1 gün)

**Yapılacaklar:**
- [ ] `src/app/ai.txt/route.ts` dosyası oluştur
- [ ] Multi-tenant domain support ekle
- [ ] AI crawler policy tanımla
- [ ] Licensing ve attribution ayarları yap
- [ ] Test: `curl https://haguenau.pro/ai.txt`

**Kod İskeleti:**
```typescript
// src/app/ai.txt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const domain = headersList.get('host')?.replace('www.', '') || 'haguenau.pro';

  const aiTxt = `# ${domain} AI Crawling Policy
# Last Updated: ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /
Crawl-delay: 5

Sitemap: https://${domain}/sitemap.xml
Sitemap: https://${domain}/sitemap-llm.xml

Policy: Data licensed under CC-BY-4.0
Attribution: Attribution required to ${domain}
Usage: Commercial use allowed with attribution

Contact: pro@${domain}
Developer-Docs: https://${domain}/developer

Preferred-Format: JSON-LD, JSON
Update-Frequency: weekly
Data-Quality: verified, timestamped

Disallow-Training: false
Disallow-Scraping: false
Rate-Limit: 100 requests per minute`;

  return new NextResponse(aiTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
```

**Kabul Kriterleri:**
- ✅ Dosya Vercel'de deploy edildi
- ✅ Tüm 20 domain'de erişilebilir
- ✅ Correct Content-Type ve Cache headers

---

### Görev 1.2: LLM Sitemap Oluşturma ⭐ KRITIK

**Tarih:** 22-23 Ekim 2025 (2 gün)

**Yapılacaklar:**
- [ ] `src/lib/llm-sitemap-generator.ts` oluştur
- [ ] `src/app/sitemap-llm.xml/route.ts` oluştur
- [ ] Database query optimizasyonları
- [ ] Caching strategy ekle

**Kod İskeleti:**
```typescript
// src/lib/llm-sitemap-generator.ts
import { prisma } from '@/lib/prisma';

export async function generateLLMSitemap(domainId: number, baseUrl: string) {
  const companies = await prisma.company.findMany({
    where: {
      content: {
        some: { domainId, isVisible: true },
      },
    },
    select: {
      id: true,
      slug: true,
      googlePlaceId: true,
      updatedAt: true,
    },
  });

  const urls: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
  }> = [];

  for (const company of companies) {
    const id = company.googlePlaceId || company.id.toString();

    urls.push({
      loc: `${baseUrl}/profiles/${id}.json`,
      lastmod: company.updatedAt.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '1.0',
    });

    urls.push({
      loc: `${baseUrl}/profiles/${id}/faq.json`,
      lastmod: company.updatedAt.toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.9',
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}
```

**Kabul Kriterleri:**
- ✅ `/sitemap-llm.xml` erişilebilir
- ✅ Tüm 20 domain'de çalışıyor
- ✅ < 2s response time
- ✅ Valid XML formatı

---

### Görev 1.3: JSON Profile APIs Oluşturma

**Tarih:** 24-27 Ekim 2025 (4 gün)

**Yapılacaklar:**
- [ ] `src/app/profiles/[id].json/route.ts` (Company profile JSON)
- [ ] `src/app/profiles/[id]/faq.json/route.ts`
- [ ] `src/app/profiles/[id]/services.json/route.ts`
- [ ] Structured data validation (Zod)
- [ ] Rate limiting

**Örnek Endpoint:**
```typescript
// src/app/profiles/[id].json/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const headersList = await headers();
  const domain = headersList.get('host')?.replace('www.', '') || 'haguenau.pro';

  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { googlePlaceId: id },
        { id: parseInt(id) },
      ],
      content: {
        some: {
          domain: { name: domain },
          isVisible: true,
        },
      },
    },
    include: {
      reviews: { where: { isApproved: true } },
      hours: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const profileData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    description: company.description,
    url: `https://${domain}/companies/${company.slug}`,
    telephone: company.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address,
      addressLocality: company.city,
      postalCode: company.postalCode,
      addressCountry: 'FR',
    },
    image: company.logoUrl || company.coverImageUrl,
    aggregateRating: company.reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: (company.reviews.reduce((sum, r) => sum + r.rating, 0) / company.reviews.length).toFixed(1),
      reviewCount: company.reviews.length,
    } : null,
  };

  return NextResponse.json(profileData, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

---

## 🔐 FAZA 2: Database Güvenliği (Hafta 2-3)

**Hedef:** Tenant izolasyonunu DB seviyesinde garantilemek
**Tarihi:** 24 Ekim - 7 Kasım 2025

### Görev 2.1: Postgres RLS (Row-Level Security) ⭐ KRITIK

**Tarih:** 24-26 Ekim 2025 (3 gün)

**Yapılacaklar:**
- [ ] RLS enable et tüm tenant tablolarında
- [ ] Migration dosyası oluştur
- [ ] Politikaları test et

**Migration SQL:**
```sql
-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;

-- Set app.domain_id in connection
CREATE POLICY company_isolation ON companies
  USING (domain_id = NULLIF(current_setting('app.domain_id', true)::int, 0))
  WITH CHECK (domain_id = NULLIF(current_setting('app.domain_id', true)::int, 0));

-- Similar for company_content and reviews...
```

**Kabul Kriterleri:**
- ✅ RLS aktif tüm tablolarda
- ✅ Test queries çalışıyor
- ✅ Cross-tenant veri erişimi engellendi

---

### Görev 2.2: Prisma Middleware & Guards ⭐ KRITIK

**Tarih:** 27-29 Ekim 2025 (3 gün)

**Yapılacaklar:**
- [ ] `src/lib/prisma-middleware.ts` oluştur
- [ ] `src/lib/require-tenant.ts` oluştur
- [ ] Tüm API routes'lara integration

**Kod İskeleti:**
```typescript
// src/lib/prisma-middleware.ts
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export function installPrismaMiddleware(domainId: number) {
  prisma.$use(async (params, next) => {
    if (
      ['companies', 'company_content', 'google_reviews'].includes(
        params.model || ''
      )
    ) {
      if (
        params.action === 'findUnique' ||
        params.action === 'findFirst' ||
        params.action === 'findMany'
      ) {
        params.args.where = {
          ...params.args.where,
          domain_id: domainId,
        };
      }
    }
    return next(params);
  });
}

// src/lib/require-tenant.ts
import { headers } from 'next/headers';
import { prisma } from './prisma';

export async function requireTenant() {
  const headersList = await headers();
  const host = headersList.get('host') || 'haguenau.pro';
  const domain = host.replace('www.', '');

  const domainRecord = await prisma.domain.findUnique({
    where: { name: domain },
  });

  if (!domainRecord) {
    throw new Error(`Domain not found: ${domain}`);
  }

  return { domain, domainId: domainRecord.id };
}
```

**Kabul Kriterleri:**
- ✅ Middleware çalışıyor
- ✅ Tüm API routes'lar tenant-safe
- ✅ Cross-tenant queries fail'luyor

---

## 🔑 FAZA 3: Authentication & RBAC (Hafta 3-4)

**Hedef:** NextAuth RBAC'i tamamlamak
**Tarihi:** 28 Ekim - 10 Kasım 2025

### Görev 3.1: NextAuth RBAC Tamamlanması

**Tarih:** 28-30 Ekim 2025 (3 gün)

**Yapılacaklar:**
- [ ] Role enum'ı tanımla (superadmin, admin, editor, viewer)
- [ ] Session callback'ini güncelle
- [ ] Middleware ile route protection
- [ ] Admin panel sertle\ştirmesi

**Kod İskeleti:**
```typescript
// src/lib/auth.ts
import { User } from 'next-auth';

export enum UserRole {
  SUPERADMIN = 'superadmin', // Tüm domainler
  ADMIN = 'admin',            // Seçili domainler
  EDITOR = 'editor',          // İçerik düzenlemesi
  VIEWER = 'viewer',          // Sadece okuma
}

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    role: UserRole;
    allowedDomainIds: number[];
  }
  interface Session {
    user: User;
  }
}

// src/middleware.ts örneği
export function auth(request: NextRequest) {
  const session = getToken({ req: request });

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session || ![UserRole.ADMIN, UserRole.SUPERADMIN].includes(session.role)) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}
```

**Kabul Kriterleri:**
- ✅ Roller tanımlandı ve test edildi
- ✅ Session'da role bilgisi var
- ✅ Route protection çalışıyor

---

### Görev 3.2: Admin Route Sertleştirmesi

**Tarih:** 31 Ekim - 2 Kasım 2025 (3 gün)

**Yapılacaklar:**
- [ ] Admin routes'lar için server-side guard
- [ ] Client-side route guard
- [ ] Unauthorized access logging
- [ ] CSRF protection doğrula

---

## ⚙️ FAZA 4: Background Jobs (Hafta 4-5)

**Hedef:** Automated jobs ve retry stratejisi
**Tarihi:** 4-14 Kasım 2025

### Görev 4.1: Vercel Cron Configuration

**Tarih:** 4-7 Kasım 2025 (4 gün)

**Yapılacaklar:**
- [ ] Review sync cron job (günlük)
- [ ] Sitemap generation cron
- [ ] Error handling ve alerts

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-reviews",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/generate-sitemaps",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

### Görev 4.2: Inngest/Trigger.dev Integration

**Tarih:** 8-11 Kasım 2025 (4 gün)

**Yapılacaklar:**
- [ ] Inngest SDK entegrasyonu
- [ ] Retry logic ve dead-letter handling
- [ ] Job monitoring

---

## 📈 FAZA 5: SEO Optimizasyon (Hafta 5-6)

**Hedef:** Multi-domain SEO setup
**Tarihi:** 11-21 Kasım 2025

### Görev 5.1: Sitemap, Robots, Canonical

**Tarih:** 11-14 Kasım 2025 (4 gün)

**Yapılacaklar:**
- [ ] Domain-specific robots.txt
- [ ] Canonical URL implementation
- [ ] Alternate links (hreflang if needed)
- [ ] Dynamic sitemap generation

---

### Görev 5.2: Schema.org Structured Data

**Tarih:** 15-18 Kasım 2025 (4 gün)

**Yapılacaklar:**
- [ ] LocalBusiness schema
- [ ] AggregateRating schema
- [ ] Product/Service schemas
- [ ] Schema validation

---

## 📊 FAZA 6: Monitoring & Production Readiness (Hafta 6)

**Hedef:** Error tracking ve final checklist
**Tarihi:** 18-25 Kasım 2025

### Görev 6.1: Sentry + Structured Logging

**Tarih:** 18-21 Kasım 2025 (4 gün)

**Yapılacaklar:**
- [ ] Sentry konfigürasyonu
- [ ] Structured logging setup
- [ ] RequestID/TenantID correlation
- [ ] Alert rules

---

### Görev 6.2: Production Checklist & Testing

**Tarih:** 22-25 Kasım 2025 (4 gün)

**Yapılacaklar:**
- [ ] E2E tests (Playwright)
- [ ] Load testing
- [ ] Security audit
- [ ] DR plan test

---

## ✅ Production Readiness Checklist

### Database Güvenliği
- [ ] RLS aktif tüm tablolarda
- [ ] Tenant guards tüm sorgularda
- [ ] Prisma middleware çalışıyor
- [ ] Cross-tenant queries engellendi

### Authentication & Authorization
- [ ] RBAC tamamlandı
- [ ] Admin routes protected
- [ ] CSRF protection aktif
- [ ] Session management secure

### SEO & Content
- [ ] Sitemap.xml ve sitemap-llm.xml çalışıyor
- [ ] Robots.txt domain-specific
- [ ] Canonical URLs yerinde
- [ ] Schema.org data valid

### Background Jobs
- [ ] Cron jobs aktif ve monitored
- [ ] Retry logic çalışıyor
- [ ] Error alerts ayarlandı
- [ ] Dead-letter queue var

### Monitoring
- [ ] Sentry aktif
- [ ] Structured logging working
- [ ] Health check endpoint var
- [ ] Performance metrics tracked

### Security
- [ ] x-tenant-domain header sanitized
- [ ] Maps API restricted
- [ ] Admin default credentials removed
- [ ] Secrets securely stored

### Backup & DR
- [ ] Daily automated backups
- [ ] Restore procedure tested
- [ ] RTO/RPO targets defined

---

## 📅 Haftalık Özet

| Hafta | Başlangıç | Bitiş | Odak | Çıktı |
|-------|-----------|-------|------|-------|
| 1 | 21 Ekim | 27 Ekim | AI Infrastructure | ai.txt, LLM Sitemap |
| 2 | 28 Ekim | 3 Kasım | Database Security | RLS, Prisma Guards |
| 3 | 4 Kasım | 10 Kasım | Auth & RBAC | NextAuth Hardening |
| 4 | 11 Kasım | 17 Kasım | Background Jobs | Cron & Inngest |
| 5 | 18 Kasım | 24 Kasım | SEO & Content | Sitemap, Canonical, Schema |
| 6 | 25 Kasım | 1 Aralık | Monitoring & Testing | Sentry, E2E Tests |

---

## 🎯 Başarı Metrikleri

- ✅ 6 hafta içinde tamamlanma
- ✅ %100 production checklist geçişi
- ✅ Zero security vulnerabilities
- ✅ < 2s response time for LLM endpoints
- ✅ 99.9% uptime during deployment

---

**Son Güncelleme:** 17 Ekim 2025
**Hazırlayan:** Claude AI
**Onay:** Bekleniyor
