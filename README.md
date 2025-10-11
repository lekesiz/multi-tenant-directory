# 🏢 Multi-Tenant Directory Platform

Modern, ölçeklenebilir ve SEO-friendly yerel işletme dizin platformu. 12 farklı alan adı için tek bir kod tabanı üzerinden çalışan, her domain'e özel içerik sunabilen çok kiracılı (multi-tenant) mimari.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lekesiz/multi-tenant-directory)

## ✨ Özellikler

- ✅ **Multi-Tenant Mimari** - 12 domain, tek kod tabanı
- ✅ **Admin Panel** - Şirket ve domain yönetimi
- ✅ **Google OAuth** - Güvenli kullanıcı girişi
- ✅ **Google Maps Entegrasyonu** - Otomatik şirket bilgisi çekme
- ✅ **Image Upload** - Cloudinary entegrasyonu
- ✅ **SEO Optimize** - Sitemap, robots.txt, meta tags
- ✅ **Responsive** - Mobil uyumlu tasarım
- ✅ **TypeScript** - Tam tip güvenliği

## 🚀 Hızlı Başlangıç

```bash
# Clone repository
git clone https://github.com/lekesiz/multi-tenant-directory.git
cd multi-tenant-directory

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Setup database
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

Tarayıcıda açın: http://localhost:3000

## 🔑 Admin Giriş

- **URL:** http://localhost:3000/admin/login
- **Email:** admin@haguenau.pro
- **Şifre:** changeme123

## 🛠️ Teknoloji Yığını

- Next.js 15 + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth.js + Google OAuth
- Tailwind CSS
- Cloudinary (Image Upload)
- Zod (Validation)

## 📚 Dokümantasyon

Detaylı dokümantasyon için [Wiki](https://github.com/lekesiz/multi-tenant-directory/wiki) sayfasını ziyaret edin.

## 🔗 Linkler

- **Production:** https://multi-tenant-directory.vercel.app
- **Admin Panel:** https://multi-tenant-directory.vercel.app/admin
- **GitHub:** https://github.com/lekesiz/multi-tenant-directory

## 📄 Lisans

MIT License

