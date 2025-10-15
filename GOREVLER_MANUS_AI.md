# Manus AI - Görev Listesi (Sprint 1)

**Rol:** Backend, API, Güvenlik, SEO Koordinatörü  
**Tarih:** 15 Ekim 2025  
**Sprint Süresi:** 2-3 gün

---

## 🎯 Genel Sorumluluklar

- Backend API geliştirme ve güvenlik
- Database optimizasyonu ve migration
- SEO iyileştirmeleri
- **Proje koordinasyonu ve ekip yönetimi**
- Deployment ve production monitoring

---

## 🔴 Kritik Öncelik (Bugün - 6 saat)

### 1. Admin Login Güvenlik Açığı ✅ İLK GÖREV
**Dosya:** `src/app/admin/login/page.tsx`

**Problem:**
- Production'da test credentials görünüyor
- Güvenlik riski: `Admin@2025!` şifresi herkese açık

**Çözüm:**
```tsx
// Bu kısmı KALDIR:
{/* Test credentials gösterimi */}
<div className="mt-4 text-sm text-gray-600">
  <p>Admin Hesabı: mikail@netzinformatique.fr</p>
  <p>Şifre: Admin@2025!</p>
</div>
```

**Test:**
- `/admin/login` sayfasını kontrol et
- Credentials görünmemeli

---

### 2. SEO - Şirket Detay Sayfası Title Hatası
**Dosya:** `src/app/companies/[slug]/page.tsx`

**Problem:**
- Tüm şirket sayfaları "Multi-Tenant Directory Platform" başlığı gösteriyor
- SEO için felaket!

**Çözüm:**
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    include: { categories: true }
  });
  
  return {
    title: `${company.name} - ${company.categories[0]?.name} à ${company.city} | ${domain.name}`,
    description: company.description,
    // ... diğer meta tags
  };
}
```

**Test:**
- Browser'da şirket sayfasını aç
- Tab title'ı kontrol et
- View source'da `<title>` tag'ini kontrol et

---

### 3. Ana Sayfa İstatistik Hesaplama Hatası
**Dosya:** `src/app/page.tsx`

**Problem:**
- `reviewCount: 0` gösteriyor (gerçekte 5+ yorum var)
- `averageRating: "-"` gösteriyor

**Çözüm:**
```tsx
const stats = await prisma.review.aggregate({
  where: {
    company: {
      domainId: domain.id
    },
    isApproved: true,
    isVisible: true
  },
  _count: true,
  _avg: {
    rating: true
  }
});

const reviewCount = stats._count || 0;
const averageRating = stats._avg.rating ? stats._avg.rating.toFixed(1) : "-";
```

**Test:**
- Ana sayfayı yenile
- İstatistikleri kontrol et

---

## 🟡 Yüksek Öncelik (Yarın - 4 saat)

### 4. Arama Fonksiyonu Düzeltmesi
**Dosya:** `src/app/annuaire/page.tsx`

**Problem:**
- Arama input'u çalışmıyor
- Query parameter ile filtreleme yok

**Çözüm:**
- Form submit handler ekle
- URL'e `?search=...` parametresi ekle
- Backend'de `where` clause ile filtrele

---

### 5. Şirket Kartlarında Rating Gösterimi
**Dosya:** `src/components/CompanyCard.tsx`

**Problem:**
- Şirket kartlarında rating gösterilmiyor

**Çözüm:**
```tsx
{company.rating && (
  <div className="flex items-center gap-1">
    <span>⭐</span>
    <span>{company.rating.toFixed(1)}</span>
    <span className="text-gray-500">({company.reviewCount} avis)</span>
  </div>
)}
```

---

## 🟢 Orta Öncelik (2-3 gün sonra)

### 6. Email Entegrasyonu (SendGrid)
**Dosyalar:**
- `src/lib/email.ts` (yeni)
- `src/app/api/contact/route.ts`

**Problem:**
- Contact form email göndermiyor
- Visual Studio raporunda kritik eksik olarak işaretlenmiş

**Çözüm:**
- SendGrid API entegrasyonu
- Email template'leri oluştur
- Contact form'dan email gönder

---

### 7. Google Analytics 4 Kurulumu
**Dosyalar:**
- `src/app/layout.tsx`
- `src/components/GoogleAnalytics.tsx` (yeni)

**Problem:**
- CLAUDE.md'de "tamamlandı" ama kodda yok!
- Tracking ID: `G-RXFKWB8YQJ`

**Çözüm:**
```tsx
// GoogleAnalytics.tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-RXFKWB8YQJ`}
  strategy="afterInteractive"
/>
```

---

## 📊 Koordinasyon Görevleri

### Her Gün:
1. Claude ve VS Code'un değişikliklerini `git pull` ile al
2. Conflict varsa çöz
3. Günlük durum raporu hazırla
4. Sonraki görevleri dağıt

### Her Commit Öncesi:
```bash
git pull origin main
# Değişiklikleri kontrol et
git status
git add .
git commit -m "feat: [açıklama]"
git push origin main
```

---

## ✅ Başarı Kriterleri

- [ ] Admin login güvenli
- [ ] SEO title'lar dinamik
- [ ] İstatistikler doğru
- [ ] Arama çalışıyor
- [ ] Rating'ler görünüyor
- [ ] Email gönderimi aktif
- [ ] Google Analytics çalışıyor

---

## 🚀 Başlangıç Komutu

```bash
cd /home/ubuntu/multi-tenant-directory
git pull origin main
# İlk görev: Admin login güvenlik açığı
code src/app/admin/login/page.tsx
```

**İyi çalışmalar! 💪**

