# Multi-Tenant Directory Platform - Kapsamlı Çalışma Dokümanı

**Proje Adı:** Multi-Tenant Directory Platform  
**Teknoloji Stack:** Next.js 15 (App Router), Prisma, PostgreSQL (Neon), NextAuth, Vercel  
**Domain Sayısı:** 20+ (haguenau.pro, bas-rhin.pro, vb.)  
**Tarih:** 15 Ekim 2025  
**Durum:** Production'da Aktif

---

## 📊 Mevcut Durum Özeti

### ✅ Tamamlanan Özellikler

1. **Temel Altyapı**
   - Next.js 15 App Router mimarisi
   - Prisma ORM + PostgreSQL (Neon) entegrasyonu
   - Vercel deployment pipeline
   - 20+ domain yönetimi (DNS + SSL)
   - Multi-tenant middleware (domain-based)

2. **Frontend & UI**
   - Tailwind CSS + shadcn/ui component library
   - Responsive tasarım (desktop çalışıyor)
   - Public sayfa yapısı (ana sayfa, şirket listesi, detay sayfaları)
   - Admin panel temel yapısı

3. **Backend & API**
   - RESTful API endpoints (companies, reviews, domains)
   - Server Actions (form submissions)
   - Image upload (Cloudinary entegrasyonu)
   - Google Maps API entegrasyonu
   - Google Places API (şirket bilgileri çekme)

4. **Yönetim Paneli**
   - Domain yönetimi (CRUD)
   - Şirket yönetimi (CRUD)
   - Kategori yönetimi
   - İnceleme (review) yönetimi
   - Google Places senkronizasyonu
   - SEO & Analitik ayarları sayfası

5. **Şirket Profil Sistemi**
   - Logo ve kapak görseli yükleme
   - Fotoğraf galerisi (10 adede kadar)
   - Sosyal medya linkleri
   - İletişim bilgileri
   - Detaylı şirket bilgileri (slogan, kuruluş yılı, çalışan sayısı)

6. **İnceleme (Review) Sistemi**
   - Google Reviews entegrasyonu
   - Manuel inceleme ekleme
   - İnceleme onaylama/gizleme
   - Otomatik rating hesaplama
   - Şirket sayfalarında inceleme gösterimi

7. **Ödeme Sistemi**
   - Stripe Checkout entegrasyonu
   - Abonelik planları (Basic, Pro, Premium)
   - Webhook handling
   - Ödeme durumu takibi

---

## 🔴 Kritik Sorunlar ve Çözümler

### 1. Veritabanı Bağlantı Hatası (ÇÖZÜLDİ)
**Sorun:** Son deployment'larda "Application error: a server-side exception has occurred" hatası  
**Kök Neden:** Yeni eklenen kod değişikliklerinde (SEO ayarları, rate limiting, vb.) veritabanı bağlantısı error handling'i eksikti  
**Çözüm:** Kod çalışan versiyona (commit 72b8092) geri döndürüldü  
**Durum:** ✅ Site şu anda sorunsuz çalışıyor

### 2. Deployment Senkronizasyon Sorunu (ÇÖZÜLDİ)
**Sorun:** GitHub push'ları Vercel'de otomatik deployment tetiklemiyor  
**Kök Neden:** Webhook veya branch yapılandırması  
**Çözüm:** Manuel boş commit ile deployment tetiklendi  
**Durum:** ✅ Deployment pipeline çalışıyor

---

## 🎯 Öncelikli Geliştirme Planı

### 🔴 PHASE 1: Kritik Güvenlik ve Stabilite (1-2 Gün)

#### A. Tenant İzolasyonu Güçlendirme
**Öncelik:** ⚠️ KRİTİK

1. **Row-Level Security (RLS) Implementasyonu**
   ```sql
   -- Her tablo için RLS politikası
   ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
   CREATE POLICY tenant_isolation ON companies
     USING (domain_id = current_setting('app.domain_id')::int);
   ```

2. **Prisma Middleware - Tenant Guard**
   ```typescript
   // lib/prisma-tenant-guard.ts
   prisma.$use(async (params, next) => {
     const tenantId = await getTenantId();
     if (!tenantId) throw new Error('Tenant not found');
     // Tüm sorgulara tenantId filtresi ekle
     return next(params);
   });
   ```

3. **API Route Guard Helper**
   ```typescript
   // lib/require-tenant.ts
   export async function requireTenant(req: Request) {
     const host = req.headers.get('host');
     const domain = await prisma.domain.findUnique({
       where: { domain: host }
     });
     if (!domain) throw new Error('Invalid domain');
     return domain;
   }
   ```

#### B. Authentication & Authorization Sertleştirme
**Öncelik:** ⚠️ KRİTİK

1. **NextAuth Konfigürasyonu Güçlendirme**
   - CSRF token validation
   - Secure cookie settings (HttpOnly, Secure, SameSite)
   - Session fixation koruması
   - Brute-force protection (rate limiting)

2. **RBAC (Role-Based Access Control)**
   ```typescript
   enum Role {
     SUPER_ADMIN,  // Tüm domainlere erişim
     ADMIN,        // Seçili domainlere erişim
     EDITOR,       // İçerik düzenleme
     COMPANY_OWNER // Sadece kendi şirketi
   }
   ```

3. **Admin Route Protection**
   ```typescript
   // middleware.ts
   export async function middleware(request: NextRequest) {
     const session = await getServerSession();
     if (!session || !hasAdminRole(session.user)) {
       return NextResponse.redirect('/login');
     }
   }
   ```

#### C. Rate Limiting ve DDoS Koruması
**Öncelik:** 🟡 YÜKSEK

1. **API Rate Limiting**
   - Upstash Redis ile rate limiting
   - IP-based throttling
   - Endpoint-specific limits

2. **Google API Quota Management**
   - Places API günlük limit takibi
   - Exponential backoff retry stratejisi
   - Circuit breaker pattern

---

### 🟡 PHASE 2: Kullanıcı Deneyimi İyileştirmeleri (3-5 Gün)

#### A. Mobile Responsive Düzeltmeleri
**Öncelik:** 🟡 YÜKSEK

1. **Mobile Navigation Menu**
   - Hamburger menu
   - Touch-friendly navigation
   - Smooth animations

2. **Mobile-First Component Revisions**
   - Şirket kartları
   - Arama formu
   - Footer layout

#### B. Loading States ve Skeleton Screens
**Öncelik:** 🟡 YÜKSEK

1. **Loading Spinner Components**
2. **Skeleton Cards** (şirket listesi, kategoriler)
3. **Progressive Loading** (lazy loading images)

#### C. Empty States
**Öncelik:** 🟢 ORTA

1. **Boş Liste Durumları**
   - "Henüz şirket eklenmemiş"
   - "Arama sonucu bulunamadı"
   - Call-to-action butonları

#### D. Form Validation Enhancement
**Öncelik:** 🟢 ORTA

1. **React Hook Form + Zod Integration**
2. **User-Friendly Error Messages** (Türkçe/Fransızca)
3. **Real-time Validation Feedback**

---

### 🟢 PHASE 3: SEO ve Performans (1 Hafta)

#### A. SEO Optimizasyonu
**Öncelik:** 🟡 YÜKSEK

1. **Dinamik Sitemap.xml**
   - Her domain için ayrı sitemap
   - Şirket sayfaları
   - Kategori sayfaları
   - Otomatik güncelleme (cron job)

2. **Robots.txt Yönetimi**
   - Domain-bazlı robots.txt
   - Crawl budget optimizasyonu

3. **Structured Data (Schema.org)**
   ```json
   {
     "@type": "LocalBusiness",
     "name": "Şirket Adı",
     "address": {...},
     "aggregateRating": {...}
   }
   ```

4. **Meta Tags Optimizasyonu**
   - Domain-specific title/description
   - Open Graph tags
   - Twitter Card tags
   - Canonical URLs

#### B. Performans İyileştirmeleri
**Öncelik:** 🟢 ORTA

1. **Image Optimization**
   - next/image migration
   - WebP/AVIF format conversion
   - Lazy loading

2. **Database Query Optimization**
   - Missing indexes ekleme
   - N+1 query problemleri çözme
   - Connection pooling

3. **Caching Strategy**
   - Redis cache layer
   - Per-tenant cache keys
   - ISR (Incremental Static Regeneration)

---

### 🔵 PHASE 4: Admin Panel Enhancement (1 Hafta)

#### A. Bulk Operations
**Öncelik:** 🟡 YÜKSEK

1. **Multi-Select System**
2. **Bulk Delete/Activate/Deactivate**
3. **Bulk Domain Assignment**
4. **Progress Indicators**

#### B. Export Functionality
**Öncelik:** 🟡 YÜKSEK

1. **CSV Export** (şirketler, yorumlar)
2. **Excel Export** (formatting ile)
3. **PDF Reports**
4. **Export Filters** (tarih, domain, durum)

#### C. Advanced Filtering
**Öncelik:** 🟢 ORTA

1. **Date Range Filter**
2. **Domain Filter**
3. **Status Filter**
4. **Category Filter**
5. **Save Filter Presets**

#### D. Analytics Dashboard
**Öncelik:** 🔵 DÜŞÜK

1. **Company Growth Charts**
2. **Domain Performance Metrics**
3. **Review Statistics**
4. **User Activity Tracking**

---

### 🟣 PHASE 5: Feature Completion (2 Hafta)

#### A. Email System
**Öncelik:** 🟡 YÜKSEK

1. **Email Verification Flow**
2. **Password Reset**
3. **Welcome Emails**
4. **Admin Notification Emails**
5. **Resend Integration**

#### B. Company Self-Service Enhancement
**Öncelik:** 🟢 ORTA

1. **Company Dashboard**
2. **Profile Completion Wizard**
3. **Image Upload with Preview**
4. **Business Hours Management**

#### C. Review System Enhancement
**Öncelik:** 🟢 ORTA

1. **Review Response Feature**
2. **Review Analytics**
3. **Google Reviews Sync Improvement**

#### D. Legal Pages Management
**Öncelik:** 🟢 ORTA

1. **Dynamic Legal Pages Editor**
2. **Multi-Language Legal Content**
3. **GDPR Compliance Tools**
4. **Privacy Policy Generator**

---

## 🧪 Testing ve DevOps

### A. Test Altyapısı
**Öncelik:** 🟡 YÜKSEK

1. **Unit Tests** (Jest + Testing Library)
2. **Integration Tests** (API endpoints)
3. **E2E Tests** (Playwright)
   - Multi-tenant scenarios
   - Admin workflows
   - Company registration flow

### B. CI/CD Pipeline
**Öncelik:** 🟡 YÜKSEK

1. **GitHub Actions**
   - Automated tests
   - Build verification
   - Deployment automation

2. **Code Quality Tools**
   - ESLint configuration
   - Prettier formatting
   - TypeScript strict mode

---

## 🔐 Güvenlik Checklist

### Kritik Güvenlik Maddeleri

- [ ] **RLS (Row-Level Security)** aktif ve test edilmiş
- [ ] **Tenant izolasyonu** her API endpoint'te zorunlu
- [ ] **RBAC** tamamlanmış ve admin rotaları korumalı
- [ ] **Rate limiting** aktif (API + Google Maps)
- [ ] **CSRF protection** tüm formlarda
- [ ] **Secure cookies** (HttpOnly, Secure, SameSite)
- [ ] **Environment variables** güvenli (Vercel Secrets)
- [ ] **API keys** kısıtlı (domain/IP whitelist)
- [ ] **SQL injection** koruması (Prisma ORM)
- [ ] **XSS protection** (input sanitization)
- [ ] **Brute-force protection** (login rate limiting)
- [ ] **Default admin credentials** kaldırılmış

---

## 📊 Gözlemlenebilirlik ve Monitoring

### A. Logging
**Öncelik:** 🟡 YÜKSEK

1. **Structured Logging**
   ```typescript
   logger.info('Company created', {
     tenantId,
     companyId,
     userId,
     timestamp
   });
   ```

2. **Log Aggregation**
   - Vercel Logs
   - Logtail/Datadog integration

### B. Error Tracking
**Öncelik:** 🟡 YÜKSEK

1. **Sentry Integration**
   - Frontend errors
   - API errors
   - Edge function errors
   - Tenant context tagging

### C. Performance Monitoring
**Öncelik:** 🟢 ORTA

1. **Vercel Analytics**
2. **Core Web Vitals Tracking**
   - TTFB < 200ms
   - LCP < 2.5s
   - CLS < 0.1

---

## 🔄 Backup ve Disaster Recovery

### A. Database Backup
**Öncelik:** 🟡 YÜKSEK

1. **Automated Daily Backups**
2. **Retention Policy** (7 günlük, 30 günlük)
3. **Encrypted Backups**
4. **Restore Testing** (aylık)

### B. Media Backup
**Öncelik:** 🟢 ORTA

1. **Cloudinary Backup**
2. **S3 Lifecycle Policy**
3. **Cold Storage** (eski görseller)

---

## 📝 Dokümantasyon İhtiyaçları

### A. Teknik Dokümantasyon
**Öncelik:** 🟡 YÜKSEK

1. **README.md**
   - Kurulum adımları
   - Environment variables tablosu
   - İlk admin oluşturma

2. **DEPLOYMENT.md**
   - Vercel deployment guide
   - Domain ekleme prosedürü
   - SSL sertifika yönetimi

3. **API.md**
   - API endpoint'leri
   - Authentication
   - Rate limits

### B. Operasyonel Dokümantasyon
**Öncelik:** 🟢 ORTA

1. **RUNBOOK.md**
   - Tenant ekleme/silme
   - Backup restore
   - Common issues

2. **SECURITY.md**
   - Security best practices
   - Incident response
   - Key rotation

---

## 🚀 7 Günlük Hızlı Uygulama Planı

### Gün 1-2: Kritik Güvenlik
- [ ] RLS implementasyonu
- [ ] Prisma tenant guard middleware
- [ ] API route protection
- [ ] NextAuth RBAC

### Gün 3: Rate Limiting ve Monitoring
- [ ] Upstash Redis rate limiting
- [ ] Sentry integration
- [ ] Structured logging

### Gün 4: SEO Temel Paket
- [ ] Dinamik sitemap.xml
- [ ] Robots.txt
- [ ] Canonical URLs
- [ ] Schema.org structured data

### Gün 5: Mobile UX
- [ ] Mobile navigation menu
- [ ] Responsive fixes
- [ ] Loading states
- [ ] Empty states

### Gün 6: Admin Panel İyileştirmeleri
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Advanced filtering

### Gün 7: Testing ve Deployment
- [ ] E2E smoke tests
- [ ] Production checklist
- [ ] Final deployment

---

## 🎯 Başarı Metrikleri

### Teknik Metrikler
- **Uptime:** > 99.9%
- **TTFB:** < 200ms
- **LCP:** < 2.5s
- **API Response Time:** < 500ms
- **Error Rate:** < 0.1%

### İş Metrikleri
- **Kayıtlı Şirket Sayısı:** Hedef 1000+
- **Domain Başına Ortalama Şirket:** 50+
- **Aylık Aktif Kullanıcı:** Hedef 10,000+
- **Dönüşüm Oranı:** > 5%

---

## 📞 Destek ve İletişim

### Teknik Destek
- **GitHub Issues:** Hata raporları ve özellik talepleri
- **Email:** mikail@lekesiz.org
- **Dokümantasyon:** /docs klasörü

### Acil Durum Prosedürü
1. Vercel Dashboard → Rollback to last working deployment
2. Database restore (son yedekten)
3. DNS failover (gerekirse)
4. Incident report oluştur

---

## 🔄 Versiyon Geçmişi

### v1.0.0 (Mevcut - 15 Ekim 2025)
- ✅ Multi-tenant altyapı
- ✅ 20+ domain yönetimi
- ✅ Temel CRUD işlemleri
- ✅ Google Maps/Places entegrasyonu
- ✅ Stripe ödeme sistemi
- ✅ Admin paneli
- ✅ SEO & Analitik ayarları

### v1.1.0 (Planlanan - 22 Ekim 2025)
- 🔄 RLS ve güvenlik sertleştirme
- 🔄 Mobile responsive iyileştirmeleri
- 🔄 SEO optimizasyonu
- 🔄 Performance improvements

### v1.2.0 (Planlanan - 5 Kasım 2025)
- 📋 Email sistem
- 📋 Advanced admin features
- 📋 Testing altyapısı
- 📋 GDPR compliance tools

---

## 🎓 Öğrenilen Dersler

### Başarılı Olan Yaklaşımlar
1. **Monolithic multi-tenant architecture** - Hızlı başlangıç için ideal
2. **Vercel deployment** - Kolay ve hızlı
3. **Prisma ORM** - Type-safe ve developer-friendly
4. **Domain-based tenant resolution** - Basit ve etkili

### İyileştirme Gereken Alanlar
1. **Error handling** - Daha kapsamlı try-catch blokları
2. **Testing** - Otomatik test coverage artırılmalı
3. **Documentation** - Operasyonel dokümantasyon eksik
4. **Monitoring** - Proactive monitoring gerekli

---

## 📚 Referanslar

### Teknik Dokümantasyon
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

### Best Practices
- [Multi-Tenant Architecture Patterns](https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/multi-tenant-architecture.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web.dev Performance](https://web.dev/performance/)

---

**Son Güncelleme:** 15 Ekim 2025  
**Hazırlayan:** Manus AI  
**Onaylayan:** Mikail Lekesiz

