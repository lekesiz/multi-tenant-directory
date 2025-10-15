# Claude AI - Yeni Görevler (Sprint 3 - Gün 1)

**Tarih:** 15 Ekim 2025, 18:45 GMT+2  
**Sprint:** 3 (Gün 1/14)  
**Assigned:** Claude AI  
**Priority:** HIGH

---

## 📋 Görev Özeti

Önceki görevleri başarıyla tamamladın! (TASK-003, 004, 007, 008, 009, 010) 🎉

Şimdi kritik bir görev var: **Prisma Migration ve Database Deployment**

---

## 🎯 YENİ GÖREV: Database Migration & Deployment

### Görev Detayı

Oluşturduğun yeni Prisma schema'sını production database'e deploy etmen gerekiyor.

**Yeni Modeller (Senin oluşturduğun):**
1. `BusinessOwner` - İşletme sahipleri
2. `CompanyOwnership` - Şirket sahiplik ilişkileri
3. `Photo` - Fotoğraf yönetimi
4. `BusinessHours` - Çalışma saatleri
5. `CompanyAnalytics` - İstatistikler

---

## 🚀 Adım Adım Talimatlar

### Adım 1: Prisma Migration Oluştur

```bash
# Local'de migration oluştur
cd /home/ubuntu/multi-tenant-directory
npx prisma migrate dev --name add_business_owner_system

# Migration dosyası oluşturulacak:
# prisma/migrations/YYYYMMDDHHMMSS_add_business_owner_system/migration.sql
```

**Beklenen Çıktı:**
```
✔ Generated Prisma Client
✔ The migration has been created successfully
✔ Applied migration: add_business_owner_system
```

---

### Adım 2: Migration Dosyasını İncele

```bash
# Migration SQL'ini kontrol et
cat prisma/migrations/*/migration.sql
```

**Kontrol Listesi:**
- [ ] `BusinessOwner` tablosu oluşturuluyor mu?
- [ ] `CompanyOwnership` tablosu oluşturuluyor mu?
- [ ] `Photo` tablosu oluşturuluyor mu?
- [ ] `BusinessHours` tablosu oluşturuluyor mu?
- [ ] `CompanyAnalytics` tablosu oluşturuluyor mu?
- [ ] Foreign key constraints doğru mu?
- [ ] Indexes oluşturuluyor mu?

---

### Adım 3: Production Database'e Deploy

**Neon MCP kullanarak:**

```bash
# Migration SQL'ini al
MIGRATION_SQL=$(cat prisma/migrations/*/migration.sql)

# Neon MCP ile production'a deploy et
manus-mcp-cli tool call run_sql --server neon --input '{
  "projectId": "multi-tenant-directory",
  "branchId": "main",
  "sql": "'"$MIGRATION_SQL"'"
}'
```

**Alternatif: Prisma migrate deploy**

```bash
# Production DATABASE_URL ile
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
```

---

### Adım 4: Prisma Client Regenerate

```bash
# Prisma Client'ı yeniden oluştur
npx prisma generate

# TypeScript type definitions güncellenecek
```

---

### Adım 5: Seed Data (Opsiyonel)

Eğer test data eklemek istersen:

```bash
# Business owner seed script oluştur
npx tsx prisma/seed-business-owners.ts
```

**Örnek seed script:**

```typescript
// prisma/seed-business-owners.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Test business owner oluştur
  const owner = await prisma.businessOwner.create({
    data: {
      email: 'owner@netzinformatique.fr',
      name: 'NETZ Informatique Owner',
      phone: '+33388123456',
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  // Şirkete ownership bağla
  const company = await prisma.company.findFirst({
    where: { name: { contains: 'NETZ Informatique' } },
  });

  if (company) {
    await prisma.companyOwnership.create({
      data: {
        businessOwnerId: owner.id,
        companyId: company.id,
        role: 'OWNER',
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
  }

  console.log('✅ Business owner seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 🧪 Testing

### Test 1: Database Schema Validation

```bash
# Schema'nın sync olduğunu kontrol et
npx prisma validate

# Beklenen: ✔ The schema is valid
```

### Test 2: Prisma Studio

```bash
# Prisma Studio'yu başlat
npx prisma studio

# Browser'da kontrol et:
# - BusinessOwner tablosu var mı?
# - CompanyOwnership tablosu var mı?
# - Photo tablosu var mı?
# - BusinessHours tablosu var mı?
# - CompanyAnalytics tablosu var mı?
```

### Test 3: API Endpoints

```bash
# Business owner registration test
curl -X POST http://localhost:3000/api/business/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test Owner",
    "phone": "+33612345678"
  }'

# Beklenen: 201 Created
```

---

## 📝 Git Commit

Migration tamamlandıktan sonra:

```bash
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "feat: database migration - business owner system

- Add BusinessOwner table
- Add CompanyOwnership table
- Add Photo table
- Add BusinessHours table
- Add CompanyAnalytics table
- Add foreign key constraints
- Add indexes for performance

Migration: add_business_owner_system
Status: ✅ Deployed to production"

git push
```

---

## 🚨 Önemli Notlar

### Database Backup

Migration öncesi backup al:

```bash
# Neon MCP ile backup (eğer varsa)
manus-mcp-cli tool call create_backup --server neon --input '{
  "projectId": "multi-tenant-directory",
  "branchId": "main"
}'
```

### Rollback Plan

Eğer migration başarısız olursa:

```bash
# Migration'ı geri al
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Veya manuel SQL ile
manus-mcp-cli tool call run_sql --server neon --input '{
  "projectId": "multi-tenant-directory",
  "branchId": "main",
  "sql": "DROP TABLE IF EXISTS ..."
}'
```

---

## 📊 Success Criteria

Migration başarılı sayılır eğer:

- [x] Prisma migration başarıyla oluşturuldu
- [x] Production database'e deploy edildi
- [x] Prisma Client regenerate edildi
- [x] Prisma validate başarılı
- [x] Prisma Studio'da tablolar görünüyor
- [x] API endpoints çalışıyor
- [x] Git'e commit edildi

---

## 🎯 Sonraki Adımlar (Opsiyonel)

Migration tamamlandıktan sonra:

1. **Email Service Integration**
   - SendGrid/Resend setup
   - Email verification emails
   - Password reset emails

2. **Business Dashboard Polish**
   - Loading states
   - Error boundaries
   - Toast notifications

3. **Photo Upload Testing**
   - Vercel Blob test
   - Image optimization
   - Thumbnail generation

---

## 📚 Referanslar

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Neon Branching](https://neon.tech/docs/guides/branching)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)

---

## 🆘 Sorun Yaşarsan

### Hata: "Migration already applied"

```bash
# Migration history'yi kontrol et
npx prisma migrate status

# Eğer zaten applied ise, skip et
npx prisma migrate resolve --applied MIGRATION_NAME
```

### Hata: "Database connection failed"

```bash
# DATABASE_URL'i kontrol et
echo $DATABASE_URL

# Neon MCP ile connection string al
manus-mcp-cli tool call get_connection_string --server neon --input '{
  "projectId": "multi-tenant-directory",
  "branchId": "main"
}'
```

### Hata: "Foreign key constraint failed"

```bash
# Mevcut data'yı kontrol et
manus-mcp-cli tool call run_sql --server neon --input '{
  "projectId": "multi-tenant-directory",
  "branchId": "main",
  "sql": "SELECT * FROM companies LIMIT 5;"
}'

# Gerekirse seed data ekle
```

---

## 📞 İletişim

Sorun yaşarsan veya soru varsa:
- Manus AI ile koordine ol
- GitHub issue aç
- Commit message'da detay ver

---

**İyi çalışmalar! Migration başarılı olacak! 🚀**

**Tahmini Süre:** 1-2 saat  
**Priority:** 🔴 HIGH (Diğer görevler buna bağımlı)  
**Deadline:** 16 Ekim, 12:00

---

**Hazırlayan:** Manus AI  
**Sprint:** 3 (Gün 1/14)  
**Status:** 🔄 READY TO START

