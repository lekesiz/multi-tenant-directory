# Finansal Modül - Teknik Bağımlılık Haritası

**Tarih:** 17 Ekim 2025
**Amaç:** Phase 1 ile Finansal Modül arasındaki teknik bağımlılıkları net hale getirmek

---

## 📊 Bağımlılık Matrisi

| Finansal Modül Bileşen | Phase 1 Bağımlılığı | Durum | Kopya/Yeniden Kullan |
|---|---|---|---|
| **Database Schema** | ❌ Yok | 🆕 Yeni | Yeni table + Prisma migration |
| **Multi-tenant Resolution** | ✅ ai.txt pattern | ✅ Var | KopyaOrnek: `src/app/ai/route.ts` satır 5-8 |
| **Domain Filtering** | ✅ profiles/[id] pattern | ✅ Var | Kopya: `src/app/api/profiles/[id]/route.ts` satır 95-107 |
| **Schema.org Format** | ✅ LocalBusiness | ✅ Var | Kopya: `src/app/api/profiles/[id]/route.ts` satır 162-210 |
| **Caching Strategy** | ✅ Cache-Control headers | ✅ Var | Kopya: `src/app/api/profiles/[id]/route.ts` satır 221-226 |
| **File Encryption** | ❌ Yok | 🆕 Yeni | S3/Vercel Blob - yeni setup |
| **AI Integration** | ❌ Yok | 🆕 Yeni | OpenAI API - yeni setup |
| **RBAC & Auth** | 🟡 Partial (Pages Légales role) | 🟡 Phase 3 | Phase 3'ten inherit edilecek |
| **Error Handling** | ✅ NextResponse pattern | ✅ Var | Kopya: `src/app/api/profiles/[id]/route.ts` satır 228-235 |
| **CORS Headers** | ✅ Access-Control-Allow | ✅ Var | Kopya: `src/app/api/profiles/[id]/route.ts` satır 223 |

---

## 🔗 DETAYLI BAĞIMLILIK ANALIZI

### 1. Multi-Tenant Resolution

**Phase 1 Başarıyla Yaptığı:**
```typescript
// src/app/ai/route.ts (başarılı pattern)
const headersList = await headers();
const host = headersList.get('host') || 'haguenau.pro';
let domain = host.split(':')[0];
domain = domain.replace('www.', '');

// Finansal modül = AYNI PATTERN
// Fakat POST endpoint (upload) için

const domainRecord = await prisma.domain.findUnique({
  where: { name: domain },
});
```

**Finansal Modüle Uygulanması:**
```typescript
// src/app/api/accounting/upload/route.ts (YENI - Phase 1 pattern kullanarak)
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  // Phase 1'den kopya
  const headersList = await headers();
  const domain = headersList.get('host')?.replace('www.', '') || 'haguenau.pro';

  const domainRecord = await prisma.domain.findUnique({
    where: { name: domain },
  });

  if (!domainRecord) {
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
  }

  // Finansal modüle özel logic buradan başlar
  // ...
}
```

**Sonuç:** ✅ UYGUN - Doğrudan kullanılabilir

---

### 2. Tenant Filtering Pattern

**Phase 1 Başarıyla Yaptığı:**
```typescript
// src/app/api/profiles/[id]/route.ts (başarılı pattern)
const company = await prisma.company.findFirst({
  where: {
    OR: [
      { googlePlaceId: id },
      { id: isNaN(parseInt(id)) ? undefined : parseInt(id) },
    ],
    content: {
      some: {
        domainId: domainRecord.id,
        isVisible: true,
      },
    },
  },
  include: {
    reviews: { where: { isApproved: true } },
  },
});

if (!company) {
  return NextResponse.json({ error: 'Company not found' }, { status: 404 });
}
```

**Finansal Modüle Uygulanması:**
```typescript
// src/app/api/accounting/[companyId]/route.ts (YENI)
const company = await prisma.company.findFirst({
  where: {
    id: parseInt(companyId),
    // Phase 1 pattern
    content: {
      some: {
        domainId: domainRecord.id,
        isVisible: true,
      },
    },
  },
  include: {
    financialDocuments: true,
    financialInsights: true,
  },
});
```

**Sonuç:** ✅ UYGUN - Doğrudan kullanılabilir

---

### 3. Schema.org LocalBusiness Pattern

**Phase 1 Başarıyla Yaptığı:**
```typescript
// src/app/api/profiles/[id]/route.ts
const profile = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${baseUrl}/companies/${company.slug}`,
  name: company.name,
  description: content?.customDescription || company.description,
  image: { '@type': 'ImageObject', url: company.coverImageUrl },
  // ... daha fazla field
};

// Remove undefined fields
const cleanedProfile = Object.fromEntries(
  Object.entries(profile).filter(([_, v]) => v !== undefined)
);

return NextResponse.json(cleanedProfile, { ... });
```

**Finansal Modüle Uygulanması:**
```typescript
// src/app/api/profiles/[id]/financial-insights/route.ts (YENI - Phase 1 pattern)
const financialProfile = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness', // Base type
  '@id': `${baseUrl}/companies/${company.slug}/financial`,
  financialInsights: {
    '@type': 'FinancialDataInsights', // Potential custom type
    revenue: company.financialInsights.revenue,
    growthRate: company.financialInsights.growthRate,
    employees: company.financialInsights.numberOfEmployees,
  },
};

// Phase 1 cleanup pattern
const cleanedProfile = Object.fromEntries(
  Object.entries(financialProfile).filter(([_, v]) => v !== undefined)
);

return NextResponse.json(cleanedProfile, { ... });
```

**Sonuç:** ✅ UYGUN - Pattern'ı takip edilerek kullanılabilir

---

### 4. Caching Strategy

**Phase 1 Uygulaması:**
```typescript
// src/app/api/profiles/[id]/route.ts
return NextResponse.json(cleanedProfile, {
  status: 200,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600', // 1 hour - stable data
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': '*',
    'Content-License': 'CC-BY-4.0',
    'Last-Modified': company.updatedAt.toUTCString(),
  },
});

export const revalidate = 3600; // 1 hour
```

**Finansal Modül Gereksinimleri:**
```
Company Profiles:     1 hour   (stable)
Reviews:             30 mins   (daha sık güncellenebilir)
Services:             1 hour   (stable)
Business Hours:      24 hours  (çok nadir değişir)
Financial Insights:   ? ???    (ne sıklıkta update?)
```

**Finansal Modüle Uygulanması:**
```typescript
// Financial data = kritik & şirket tarafından kontrol edilir
// → İlk başta: no cache (fresh always)
// → Production'da: 6-12 hours (stable after verification)

const cacheControl = isProduction
  ? 'public, max-age=43200' // 12 hours production
  : 'public, max-age=300';   // 5 mins development

return NextResponse.json(financialInsights, {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cacheControl,
    'Last-Modified': insights.updatedAt.toUTCString(),
    'X-Financial-Verified': insights.verifiedAt ? 'true' : 'false',
  },
});
```

**Sonuç:** ✅ UYGUN - Pattern'ı takip edilerek, ama cache düşük olacak

---

### 5. Error Handling

**Phase 1 Pattern:**
```typescript
// src/app/api/profiles/[id]/route.ts (lines 228-235)
} catch (error) {
  console.error('Error fetching company profile:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

**Finansal Modül Gereksinimleri:**
```
Gerekli Error Cases:
- Domain not found           (404)
- Company not found          (404)
- No permission to upload    (403)
- Invalid file format        (400)
- File too large            (413)
- Encryption failed         (500)
- AI analysis failed        (500)
- Verification failed       (422)
```

**Finansal Modüle Uygulanması:**
```typescript
// src/app/api/accounting/upload/route.ts
export async function POST(request: NextRequest) {
  try {
    // Phase 1 pattern + Financial specific
    const { companyId } = extractFromRequest();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID required' },
        { status: 400 }
      );
    }

    // Permission check
    const user = await getCurrentUser();
    if (!canUploadFinancialDocs(user, companyId)) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // ... processing

  } catch (error) {
    console.error('Error uploading financial document:', error);

    // Log to Sentry for monitoring
    captureException(error);

    return NextResponse.json(
      { error: 'Internal server error', requestId: context.requestId },
      { status: 500 }
    );
  }
}
```

**Sonuç:** ✅ UYGUN - Phase 1 base pattern, ama financial-specific cases eklenecek

---

### 6. CORS Headers

**Phase 1 Pattern:**
```typescript
// src/app/api/profiles/[id]/route.ts
'Access-Control-Allow-Origin': '*', // Public data
```

**Finansal Modül Kararı:**
```
Finansal data = HASSAS
→ Public financial insights: '*' (herkese açık)
→ Document upload: 'same-origin' (sadece domain içi)
→ AI analysis: 'same-origin' (admin panel içi)
```

**Finansal Modüle Uygulanması:**
```typescript
// Public financial insights endpoint (Phase 1 gibi)
'Access-Control-Allow-Origin': '*',

// Admin upload endpoint (hassas)
'Access-Control-Allow-Origin': `https://${domain}`, // same-origin
'Access-Control-Allow-Credentials': 'true',
```

**Sonuç:** ✅ UYGUN - Conditional CORS gerekli

---

## 🚨 BAĞIMLILIK ÇATIŞMALARI

### Çatışma 1: Auth & RBAC (Phase 3 bağımlılığı)

**Sorun:**
```
Finansal modül için ACCOUNTANT role gerekli
Phase 3'te Auth & RBAC yapılacak
Finansal modül Phase 1.5-2'de başlamak istiyor

→ Chronolojik mismatch!
```

**Çözüm:**
```
Option A: Phase 3 Auth erken bitir (2 hafta)
  ✅ Avantaj: RBAC ready
  ❌ Dezavantaj: Phase 2 beklediği Auth

Option B: Finansal modül basic auth ile başla, Phase 3'te migrate
  ✅ Avantaj: Paralel çalışabilir
  ❌ Dezavantaj: Auth refactor gerekli

Option C: ACCOUNTANT role'u standalone oluştur (Phase 1.5)
  ✅ Avantaj: Paralel + bağımsız
  ✓ TAVSİYE: Bu yaklaşım en iyi

  // src/lib/auth/roles.ts - Standalone role definition
  export const ACCOUNTANT_ROLE = 'ACCOUNTANT';

  // Phase 3'te: Tüm roles NextAuth'a integrate ediliyor
```

**Sonuç:** ✅ ÇÖZÜLEBILIR - ACCOUNTANT role standalone oluşturulacak

---

### Çatışma 2: Database Constraints (RLS henüz yok)

**Sorun:**
```
Finansal modül = cross-tenant data access riski
Phase 2'de RLS yapılacak
Finansal modül Phase 1.5'te risk var

→ Seguridad zaafiyeti!
```

**Çözüm:**
```
Option A: RLS'i erken yap (Phase 1.5a)
  ✅ Avantaj: Secure
  ❌ Dezavantaj: Phase 2 work duplicate

Option B: Application-level filtering (temporary)
  ✅ Avantaj: Paralel olur
  ⚠️ Risk: Uygulama hatasında data leak

Option C: Feature flag behind RLS
  ✅ Avantaj: Secure by default
  ✓ TAVSİYE: Financial module sadece RLS'ten sonra enable

  // Feature flag example
  if (!hasRowLevelSecurity) {
    return NextResponse.json(
      { error: 'Financial module not ready' },
      { status: 503 }
    );
  }
```

**Sonuç:** ✅ ÇÖZÜLEBILIR - Feature flag ile protect edilecek

---

## 📋 Finansal Modülün Başlayabileceği Zaman

### Dependency Chain Analysis

```
START (Today)
  ├─ Phase 1 (AI Infrastructure) ✅ DONE
  │   ├─ api.txt endpoint
  │   ├─ LLM Sitemap
  │   ├─ Profile APIs
  │   └─ Schema.org patterns
  │
  ├─ Phase 2 (Database Security) [Hafta 2-3]
  │   └─ Row Level Security setup
  │       ├─ Prerequisite: Financial Module CANNOT start without RLS
  │       ├─ Alternative: Use application-level filtering (unsafe)
  │       └─ Recommendation: Start after Phase 2 begins (Hafta 2)
  │
  ├─ Phase 3 (Auth & RBAC) [Hafta 3-4]
  │   ├─ NextAuth hardening
  │   ├─ ACCOUNTANT role registration
  │   └─ Permission middleware
  │
  └─ Financial Module 1.5 [PARALLEL - Hafta 2-4]
      ├─ Database schema (independent)
      ├─ File encryption (independent)
      ├─ API endpoints (with feature flag)
      └─ UI/Admin panel (with disabled state until Phase 3)
```

### SONUÇ: Finansal Modül Başlama Zamanı

**En Erken:** Hafta 2 (Phase 2 başladıktan sonra)
**En Güvenli:** Hafta 3 (Phase 2-3 başladıktan sonra)
**Önerilen:** Hafta 2 (feature-flagged, Phase 3'ü bekle)

---

## ✅ Teknik Başlama Checklist

Finansal modüle başlamadan önce gereken:

- [ ] Phase 1 deployment ✅ (tamamlandı)
- [ ] Phase 2 RLS planning başladı
- [ ] ACCOUNTANT role tanımı oluşturuldu
- [ ] Feature flag system ready
- [ ] File encryption library seçildi (Vercel Blob vs S3)
- [ ] OpenAI API key environment'a eklendi
- [ ] Prisma 6 database schema versioned
- [ ] Beta user list hazır
- [ ] Mehmet Bey hazırlamalar başladı

---

## 🎯 Paralel Entegrasyon İçin Teknik Road

### Hafta 2 - 4 Kasım: Phase 2 RLS + Finansal Module Foundation

**Claude (Phase 2):**
- RLS policies tanımlama
- Prisma middleware RLS guards

**Gemini (Finansal 1.5):**
- FinancialDocument + CompanyFinancialInsights schema
- File encryption middleware
- Basic CRUD endpoints (feature-flagged)
- Test coverage

**Sync Point:** Daily - RLS patterns Finansal modülde uygulanıyor

---

### Hafta 3 - 18 Kasım: Phase 3 Auth + Finansal Module APIs

**Claude (Phase 3):**
- NextAuth RBAC
- ACCOUNTANT role registration
- Permission middleware

**Gemini (Finansal 1.5):**
- OpenAI integration
- Analysis endpoint
- Approval workflow
- Admin panel foundation

**Sync Point:** Daily - ACCOUNTANT role tanımı Finansal modülde aktive

---

### Hafta 4-5: Phase 4-5 + Finansal Module UI

**Claude (Phase 4-5):**
- Background jobs
- SEO optimization

**Gemini (Finansal 1.5):**
- Admin dashboard UI
- Public financial insights
- Testing & bug fixes

**Sync Point:** Feature flag remove - Finansal modül enable

---

## 📊 Özet: Bağımlılık Başında/Sonunda

| Bileşen | Bağımlılık | Başlama Zamanı | Risk |
|---|---|---|---|
| Database Schema | Hiçbiri | Hafta 1 | 🟢 Yok |
| File Encryption | AWS SDK seçimi | Hafta 1 | 🟢 Yok |
| Basic Endpoints | Phase 2 RLS | Hafta 2 | 🟡 Orta |
| ACCOUNTANT Role | NextAuth seçimi | Hafta 1 (standalone) | 🟢 Yok |
| OpenAI Integration | API key gerekli | Hafta 1 | 🟡 Orta |
| Admin UI | Phase 3 Auth gerekli | Hafta 3 | 🟢 Yok |
| Public Insights | Phase 1 Schema pattern | Hafta 2 | 🟡 Orta |
| Feature Flag Enable | Phase 3 Auth bitişi | Hafta 4 | 🟢 Yok |
| **LAUNCH** | Tüm bileşenler | **Hafta 6+** | 🟢 Yok |

