# TODO - Eksiklikler ve Yapılacaklar Listesi

## 🔴 Kritik Öncelik (Hemen Yapılmalı)

### 1. Admin Login Güvenlik Açığı
- [ ] Admin login sayfasından test credentials'ları kaldır
- [ ] Production ortamında şifre gösterimi tamamen kaldırılmalı
- [ ] Dosya: `src/app/admin/login/page.tsx`
- **Atanan:** Manus AI

### 2. Statik/Yasal Sayfalar 404 Hatası
- [ ] `/legal/mentions-legales` sayfası oluştur
- [ ] `/legal/politique-de-confidentialite` sayfası oluştur
- [ ] `/legal/cgu` sayfası oluştur
- [ ] Admin panelinden bu sayfaları düzenlenebilir hale getir
- [ ] Dosyalar: `src/app/legal/[slug]/page.tsx`
- **Atanan:** Claude AI

---

## 🟡 Yüksek Öncelik (1-2 Gün İçinde)

### 3. SEO - Şirket Detay Sayfası Title Hatası
- [ ] Her şirket detay sayfası için dinamik title oluştur
- [ ] Format: `{Şirket Adı} - {Kategori} à {Ville} | {Domain}`
- [ ] Örnek: "NETZ Informatique - Informatique à Haguenau | Haguenau.PRO"
- [ ] Dosya: `src/app/companies/[slug]/page.tsx`
- **Atanan:** Manus AI

### 4. Ana Sayfa İstatistik Hesaplama Hatası
- [ ] `reviewCount` hesaplamasını düzelt (şu anda 0 gösteriyor)
- [ ] `averageRating` hesaplamasını düzelt (şu anda "-" gösteriyor)
- [ ] Sadece `isApproved=true` ve `isVisible=true` yorumları say
- [ ] Dosya: `src/app/page.tsx`
- **Atanan:** Manus AI

### 5. Şirket Detay Sayfasında Yorumlar Bölümü
- [ ] Yorumlar listesini göster (rating, yorum metni, tarih, yazar)
- [ ] Yorum yoksa "Henüz yorum yok" mesajı göster
- [ ] Yorum ekleme formu ekle (kullanıcılar için)
- [ ] Dosya: `src/components/CompanyReviews.tsx` (zaten var, entegre edilmeli)
- **Atanan:** Claude AI

### 6. Google Maps Entegrasyonu
- [ ] Google Maps API key'i environment variable'a ekle
- [ ] Şirket detay sayfasında gerçek harita göster
- [ ] Marker ile şirket konumunu işaretle
- [ ] Dosya: `src/components/CompanyMap.tsx` (yeni)
- **Atanan:** Claude AI

---

## 🟢 Orta Öncelik (1 Hafta İçinde)

### 7. Arama Fonksiyonu Düzeltmesi
- [ ] Annuaire sayfasındaki arama input'u form submit ile çalışsın
- [ ] Query parameter ile arama terimi URL'e eklensin
- [ ] Backend'de arama terimi ile filtreleme yapılsın (ad, açıklama, kategori)
- [ ] Dosya: `src/app/annuaire/page.tsx`
- **Atanan:** Manus AI

### 8. Şirket Kartlarında Rating Gösterimi
- [ ] Annuaire ve kategori sayfalarındaki şirket kartlarına rating ekle
- [ ] Yıldız ikonu + rating değeri + yorum sayısı formatında
- [ ] Örnek: "⭐ 4.7 (5 avis)"
- [ ] Dosya: `src/components/CompanyCard.tsx`
- **Atanan:** Manus AI

### 9. Veri Tamamlama (Admin Panel)
- [ ] Eksik şirket verilerini tamamla:
  - Telefon numaraları
  - Website URL'leri
  - Email adresleri
  - Çalışma saatleri
- [ ] Admin panelinden toplu veri girişi yap
- **Atanan:** Manuel (Mikail)

### 10. Şirket Detay Sayfası Eksik Bölümler
- [ ] Çalışma saatleri bölümü ekle
- [ ] Fotoğraf galerisi ekle (varsa)
- [ ] Sosyal medya linkleri ekle (Facebook, Instagram, LinkedIn)
- [ ] Breadcrumb navigation ekle
- [ ] Dosya: `src/app/companies/[slug]/page.tsx`
- **Atanan:** Claude AI

---

## 🔵 Düşük Öncelik (Zaman Kalırsa)

### 11. Kategori Sayfası İkonları
- [ ] Kategori listeleme sayfasına emoji/ikon ekle
- [ ] Ana sayfadaki kategori kartları ile tutarlı olsun
- [ ] Dosya: `src/app/categories/page.tsx`
- **Atanan:** Manus AI

### 12. Dil Tutarlılığı
- [ ] Admin login sayfasını tamamen Fransızca yap
- [ ] Veya tamamen Türkçe yap (kullanıcı tercihi)
- [ ] Tüm sayfalarda dil tutarlılığını kontrol et
- [ ] Dosya: `src/app/admin/login/page.tsx`
- **Atanan:** Manus AI

### 13. Mobile Responsive İyileştirmeleri
- [ ] Tüm sayfaları mobil cihazlarda test et
- [ ] Hamburger menü ekle (zaten var, test edilmeli)
- [ ] Touch-friendly butonlar ve linkler
- **Atanan:** Claude AI

### 14. Loading States ve Error Handling
- [ ] Tüm sayfalara loading skeleton ekle
- [ ] API hatalarında kullanıcı dostu mesajlar göster
- [ ] Empty states ekle (veri yoksa)
- **Atanan:** Manus AI

---

## 📊 İş Bölümü Özeti

### Manus AI Görevleri (7 görev)
1. Admin login güvenlik açığı
2. SEO - Şirket detay title
3. Ana sayfa istatistikler
4. Arama fonksiyonu
5. Şirket kartlarında rating
6. Kategori ikonları
7. Dil tutarlılığı

### Claude AI Görevleri (6 görev)
1. Statik/yasal sayfalar
2. Yorumlar bölümü
3. Google Maps entegrasyonu
4. Şirket detay eksik bölümler
5. Mobile responsive
6. Loading states (kısmen)

### Manuel (Mikail) Görevleri (1 görev)
1. Veri tamamlama (admin panel üzerinden)

---

## 🎯 Başarı Kriterleri

- [ ] Tüm kritik sorunlar çözülmüş
- [ ] Tüm yüksek öncelikli sorunlar çözülmüş
- [ ] Site production'a hazır
- [ ] SEO skorları iyileştirilmiş
- [ ] Kullanıcı deneyimi optimize edilmiş
- [ ] Güvenlik açıkları kapatılmış

---

**Son Güncelleme:** 15 Ekim 2025  
**Durum:** Başlangıç - Görevler dağıtıldı

