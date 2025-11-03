# 📋 Credentials Özet - Hızlı Referans

**Tarih:** 22 Ekim 2025, 18:25  
**Proje:** Haguenau.pro Multi-Tenant Directory

---

## 🔐 CREDENTIALS DOSYALARI

### 1. Master Dosya (Tüm Bilgiler)
📄 **`CREDENTIALS_MASTER.md`**
- Tüm credentials'lar bir arada
- Vercel + Neon Database
- Environment variables
- Hızlı erişim komutları

### 2. Vercel Detayları
📄 **`/home/ubuntu/VERCEL_CREDENTIALS.md`**
- Project ID: `prj_yBv8OHKdWAwnVhUIo87SHO15nizb`
- Team ID: `team_fNuEPKh8XWeBnzHnsFYv2ttQ`
- Token: `YolTogyiHn03wlQtDzwwzW0p`
- API kullanımı, MCP komutları

### 3. Neon Database Detayları
📄 **`/home/ubuntu/NEON_DATABASE_CREDENTIALS.md`**
- Project ID: `bitter-tree-46809563`
- Database: `neondb`
- Connection string
- Migration komutları

### 4. Proje Durum Raporu
📄 **`/home/ubuntu/PROJE_DURUM_RAPORU.md`**
- Genel proje durumu
- Tamamlanan özellikler (18)
- Kalan görevler (1-2 saat)
- Performans metrikleri

### 5. Güncellenmiş Context
📄 **`CONTEXT_UPDATED.md`**
- Proje context'i
- Tüm bilgiler özet
- Sonraki adımlar

---

## 🚀 HIZLI ERİŞİM

### Vercel Proje Bilgisi
```bash
manus-mcp-cli tool call get_project \
  --server vercel \
  --input '{"projectId": "prj_yBv8OHKdWAwnVhUIo87SHO15nizb", "teamId": "team_fNuEPKh8XWeBnzHnsFYv2ttQ"}'
```

### Database Bağlantısı
```bash
export DATABASE_URL="postgresql://neondb_owner:npg_VpWeLsdnSj3lBep-rqd-sun-a0jlzir-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Migration Çalıştırma
```bash
cd /home/ubuntu/multi-tenant-directory
npx prisma migrate deploy
```

---

## 📊 PROJE DURUMU

### ✅ Tamamlandı
- 18 ana özellik
- %80-90 performans artışı
- 20 domain yapılandırılmış
- Production deployment başarılı

### ⏳ Kalan İşler (1-2 Saat)
1. Veritabanı migration (15 dk)
2. CRON_SECRET ekleme (5 dk)
3. Upstash Redis kurulumu (30 dk)
4. Sentry kurulumu (20 dk)

---

## 🔗 HIZLI LİNKLER

- **Vercel Dashboard:** https://vercel.com/lekesizs-projects/multi-tenant-directory
- **Neon Console:** https://console.neon.tech/app/projects/bitter-tree-46809563
- **GitHub Repo:** https://github.com/lekesiz/multi-tenant-directory
- **Ana Domain:** https://haguenau.pro

---

## ⚠️ GÜVENLİK

- ✅ Tüm credentials dosyaları `.gitignore`'a eklendi
- ✅ Hassas bilgiler Git'e commit edilmeyecek
- ✅ Environment variables Vercel'de encrypted

---

**Not:** Detaylı bilgi için ilgili dosyaları incele.

