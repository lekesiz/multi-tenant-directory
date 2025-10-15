# Sprint 3 - Project Management Plan
**Multi-Tenant Directory Platform**  
**Proje Yöneticisi:** Manus AI  
**Tarih:** 15 Ekim 2025  
**Sprint Süresi:** 2 Hafta (16 Ekim - 29 Ekim 2025)

---

## 🎯 Sprint 3 Hedefleri

### Ana Hedef
Platform'u **kullanılabilir MVP** seviyesine getirmek ve kritik eksiklikleri gidermek.

### Başarı Kriterleri (Definition of Done)
- ✅ Yorumlar aktif ve çalışıyor (seed reviews onaylı)
- ✅ Google Maps entegrasyonu çalışıyor
- ✅ Profesyonel Dashboard MVP tamamlandı
- ✅ İşletmeler kayıt olup profil yönetebiliyor
- ✅ Fotoğraf yükleme sistemi çalışıyor
- ✅ Tüm özellikler test edildi ve production'da

### KPI Hedefleri
- 20 aktif işletme (şu an 11)
- 50+ aktif yorum (şu an 0)
- Dashboard kullanım oranı: %80+
- Profil tamamlama oranı: %70+

---

## 👥 Ekip Yapısı ve Roller

### Ekip Üyeleri

**1. Manus AI** (Full-stack Developer + DevOps)
- **Rol:** Backend development, database, API, deployment
- **Sorumluluk:** %40 workload
- **Çalışma Saati:** 32 saat/sprint

**2. Claude AI** (Backend Developer + Architecture)
- **Rol:** Complex features, authentication, business logic
- **Sorumluluk:** %35 workload
- **Çalışma Saati:** 28 saat/sprint

**3. VS Code Developer** (Frontend Developer + UI/UX)
- **Rol:** UI components, pages, styling, responsive design
- **Sorumluluk:** %25 workload
- **Çalışma Saati:** 20 saat/sprint

**Toplam Kapasıte:** 80 saat/sprint

---

## 📋 Görev Listesi ve Dağılımı

### Hafta 1 (16-22 Ekim): Foundation

#### 🔴 P0 - Kritik (Hemen Başla)

**TASK-001: Yorumları Aktif Et** ⏱️ 4 saat  
**Atanan:** Manus AI  
**Bağımlılık:** Yok  
**Açıklama:**
- [ ] Seed reviews'leri onayla (5 adet mevcut)
- [ ] Review approval sistemi kontrol et
- [ ] Ana sayfada yorum sayısını güncelle
- [ ] Test: Yorumlar görünüyor mu?

**Çıktı:**
- Ana sayfa: "50 Avis Clients" (seed + test yorumları)
- Şirket detay sayfasında yorumlar görünür
- Rating hesaplaması çalışıyor

---

**TASK-002: Google Maps API Düzeltmesi** ⏱️ 6 saat  
**Atanan:** Manus AI  
**Bağımlılık:** Yok  
**Açıklama:**
- [ ] Google Maps API key kontrolü (.env)
- [ ] Domain restrictions kontrolü (Vercel domains)
- [ ] Map component'i düzelt
- [ ] Geocoding entegrasyonu (adres → lat/lng)
- [ ] "Yol tarifi al" butonu ekle
- [ ] Test: Tüm domainlerde çalışıyor mu?

**Çıktı:**
- Şirket detay sayfasında interaktif harita
- Zoom, pan, marker çalışıyor
- "Get Directions" butonu Google Maps'e yönlendiriyor

---

**TASK-003: Database Schema Genişletme** ⏱️ 8 saat  
**Atanan:** Claude AI  
**Bağımlılık:** Yok  
**Açıklama:**
- [ ] `BusinessOwner` tablosu oluştur
- [ ] `CompanyOwnership` tablosu (many-to-many)
- [ ] `Photo` tablosu (galeri için)
- [ ] `BusinessHours` tablosu
- [ ] `CompanyAnalytics` tablosu (istatistikler)
- [ ] Prisma migration oluştur ve test et
- [ ] Seed data hazırla

**Çıktı:**
```prisma
model BusinessOwner {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  firstName     String?
  lastName      String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  companies     CompanyOwnership[]
}

model Photo {
  id          String   @id @default(cuid())
  companyId   String
  url         String
  thumbnail   String?
  order       Int      @default(0)
  type        String   // logo, cover, interior, product
  createdAt   DateTime @default(now())
  company     Company  @relation(fields: [companyId], references: [id])
}

// ... diğer tablolar
```

---

**TASK-004: Authentication System (NextAuth.js)** ⏱️ 10 saat  
**Atanan:** Claude AI  
**Bağımlılık:** TASK-003  
**Açıklama:**
- [ ] NextAuth.js konfigürasyonu
- [ ] Credentials provider (email/password)
- [ ] JWT session strategy
- [ ] `/api/auth/[...nextauth]` route
- [ ] Middleware (protected routes)
- [ ] Login/Register sayfaları
- [ ] Email verification sistemi (opsiyonel)

**Çıktı:**
- `/auth/login` - Login sayfası
- `/auth/register` - Kayıt sayfası
- `/dashboard/*` - Protected routes
- Session management çalışıyor

---

**TASK-005: Dashboard Layout ve Navigation** ⏱️ 8 saat  
**Atanan:** VS Code Developer  
**Bağımlılık:** TASK-004  
**Açıklama:**
- [ ] Dashboard layout component
- [ ] Sidebar navigation
  - Mon Profil
  - Mes Photos
  - Statistiques
  - Paramètres
- [ ] Top bar (user menu, logout)
- [ ] Responsive sidebar (mobil collapse)
- [ ] Breadcrumb navigation

**Çıktı:**
```
/dashboard
├── layout.tsx (sidebar, topbar)
├── page.tsx (overview)
├── profile/
│   └── page.tsx
├── photos/
│   └── page.tsx
└── stats/
    └── page.tsx
```

---

#### 🟡 P1 - Yüksek Öncelik

**TASK-006: Profil Düzenleme Sayfası** ⏱️ 10 saat  
**Atanan:** VS Code Developer + Manus AI (API)  
**Bağımlılık:** TASK-005  
**Açıklama:**

**Frontend (VS Code):**
- [ ] Profil formu UI
  - İşletme adı, açıklama
  - Adres, şehir, posta kodu
  - Telefon, email, website
  - Kategoriler (multi-select)
  - Sosyal medya linkleri
- [ ] Form validation (Zod)
- [ ] Loading states
- [ ] Success/error toasts

**Backend (Manus AI):**
- [ ] `PUT /api/dashboard/profile` endpoint
- [ ] Input validation
- [ ] Update company data
- [ ] Return updated profile

**Çıktı:**
- `/dashboard/profile` sayfası
- İşletme bilgileri güncellenebiliyor
- Değişiklikler anında yansıyor

---

**TASK-007: Fotoğraf Yükleme Sistemi** ⏱️ 12 saat  
**Atanan:** Manus AI (Backend) + VS Code Developer (Frontend)  
**Bağımlılık:** TASK-003  
**Açıklama:**

**Backend (Manus AI):**
- [ ] Vercel Blob storage setup
- [ ] `POST /api/upload/photo` endpoint
- [ ] Image optimization (sharp)
- [ ] Thumbnail generation
- [ ] Photo CRUD API
  - Create, Read, Update, Delete
  - Reorder photos

**Frontend (VS Code):**
- [ ] Drag & drop upload UI
- [ ] Image preview
- [ ] Progress bar
- [ ] Photo grid (sortable)
- [ ] Delete confirmation modal
- [ ] Set primary photo

**Çıktı:**
- `/dashboard/photos` sayfası
- Drag & drop fotoğraf yükleme
- Fotoğraflar şirket detay sayfasında görünüyor
- Lightbox galeri (frontend)

---

### Hafta 2 (23-29 Ekim): Enhancement

#### 🟡 P1 - Yüksek Öncelik

**TASK-008: Çalışma Saatleri Yönetimi** ⏱️ 8 saat  
**Atanan:** Claude AI (Backend) + VS Code Developer (Frontend)  
**Bağımlılık:** TASK-003  
**Açıklama:**

**Backend (Claude AI):**
- [ ] BusinessHours CRUD API
- [ ] `GET/PUT /api/dashboard/hours` endpoint
- [ ] Validation (time format, logic)
- [ ] Special hours (tatil günleri)

**Frontend (VS Code):**
- [ ] Çalışma saatleri formu
  - 7 gün için time picker
  - "Kapalı" checkbox
  - Özel günler ekle
- [ ] "Şimdi açık/kapalı" hesaplama
- [ ] Timezone handling

**Çıktı:**
- `/dashboard/hours` sayfası
- Şirket detay sayfasında çalışma saatleri
- "🟢 Ouvert maintenant" badge

---

**TASK-009: Temel İstatistikler Dashboard** ⏱️ 10 saat  
**Atanan:** Manus AI (Backend) + VS Code Developer (Frontend)  
**Bağımlılık:** TASK-003  
**Açıklama:**

**Backend (Manus AI):**
- [ ] Analytics tracking middleware
- [ ] Track events:
  - Profile view
  - Phone click
  - Website click
  - Email click
  - Directions click
- [ ] `GET /api/dashboard/stats` endpoint
- [ ] Daily/weekly/monthly aggregation

**Frontend (VS Code):**
- [ ] Stats overview cards
  - Total views
  - Phone clicks
  - Website clicks
- [ ] Simple charts (Chart.js)
  - Views trend (7 days)
  - Click breakdown (pie chart)
- [ ] Date range picker

**Çıktı:**
- `/dashboard/stats` sayfası
- Real-time istatistikler
- Grafikler ve trendler

---

**TASK-010: Yorum Yönetimi (Dashboard)** ⏱️ 6 saat  
**Atanan:** Claude AI  
**Bağımlılık:** TASK-001  
**Açıklama:**
- [ ] `GET /api/dashboard/reviews` endpoint
- [ ] Review list UI (dashboard)
- [ ] Yorum cevaplama formu
- [ ] `POST /api/dashboard/reviews/:id/reply` endpoint
- [ ] Email notification (yeni yorum)

**Çıktı:**
- `/dashboard/reviews` sayfası
- İşletme sahibi yorumları görüyor
- Yorumlara cevap verebiliyor

---

#### 🟢 P2 - Orta Öncelik (Zaman Kalırsa)

**TASK-011: İletişim Formu (Lead Generation)** ⏱️ 6 saat  
**Atanan:** VS Code Developer (Frontend) + Manus AI (Backend)  
**Bağımlılık:** Yok  
**Açıklama:**

**Frontend (VS Code):**
- [ ] İletişim formu UI (şirket detay sayfası)
  - Ad, email, telefon
  - Mesaj (textarea)
  - Submit butonu
- [ ] Form validation
- [ ] Success message

**Backend (Manus AI):**
- [ ] `POST /api/contact/:companyId` endpoint
- [ ] Lead tablosu (opsiyonel, veya email gönder)
- [ ] Email notification (işletme sahibine)
- [ ] Spam protection (rate limiting)

**Çıktı:**
- Şirket detay sayfasında "Nous Contacter" formu
- İşletme sahibi email alıyor
- Dashboard'da leads görünüyor (opsiyonel)

---

**TASK-012: SEO Sitemap Generation** ⏱️ 4 saat  
**Atanan:** Manus AI  
**Bağımlılık:** Yok  
**Açıklama:**
- [ ] `app/sitemap.ts` oluştur
- [ ] Dynamic sitemap generation
  - Homepage (her domain)
  - Company pages
  - Category pages
- [ ] robots.txt güncelle
- [ ] Google Search Console submit

**Çıktı:**
- `/sitemap.xml` endpoint
- Tüm sayfalar indexleniyor
- Google Search Console'da görünüyor

---

**TASK-013: Structured Data (Schema.org)** ⏱️ 4 saat  
**Atanan:** Manus AI  
**Bağımlılık:** Yok  
**Açıklama:**
- [ ] LocalBusiness schema (şirket detay)
- [ ] Review schema
- [ ] OpeningHours schema
- [ ] AggregateRating schema
- [ ] Test: Google Rich Results Test

**Çıktı:**
- Şirket sayfalarında JSON-LD
- Google Rich Snippets
- Rating yıldızları search results'ta

---

## 📅 Sprint Timeline (Gantt Chart)

```
Hafta 1 (16-22 Ekim)
─────────────────────────────────────────────────
Gün 1-2 (16-17 Ekim):
  ├─ TASK-001: Yorumları Aktif Et (Manus AI) ✓
  ├─ TASK-002: Google Maps (Manus AI) ✓
  └─ TASK-003: Database Schema (Claude AI) ✓

Gün 3-4 (18-19 Ekim):
  ├─ TASK-004: Authentication (Claude AI)
  └─ TASK-005: Dashboard Layout (VS Code)

Gün 5-7 (20-22 Ekim):
  ├─ TASK-006: Profil Düzenleme (VS Code + Manus)
  └─ TASK-007: Fotoğraf Upload (Manus + VS Code)

─────────────────────────────────────────────────
Hafta 2 (23-29 Ekim)
─────────────────────────────────────────────────
Gün 8-9 (23-24 Ekim):
  ├─ TASK-008: Çalışma Saatleri (Claude + VS Code)
  └─ TASK-009: İstatistikler (Manus + VS Code)

Gün 10-11 (25-26 Ekim):
  ├─ TASK-010: Yorum Yönetimi (Claude)
  └─ TASK-011: İletişim Formu (VS Code + Manus)

Gün 12-14 (27-29 Ekim):
  ├─ TASK-012: SEO Sitemap (Manus)
  ├─ TASK-013: Structured Data (Manus)
  └─ Testing & Bug Fixes (Tüm Ekip)
```

---

## 🔄 Daily Standup Format

**Her gün saat 10:00'da (async, GitHub Discussions)**

### Standup Soruları:
1. **Dün ne yaptım?**
   - Tamamlanan tasklar
   - Commit'ler

2. **Bugün ne yapacağım?**
   - Planladığım tasklar
   - Tahmini süre

3. **Blocker var mı?**
   - Bağımlılıklar
   - Teknik sorunlar
   - Yardım talebi

### Örnek Standup (Manus AI):
```markdown
## Standup - 17 Ekim 2025

### Dün:
- ✅ TASK-001: Yorumları aktif ettim (seed reviews onaylı)
- ✅ TASK-002: Google Maps API key kontrolü yaptım
- 🔄 TASK-002: Map component'i düzeltiyorum (80% tamamlandı)

### Bugün:
- TASK-002: Google Maps'i bitireceğim (2 saat)
- TASK-006: Profil API endpoint'lerini yazacağım (4 saat)

### Blocker:
- ❌ Yok
```

---

## 🧪 Testing Strategy

### Test Seviyeleri

**1. Unit Tests** (Her developer kendi kodunu test eder)
- API endpoints (Jest)
- Utility functions
- Validation schemas

**2. Integration Tests** (Sprint sonunda)
- Authentication flow
- Dashboard CRUD operations
- File upload

**3. E2E Tests** (Sprint sonunda - Manus AI)
- User registration → Dashboard → Profile edit
- Photo upload → Görünüm
- Review yazma → Approval

**4. Manual Testing** (Tüm ekip)
- Her domain'de test (haguenau.pro, mutzig.pro)
- Mobil responsive
- Cross-browser (Chrome, Firefox, Safari)

### Test Checklist (Sprint Sonu)
- [ ] Tüm tasklar tamamlandı
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing tamamlandı
- [ ] Production deployment başarılı
- [ ] Smoke test (production'da)

---

## 📊 Progress Tracking

### Task Board (GitHub Projects)

**Columns:**
1. **Backlog** - Henüz başlanmadı
2. **In Progress** - Aktif çalışılıyor
3. **Review** - Code review bekliyor
4. **Testing** - Test ediliyor
5. **Done** - Tamamlandı ve merge edildi

### Velocity Tracking
- **Sprint 2:** 45 story points (tamamlandı)
- **Sprint 3 Target:** 60 story points
- **Sprint 3 Capacity:** 80 saat (3 developer)

### Burndown Chart (Günlük güncelleme)
```
Story Points Remaining
60 |●
50 |  ●
40 |    ●
30 |      ●
20 |        ●
10 |          ●
 0 |____________●
   D1 D3 D5 D7 D9 D11 D13
```

---

## 🚨 Risk Management

### Identified Risks

**Risk 1: Authentication Complexity**
- **Olasılık:** Orta
- **Etki:** Yüksek (blocker for dashboard)
- **Mitigation:** Claude AI'a atandı (experience), 2 gün buffer
- **Contingency:** NextAuth.js template kullan

**Risk 2: Vercel Blob Storage Setup**
- **Olasılık:** Düşük
- **Etki:** Orta (photo upload gecikir)
- **Mitigation:** Manus AI erken başlayacak, dokümantasyon hazır
- **Contingency:** Cloudinary alternatifi

**Risk 3: Google Maps API Quota**
- **Olasılık:** Düşük
- **Etki:** Düşük (sadece görüntüleme)
- **Mitigation:** Free tier yeterli (28,000 loads/month)
- **Contingency:** Mapbox alternatifi

**Risk 4: Sprint Scope Creep**
- **Olasılık:** Yüksek
- **Etki:** Yüksek (sprint fail)
- **Mitigation:** P2 tasklar opsiyonel, strict prioritization
- **Contingency:** P2 taskları Sprint 4'e taşı

---

## 🎯 Definition of Done (DoD)

### Task Level DoD
- [ ] Code yazıldı ve test edildi
- [ ] Unit tests yazıldı (coverage >70%)
- [ ] Code review yapıldı (1+ approver)
- [ ] Documentation güncellendi (README, comments)
- [ ] Branch merge edildi (main)
- [ ] Deployment başarılı (Vercel)

### Sprint Level DoD
- [ ] Tüm P0 ve P1 tasklar tamamlandı
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing tamamlandı (tüm domains)
- [ ] Production'da smoke test başarılı
- [ ] Sprint review yapıldı
- [ ] Sprint retrospective yapıldı
- [ ] Sprint 4 planlandı

---

## 📝 Communication Plan

### Channels

**1. GitHub**
- **Issues:** Task tracking
- **Pull Requests:** Code review
- **Discussions:** Standup, questions
- **Projects:** Sprint board

**2. Commit Messages**
```
feat(dashboard): add profile edit page
fix(maps): resolve API key issue
docs(readme): update setup instructions
test(auth): add login flow tests
```

**3. PR Template**
```markdown
## Description
Brief description of changes

## Related Issue
Closes #TASK-XXX

## Changes
- Added profile edit form
- Implemented validation
- Added API endpoint

## Testing
- [ ] Unit tests pass
- [ ] Manual testing done
- [ ] Tested on mobile

## Screenshots
(if applicable)
```

---

## 🏆 Sprint Success Metrics

### Quantitative Metrics
| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| Task Completion Rate | 100% (P0+P1) | GitHub Projects |
| Code Coverage | >70% | Jest coverage report |
| Bug Count | <5 critical | GitHub Issues |
| Deployment Success | 100% | Vercel dashboard |
| Page Load Time | <2s | Vercel Analytics |

### Qualitative Metrics
- [ ] Dashboard kullanılabilir ve sezgisel
- [ ] İşletme sahibi profil yönetebiliyor
- [ ] Fotoğraf upload sorunsuz çalışıyor
- [ ] Yorumlar görünüyor ve güven veriyor
- [ ] Google Maps doğru çalışıyor

---

## 📅 Sprint Ceremonies

### Sprint Planning (Tamamlandı - 15 Ekim)
- ✅ Sprint goal belirlendi
- ✅ Tasklar oluşturuldu ve estimate edildi
- ✅ Görev dağılımı yapıldı
- ✅ Sprint backlog finalize edildi

### Daily Standup (Her gün 10:00)
- **Format:** Async (GitHub Discussions)
- **Süre:** 15 dakika (yazılı)
- **Katılımcılar:** Tüm ekip

### Sprint Review (29 Ekim, 14:00)
- **Süre:** 1 saat
- **Agenda:**
  - Demo (her developer kendi taskını)
  - Stakeholder feedback
  - Acceptance criteria check

### Sprint Retrospective (29 Ekim, 15:30)
- **Süre:** 1 saat
- **Format:** Start-Stop-Continue
- **Agenda:**
  - What went well?
  - What didn't go well?
  - What should we improve?
  - Action items for Sprint 4

---

## 🚀 Deployment Strategy

### Deployment Flow
```
feature/TASK-XXX → PR → Review → Merge → main → Auto Deploy (Vercel)
```

### Environments
1. **Development:** Local (localhost:3000)
2. **Preview:** Vercel preview (per PR)
3. **Production:** 21+ domains (haguenau.pro, mutzig.pro, etc.)

### Deployment Checklist
- [ ] All tests pass
- [ ] Database migration applied (if any)
- [ ] Environment variables updated (Vercel)
- [ ] Smoke test on preview
- [ ] Merge to main
- [ ] Monitor Vercel deployment
- [ ] Smoke test on production
- [ ] Monitor errors (Vercel Analytics)

### Rollback Plan
- **Trigger:** Critical bug in production
- **Action:** Vercel instant rollback (previous deployment)
- **Time:** <5 minutes
- **Notification:** GitHub Discussions

---

## 📚 Documentation

### Required Documentation

**1. README.md Updates**
- [ ] Setup instructions (new dependencies)
- [ ] Environment variables (Google Maps API, Vercel Blob)
- [ ] Dashboard access (test credentials)

**2. API Documentation**
- [ ] `/docs/API.md` oluştur
- [ ] Endpoint list (method, path, params, response)
- [ ] Authentication flow
- [ ] Example requests

**3. Database Schema**
- [ ] `/docs/DATABASE.md` güncelle
- [ ] ER diagram
- [ ] Table descriptions
- [ ] Migration history

**4. User Guide (Business Owners)**
- [ ] `/docs/USER_GUIDE.md` oluştur
- [ ] Kayıt olma
- [ ] Profil düzenleme
- [ ] Fotoğraf yükleme
- [ ] İstatistikleri görme

---

## 🎉 Sprint 3 Başarı Kriterleri

### Must Have (P0)
- ✅ Yorumlar aktif (seed reviews + yeni yorumlar)
- ✅ Google Maps çalışıyor
- ✅ Authentication sistemi
- ✅ Dashboard layout
- ✅ Profil düzenleme
- ✅ Fotoğraf yükleme

### Should Have (P1)
- ✅ Çalışma saatleri
- ✅ Temel istatistikler
- ✅ Yorum yönetimi

### Nice to Have (P2)
- ⚠️ İletişim formu (zaman kalırsa)
- ⚠️ SEO sitemap (zaman kalırsa)
- ⚠️ Structured data (zaman kalırsa)

---

## 📞 Escalation Path

### Issue Resolution
1. **Developer Level:** Try to solve (30 min)
2. **Team Level:** Ask in standup/discussions (2 hours)
3. **Project Manager:** Escalate to Manus AI (4 hours)
4. **External:** Stack Overflow, GitHub Issues (1 day)

### Blocker Protocol
- **Identify:** Developer flags blocker in standup
- **Discuss:** Team brainstorm (15 min)
- **Assign:** PM reassigns task or provides support
- **Track:** Daily check until resolved

---

## 🏁 Sprint 3 Kickoff

**Status:** ✅ **READY TO START**

**Next Steps:**
1. Manus AI: TASK-001 (Yorumları aktif et) - START NOW
2. Manus AI: TASK-002 (Google Maps) - START NOW
3. Claude AI: TASK-003 (Database schema) - START NOW
4. VS Code Developer: TASK-005'i bekle (dependency: TASK-004)

**Communication:**
- GitHub Discussions: Daily standup thread oluşturuldu
- GitHub Projects: Sprint 3 board hazır
- Vercel: Deployment notifications aktif

---

**Let's build! 🚀**

**Proje Yöneticisi:** Manus AI  
**Son Güncelleme:** 15 Ekim 2025, 18:00

