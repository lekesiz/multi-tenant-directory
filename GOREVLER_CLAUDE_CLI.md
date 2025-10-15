# Claude Code CLI - Görev Listesi (Sprint 1)

**Rol:** Frontend, UI/UX, Bileşenler Geliştirici  
**Tarih:** 15 Ekim 2025  
**Sprint Süresi:** 2-3 gün

---

## 🎯 Genel Sorumluluklar

- Frontend bileşen geliştirme
- UI/UX iyileştirmeleri
- Kullanıcı etkileşimleri
- Responsive tasarım
- **Vercel ve deployment bilgisi YOK** (Manus AI halleder)

---

## 🔴 Kritik Öncelik (Bugün - 6 saat)

### 1. Statik/Yasal Sayfalar (404 Hatası) ✅ İLK GÖREV
**Dosyalar:**
- `src/app/legal/[slug]/page.tsx` (oluştur)

**Problem:**
- `/legal/mentions-legales` → 404
- `/legal/politique-de-confidentialite` → 404
- `/legal/cgu` → 404

**Çözüm:**
```tsx
// src/app/legal/[slug]/page.tsx
export default async function LegalPage({ params }) {
  const { slug } = await params;
  
  const legalPage = await prisma.legalPage.findFirst({
    where: {
      slug,
      domainId: domain.id
    }
  });
  
  if (!legalPage) {
    notFound();
  }
  
  return (
    <div className="container mx-auto py-12">
      <h1>{legalPage.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: legalPage.content }} />
    </div>
  );
}
```

**Test:**
```bash
# Sayfaları test et
curl https://haguenau.pro/legal/mentions-legales
# 200 OK dönmeli, 404 değil
```

---

### 2. Cookie Consent Banner
**Dosyalar:**
- `src/components/CookieBanner.tsx` (yeni)
- `src/app/layout.tsx` (güncelle)

**Problem:**
- Visual Studio raporunda: "CLAUDE.md'de tamamlandı ama kodda YOK!"
- GDPR uyumsuzluğu riski

**Çözüm:**
```tsx
// CookieBanner.tsx
'use client';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(true);
  
  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };
  
  if (!isVisible || typeof window !== 'undefined' && localStorage.getItem('cookieConsent')) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <p>Nous utilisons des cookies pour améliorer votre expérience.</p>
        <button onClick={acceptCookies} className="bg-blue-600 px-4 py-2 rounded">
          Accepter
        </button>
      </div>
    </div>
  );
}
```

**Test:**
- Siteyi incognito'da aç
- Banner görünmeli
- "Accepter" butonuna tıkla
- Banner kaybolmalı
- Sayfayı yenile, banner tekrar çıkmamalı

---

## 🟡 Yüksek Öncelik (Yarın - 5 saat)

### 3. Yorumlar Bölümü (Şirket Detay)
**Dosyalar:**
- `src/app/companies/[slug]/page.tsx` (güncelle)
- `src/components/CompanyReviews.tsx` (zaten var, entegre et)

**Problem:**
- Şirket detay sayfasında yorumlar gösterilmiyor
- `CompanyReviews` bileşeni var ama kullanılmıyor

**Çözüm:**
```tsx
// companies/[slug]/page.tsx içinde
import CompanyReviews from '@/components/CompanyReviews';

// Şirket bilgilerinden sonra ekle:
<section className="mt-12">
  <h2 className="text-2xl font-bold mb-6">Avis Clients</h2>
  <CompanyReviews companyId={company.id} />
</section>
```

**Test:**
- NETZ Informatique sayfasını aç
- Yorumlar bölümü görünmeli
- Rating, yorum metni, tarih gösterilmeli

---

### 4. Google Maps Entegrasyonu
**Dosyalar:**
- `src/components/CompanyMap.tsx` (yeni)
- `src/app/companies/[slug]/page.tsx` (güncelle)

**Problem:**
- Harita sadece placeholder gösteriyor
- Gerçek Google Maps yok

**Çözüm:**
```bash
# Önce paketi yükle
npm install @react-google-maps/api
```

```tsx
// CompanyMap.tsx
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

export function CompanyMap({ lat, lng, name }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  });
  
  if (!isLoaded) return <div>Chargement de la carte...</div>;
  
  return (
    <GoogleMap
      center={{ lat, lng }}
      zoom={15}
      mapContainerStyle={{ width: '100%', height: '400px' }}
    >
      <Marker position={{ lat, lng }} title={name} />
    </GoogleMap>
  );
}
```

**Test:**
- Şirket sayfasında harita görünmeli
- Marker doğru konumda olmalı
- Zoom çalışmalı

---

## 🟢 Orta Öncelik (2-3 gün sonra)

### 5. Şirket Detay Eksik Bölümler
**Dosyalar:**
- `src/components/CompanyOpeningHours.tsx` (yeni)
- `src/components/CompanyGallery.tsx` (yeni)
- `src/components/CompanySocialLinks.tsx` (yeni)

**Görevler:**
1. **Çalışma Saatleri:** `openingHours` JSON'unu parse et
2. **Fotoğraf Galerisi:** `gallery` array'ini lightbox ile göster
3. **Sosyal Medya:** Facebook, Instagram, LinkedIn linkleri

---

### 6. Mobile Responsive İyileştirmeleri
**Dosyalar:**
- Tüm sayfalar
- `src/components/MobileMenu.tsx` (test et)

**Görevler:**
1. Mobil cihazlarda tüm sayfaları test et
2. Touch-friendly butonlar
3. Hamburger menü çalışıyor mu?

---

## 📋 Git Workflow (ÖNEMLİ!)

### Her Görev Öncesi:
```bash
cd /home/ubuntu/multi-tenant-directory
git pull origin main
# Manus AI ve VS Code'un değişikliklerini al
```

### Görev Tamamlandıktan Sonra:
```bash
git add .
git commit -m "feat: [görev açıklaması]"
git push origin main
```

### Conflict Olursa:
```bash
# Manus AI'ya haber ver
# Conflict'i birlikte çöz
```

---

## ⚠️ Önemli Notlar

- **Vercel deployment'ı DOKUNMA!** Manus AI halleder
- **Database migration YAPMA!** Manus AI halleder
- **Environment variables ekleme!** Manus AI halleder
- Sadece frontend kod yaz ve test et

---

## ✅ Başarı Kriterleri

- [ ] Yasal sayfalar 404 vermiyor
- [ ] Cookie banner çalışıyor
- [ ] Yorumlar görünüyor
- [ ] Google Maps çalışıyor
- [ ] Şirket detay zenginleştirilmiş
- [ ] Mobile responsive sorunsuz

---

## 🚀 Terminal'e Yapıştırılacak Komut

```bash
cd /home/ubuntu/multi-tenant-directory && git pull origin main && echo "=== CLAUDE CODE CLI GÖREVLER ===" && cat GOREVLER_CLAUDE_CLI.md && echo "\n\n🎯 İLK GÖREV: Yasal sayfalar (404 hatası)" && echo "📁 Dosya: src/app/legal/[slug]/page.tsx"
```

**İyi çalışmalar! 🚀**

