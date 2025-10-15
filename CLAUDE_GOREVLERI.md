# Claude AI - Görev Listesi ve Komutlar

## Terminal'e Yapıştırılacak Komut

```bash
cd /home/ubuntu/multi-tenant-directory && git pull origin main && cat TODO.md && echo "\n\n=== SENIN GÖREVLERİN ===" && echo "1. Statik/Yasal Sayfalar (404 Hatası)" && echo "2. Yorumlar Bölümü (Şirket Detay)" && echo "3. Google Maps Entegrasyonu" && echo "4. Şirket Detay Eksik Bölümler" && echo "5. Mobile Responsive İyileştirmeleri" && echo "\nManus AI ile paralel çalışıyorsun. Her commit öncesi 'git pull origin main' yap!"
```

---

## Senin Görevlerin (Claude AI)

### 🔴 Kritik: Görev 1 - Statik/Yasal Sayfalar
**Dosyalar:**
- `src/app/legal/[slug]/page.tsx` (oluştur)
- `src/app/api/legal-pages/route.ts` (zaten var, kontrol et)

**Yapılacaklar:**
1. `/legal/mentions-legales` sayfası oluştur
2. `/legal/politique-de-confidentialite` sayfası oluştur  
3. `/legal/cgu` sayfası oluştur
4. Database'den yasal sayfa içeriğini çek
5. Markdown render et
6. SEO meta tags ekle

**Test:**
```bash
# Sayfaları test et
curl https://haguenau.pro/legal/mentions-legales
curl https://haguenau.pro/legal/politique-de-confidentialite
```

---

### 🟡 Yüksek: Görev 2 - Yorumlar Bölümü
**Dosyalar:**
- `src/app/companies/[slug]/page.tsx` (güncelle)
- `src/components/CompanyReviews.tsx` (zaten var, entegre et)

**Yapılacaklar:**
1. `CompanyReviews` bileşenini şirket detay sayfasına ekle
2. Yorumları listele (rating, metin, tarih, yazar)
3. "Henüz yorum yok" empty state ekle
4. Yorum ekleme formu ekle (opsiyonel)

**Örnek Kod:**
```tsx
import CompanyReviews from '@/components/CompanyReviews'

// Şirket detay sayfasında
<CompanyReviews companyId={company.id} />
```

---

### 🟡 Yüksek: Görev 3 - Google Maps Entegrasyonu
**Dosyalar:**
- `src/components/CompanyMap.tsx` (yeni oluştur)
- `.env.example` (GOOGLE_MAPS_API_KEY ekle)

**Yapılacaklar:**
1. Google Maps React component oluştur
2. Şirket koordinatlarını kullan (latitude, longitude)
3. Marker ekle
4. API key environment variable'dan al
5. Şirket detay sayfasına entegre et

**Örnek Kod:**
```tsx
// CompanyMap.tsx
import { GoogleMap, Marker } from '@react-google-maps/api'

export function CompanyMap({ lat, lng, name }) {
  // Google Maps implementasyonu
}
```

---

### 🟢 Orta: Görev 4 - Şirket Detay Eksik Bölümler
**Dosyalar:**
- `src/app/companies/[slug]/page.tsx`
- `src/components/CompanyOpeningHours.tsx` (yeni)
- `src/components/CompanyGallery.tsx` (yeni)
- `src/components/CompanySocialLinks.tsx` (yeni)

**Yapılacaklar:**
1. **Çalışma Saatleri:** Database'deki `openingHours` JSON'unu parse et ve göster
2. **Fotoğraf Galerisi:** `gallery` array'ini kullan, lightbox ile göster
3. **Sosyal Medya:** Facebook, Instagram, LinkedIn linklerini göster
4. **Breadcrumb:** Ana Sayfa > Annuaire > Kategori > Şirket

---

### 🔵 Düşük: Görev 5 - Mobile Responsive
**Dosyalar:**
- Tüm sayfalar
- `src/components/MobileMenu.tsx` (zaten var, test et)

**Yapılacaklar:**
1. Mobil cihazlarda tüm sayfaları test et
2. Touch-friendly butonlar
3. Hamburger menü çalışıyor mu kontrol et

---

## Önemli Notlar

### Git Workflow
```bash
# Her görev öncesi
git pull origin main

# Görev tamamlandıktan sonra
git add .
git commit -m "feat: [görev açıklaması]"
git push origin main
```

### Manus AI ile Koordinasyon
- Manus AI şu anda: Admin güvenlik, SEO, arama, istatistikler üzerinde çalışıyor
- Farklı dosyalarda çalışmaya özen göster
- Conflict olursa hemen bildir

### Test Komutları
```bash
# TypeScript kontrolü
npx tsc --noEmit

# Build test
npm run build

# Local test
npm run dev
```

---

## Başarı Kriterleri

- [ ] Tüm yasal sayfalar 404 vermiyor
- [ ] Şirket detay sayfasında yorumlar görünüyor
- [ ] Google Maps çalışıyor
- [ ] Şirket detay sayfası zenginleştirilmiş
- [ ] Mobile responsive sorunsuz

**İyi çalışmalar! 🚀**

