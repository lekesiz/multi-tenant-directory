# Visual Studio Code - Görev Listesi (Sprint 1)

**Rol:** Kod Kalitesi, Refactoring, Optimizasyon Uzmanı  
**Tarih:** 15 Ekim 2025  
**Sprint Süresi:** 2-3 gün

---

## 🎯 Genel Sorumluluklar

- Kod kalitesi ve refactoring
- Performance optimizasyonu
- TypeScript tip güvenliği
- Code smell tespiti ve düzeltme
- **Vercel ve deployment bilgisi YOK** (Manus AI halleder)

---

## 🔴 Kritik Öncelik (Bugün - 4 saat)

### 1. Favicon & Logo Dosyaları ✅ İLK GÖREV
**Klasör:** `public/`

**Problem:**
- Visual Studio raporunda: "Favicon & logo eksik"
- Browser tab'ında default Next.js ikonu görünüyor

**Çözüm:**
```bash
# public/ klasörüne şu dosyaları ekle:
public/
├── favicon.ico          # 32x32 veya 16x16
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png # 180x180
└── logo.png             # Site logosu
```

**Metadata Güncelleme:**
```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};
```

**Test:**
- Browser tab'ında favicon görünmeli
- Apple cihazlarda home screen icon doğru olmalı

---

### 2. TypeScript Strict Mode Hataları
**Dosyalar:** Tüm `.ts` ve `.tsx` dosyaları

**Problem:**
- Bazı dosyalarda `any` tipi kullanılıyor
- Null check'ler eksik
- Type assertion'lar güvensiz

**Çözüm:**
```bash
# TypeScript strict mode kontrolü
npx tsc --noEmit --strict

# Hataları tek tek düzelt:
# 1. any → doğru tip
# 2. null check ekle
# 3. Type guard kullan
```

**Örnek Düzeltme:**
```tsx
// ÖNCE (Hatalı)
function getCompany(id: any) {
  return prisma.company.findUnique({ where: { id } });
}

// SONRA (Doğru)
function getCompany(id: string): Promise<Company | null> {
  return prisma.company.findUnique({ where: { id } });
}
```

---

## 🟡 Yüksek Öncelik (Yarın - 5 saat)

### 3. Code Refactoring - Duplicate Code
**Dosyalar:**
- `src/app/companies/[slug]/page.tsx`
- `src/app/annuaire/page.tsx`
- `src/components/*.tsx`

**Problem:**
- Aynı kod parçaları birden fazla yerde tekrarlanıyor
- DRY (Don't Repeat Yourself) prensibi ihlal ediliyor

**Çözüm:**
```tsx
// Tekrarlanan company query'leri için utility function
// src/lib/queries/company.ts (yeni dosya)

export async function getCompanyBySlug(slug: string, domainId: string) {
  return prisma.company.findFirst({
    where: { slug, domainId },
    include: {
      categories: true,
      reviews: {
        where: { isApproved: true, isVisible: true }
      }
    }
  });
}

export async function getCompaniesByDomain(domainId: string) {
  return prisma.company.findMany({
    where: { domainId, isActive: true },
    include: { categories: true },
    orderBy: { name: 'asc' }
  });
}
```

**Test:**
- Tüm sayfalar çalışmaya devam etmeli
- Kod daha temiz ve okunabilir olmalı

---

### 4. Performance Optimization - Image Loading
**Dosyalar:**
- Tüm `<img>` tag'leri
- `src/components/CompanyCard.tsx`
- `src/components/CompanyGallery.tsx`

**Problem:**
- Bazı yerlerde `<img>` kullanılıyor
- `next/image` kullanılmalı (otomatik optimizasyon)

**Çözüm:**
```tsx
// ÖNCE (Yavaş)
<img src={company.logoUrl} alt={company.name} />

// SONRA (Hızlı)
import Image from 'next/image';

<Image 
  src={company.logoUrl} 
  alt={company.name}
  width={200}
  height={200}
  loading="lazy"
/>
```

**Test:**
- Lighthouse score kontrol et
- Performance artmalı

---

## 🟢 Orta Öncelik (2-3 gün sonra)

### 5. Error Handling İyileştirmeleri
**Dosyalar:**
- `src/app/error.tsx` (güncelle)
- Tüm API route'lar

**Problem:**
- Bazı hata durumları handle edilmiyor
- Kullanıcıya anlamlı mesaj gösterilmiyor

**Çözüm:**
```tsx
// API route'larda try-catch
try {
  const result = await someOperation();
  return NextResponse.json(result);
} catch (error) {
  console.error('Operation failed:', error);
  return NextResponse.json(
    { error: 'Une erreur est survenue' },
    { status: 500 }
  );
}
```

---

### 6. Code Comments & Documentation
**Dosyalar:** Tüm karmaşık fonksiyonlar

**Problem:**
- Bazı fonksiyonlar açıklama yok
- Karmaşık logic anlaşılması zor

**Çözüm:**
```tsx
/**
 * Fetches company details with reviews and categories
 * @param slug - Company URL slug
 * @param domainId - Current tenant domain ID
 * @returns Company object or null if not found
 */
export async function getCompanyBySlug(
  slug: string, 
  domainId: string
): Promise<Company | null> {
  // Implementation...
}
```

---

### 7. ESLint & Prettier Konfigürasyonu
**Dosyalar:**
- `.eslintrc.json` (güncelle)
- `.prettierrc` (oluştur)

**Problem:**
- Kod formatı tutarsız
- ESLint kuralları eksik

**Çözüm:**
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}

// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

**Komutlar:**
```bash
# Tüm dosyaları formatla
npx prettier --write "src/**/*.{ts,tsx}"

# ESLint hataları düzelt
npx eslint --fix "src/**/*.{ts,tsx}"
```

---

## 🔵 Düşük Öncelik (Zaman Kalırsa)

### 8. Accessibility (a11y) İyileştirmeleri
- ARIA labels ekle
- Keyboard navigation test et
- Screen reader uyumluluğu

### 9. Bundle Size Optimization
- Unused dependencies kaldır
- Code splitting optimize et
- Dynamic imports ekle

---

## 📋 Git Workflow (ÖNEMLİ!)

### Her Görev Öncesi:
```bash
cd /home/ubuntu/multi-tenant-directory
git pull origin main
# Manus AI ve Claude'un değişikliklerini al
```

### Görev Tamamlandıktan Sonra:
```bash
git add .
git commit -m "refactor: [görev açıklaması]"
# veya
git commit -m "perf: [görev açıklaması]"
git push origin main
```

---

## ⚠️ Önemli Notlar

- **Vercel deployment'ı DOKUNMA!** Manus AI halleder
- **Database schema değiştirme!** Manus AI halleder
- **Yeni özellik ekleme!** Sadece mevcut kodu iyileştir
- Refactoring yaparken fonksiyonelliği bozma!

---

## ✅ Başarı Kriterleri

- [ ] Favicon ve logo eklendi
- [ ] TypeScript strict mode hatasız
- [ ] Duplicate code temizlendi
- [ ] Tüm img → next/image
- [ ] Error handling iyileştirildi
- [ ] ESLint/Prettier konfigüre edildi
- [ ] Kod daha okunabilir ve maintainable

---

## 🚀 Başlangıç Komutu

```bash
cd /home/ubuntu/multi-tenant-directory
git pull origin main
echo "=== VISUAL STUDIO CODE GÖREVLER ===" 
cat GOREVLER_VISUAL_STUDIO.md
echo "\n🎯 İLK GÖREV: Favicon & Logo ekle"
echo "📁 Klasör: public/"
```

**İyi çalışmalar! 🎨**

