# Multi-Tenant Directory Platform

Yerel işletmeler için çok kiracılı (multi-tenant) dizin platformu. 12 farklı alan adı üzerinden tek bir kod tabanıyla her şehir için özelleştirilmiş içerik sunun.

## 🚀 Özellikler

- ✅ Multi-tenant mimari (12 domain, tek kod tabanı)
- ✅ Modern admin paneli
- ✅ Google Maps entegrasyonu
- ✅ Domain bazlı içerik yönetimi
- ✅ Responsive tasarım
- ✅ SEO-friendly

## 🛠️ Teknoloji Stack

- Next.js 15, React 19, TypeScript
- Prisma ORM + PostgreSQL
- NextAuth.js
- Tailwind CSS
- Vercel

## 🚀 Hızlı Başlangıç

\`\`\`bash
# 1. Clone repository
git clone https://github.com/lekesiz/multi-tenant-directory.git
cd multi-tenant-directory

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# .env dosyasını düzenleyin

# 4. Setup database
npx prisma dev  # Ayrı terminal
npx prisma db push
npm run db:seed

# 5. Start development server
npm run dev
\`\`\`

## 🔑 Admin Giriş

- URL: http://localhost:3000/admin/login
- Email: admin@haguenau.pro
- Şifre: changeme123

## 📚 Dokümantasyon

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Architecture](./ARCHITECTURE.md)
- [API Documentation](./docs/API.md)

## 📄 Lisans

Private Project

## 📞 İletişim

GitHub: https://github.com/lekesiz/multi-tenant-directory

