# Multi-Tenant Directory Platform

Yerel işletmeler için çok kiracılı (multi-tenant) dizin platformu. 12 farklı alan adı altında çalışan, merkezi yönetim panelli modern bir web uygulaması.

## 🚀 Özellikler

- **Multi-Tenant Mimari**: 12 farklı domain için tek kod tabanı
- **Merkezi Yönetim Paneli**: Tüm şirketleri ve içerikleri tek yerden yönetin
- **Google Maps Entegrasyonu**: İşletme bilgilerini ve yorumları otomatik çekin
- **Domain Bazlı İçerik**: Her domain için özelleştirilmiş içerik
- **Modern UI/UX**: Tailwind CSS ile responsive tasarım
- **Type-Safe**: TypeScript ve Prisma ORM

## 🛠️ Teknoloji Yığını

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel
- **Version Control**: Git/GitHub

## 📦 Kurulum

### Gereksinimler

- Node.js 20+
- PostgreSQL database
- Google Maps API Key (opsiyonel)

### Adımlar

1. **Repository'yi klonlayın**
   ```bash
   git clone <repository-url>
   cd multi-tenant-directory
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Environment değişkenlerini ayarlayın**
   `.env` dosyasını düzenleyin:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/multitenant_directory"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_MAPS_API_KEY="your-api-key"
   ADMIN_EMAIL="admin@haguenau.pro"
   ADMIN_PASSWORD="changeme123"
   ```

4. **Veritabanını hazırlayın**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Development server'ı başlatın**
   ```bash
   npm run dev
   ```

   Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 🗂️ Proje Yapısı

```
multi-tenant-directory/
├── prisma/
│   ├── schema.prisma      # Veritabanı şeması
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── admin/         # Yönetim paneli sayfaları
│   │   ├── api/           # API endpoints
│   │   ├── page.tsx       # Public homepage
│   │   └── layout.tsx     # Root layout
│   ├── lib/
│   │   └── prisma.ts      # Prisma client
│   └── middleware.ts      # Multi-tenant routing
├── .env                   # Environment variables
└── package.json
```

## 🌐 Domain'ler

Platform aşağıdaki 12 domain'i destekler:

1. bischwiller.pro
2. bouxwiller.pro
3. brumath.pro
4. haguenau.pro (Ana yönetim paneli)
5. hoerdt.pro
6. ingwiller.pro
7. saverne.pro
8. schiltigheim.pro
9. schweighouse.pro
10. souffelweyersheim.pro
11. soufflenheim.pro
12. wissembourg.pro

## 📊 Veritabanı Şeması

### Ana Tablolar

- **domains**: Domain bilgileri ve ayarları
- **companies**: Şirket ana bilgileri
- **company_content**: Domain bazlı özel içerikler
- **google_reviews**: Google Maps yorumları
- **users**: Admin kullanıcıları

## 🔐 Yönetim Paneli

Yönetim paneline erişim: `/admin/dashboard`

**Varsayılan Giriş Bilgileri:**
- Email: admin@haguenau.pro
- Şifre: changeme123

⚠️ **Önemli**: Production'da mutlaka şifreyi değiştirin!

## 🚢 Deployment (Vercel)

1. **GitHub'a push edin**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Vercel'de proje oluşturun**
   - Vercel Dashboard'a gidin
   - "New Project" tıklayın
   - GitHub repository'sini seçin

3. **Environment variables ekleyin**
   Vercel dashboard'da tüm `.env` değişkenlerini ekleyin

4. **Domain'leri ekleyin**
   - Her bir domain'i Vercel projesine ekleyin
   - DNS ayarlarını Vercel'i gösterecek şekilde yapılandırın

5. **Deploy edin**
   Vercel otomatik olarak deploy edecektir

## 📝 API Endpoints

### Companies
- `GET /api/companies` - Şirketleri listele (domain bazlı)
- `POST /api/companies` - Yeni şirket ekle
- `GET /api/companies/[id]` - Şirket detayı
- `PUT /api/companies/[id]` - Şirketi güncelle
- `DELETE /api/companies/[id]` - Şirketi sil

### Company Content
- `GET /api/companies/[id]/content` - Şirketin tüm domain içerikleri
- `POST /api/companies/[id]/content` - Domain içeriği oluştur/güncelle

### Google Maps
- `GET /api/google-maps/search?query=...` - İşletme ara
- `GET /api/google-maps/place/[placeId]` - İşletme detayları

### Domains
- `GET /api/domains` - Tüm domain'leri listele
- `POST /api/domains` - Yeni domain ekle

## 🔧 Geliştirme Komutları

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run db:push      # Veritabanı şemasını uygula
npm run db:seed      # Seed data ekle
npm run db:studio    # Prisma Studio aç
```

## 📚 Dokümantasyon

Detaylı proje dokümantasyonu için `Proje_Dokumantasyonu.md` dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje özel bir projedir.

## 📧 İletişim

Sorularınız için: pro@haguenau.pro

---

**Geliştirici:** Manus AI
**Tarih:** Ekim 2025

