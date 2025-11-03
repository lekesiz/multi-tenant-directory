# Database Cleanup Script - Kullanım Rehberi

Bu rehber, Node.js script kullanarak test ve demo verilerini güvenli bir şekilde temizlemek için hazırlanmıştır.

---

## 🚀 Hızlı Başlangıç

### 1. Dry Run (Test Modu)

Önce hangi verilerin silineceğini görmek için dry-run yapın:

```bash
# npm script ile
npm run cleanup:dry-run

# Veya doğrudan
node scripts/cleanup-database.js --dry-run
```

**Çıktı Örneği:**
```
============================================================
Database Cleanup Script
============================================================

Mod: DRY RUN (Test modu - hiçbir veri silinmeyecek)
✓ Veritabanı bağlantısı başarılı

============================================================
Aktif Olmayan Şirketleri Temizleme
============================================================

Bulunan aktif olmayan şirket sayısı: 2

Silinecek şirketler:
  1. Boutique Bernard (ID: 362, Oluşturulma: 2025-10-20)
  2. Pharmacie Rousseau (ID: 363, Oluşturulma: 2025-10-20)

✓ DRY RUN: Hiçbir veri silinmedi

Silinecek ilişkili veriler:
  - Reviews: 0
  - Photos: 0
  - Analytics: 0

============================================================
Test Business Owners Temizleme
============================================================

Bulunan test business owner sayısı: 2

Silinecek business owners:
  1. Antoine Rousseau (antoine.rousseau@pharmacie-test.fr, Oluşturulma: 2025-10-20)
  2. Test User (test@example.com, Oluşturulma: 2025-10-20)

✓ DRY RUN: Hiçbir veri silinmedi

============================================================
Temizlik Sonuçları
============================================================

Silinen/Silinecek veriler:
  Şirketler:        2
  Business Owners:  2
  Reviews:          0
  Photos:           0
  Analytics:        0

✓ DRY RUN tamamlandı. Gerçek temizlik için --production parametresi kullanın.
```

### 2. Production Temizlik

Dry-run sonuçlarını kontrol ettikten sonra gerçek temizlik yapın:

```bash
# npm script ile
npm run cleanup:production

# Veya doğrudan
node scripts/cleanup-database.js --production
```

**Onay İsteyecek:**
```
⚠️  UYARI: Production veritabanında temizlik yapacaksınız!
Bu işlem geri alınamaz!

Devam etmek istediğinizden emin misiniz? (yes/no): yes
```

---

## 📋 Silinecek Veriler

### 1. Aktif Olmayan Şirketler
- `isActive=false` olan tüm şirketler
- İlişkili reviews
- İlişkili photos
- İlişkili analytics
- İlişkili business hours
- İlişkili company content
- İlişkili company ownerships

### 2. Test Business Owners
- Son 24 saat içinde oluşturulan
- Artık hiç şirketi olmayan
- Business owner kayıtları

---

## 🔒 Korunacak Veriler

- ✅ `isActive=true` olan tüm şirketler
- ✅ Gerçek kullanıcı verileri
- ✅ Production şirketleri
- ✅ 24 saatten eski business owners

---

## 🛠️ Kullanım Senaryoları

### Senaryo 1: Local Development Temizliği

```bash
# 1. Local veritabanını kontrol et
npm run cleanup:dry-run

# 2. Temizle
npm run cleanup:production
```

### Senaryo 2: Production Temizliği

```bash
# 1. Production veritabanına bağlan
export DATABASE_URL="postgresql://..."

# 2. Dry-run ile kontrol et
npm run cleanup:dry-run

# 3. Sonuçları incele
# 4. Onaydan sonra temizle
npm run cleanup:production
```

### Senaryo 3: Vercel CLI ile Production

```bash
# 1. Vercel CLI ile bağlan
vercel env pull .env.production

# 2. Production DATABASE_URL'i kullan
export $(cat .env.production | grep DATABASE_URL)

# 3. Dry-run
npm run cleanup:dry-run

# 4. Temizle
npm run cleanup:production
```

### Senaryo 4: Otomatik Temizlik (Cron Job)

```bash
# Her gece 02:00'de test verilerini temizle
0 2 * * * cd /path/to/project && npm run cleanup:production
```

---

## 🔧 Teknik Detaylar

### Gereksinimler
- Node.js 18+
- Prisma Client
- PostgreSQL veritabanı erişimi

### Environment Variables
```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Script Parametreleri

| Parametre | Açıklama |
|-----------|----------|
| `--dry-run` | Test modu, hiçbir veri silinmez |
| `--production` | Gerçek silme işlemi yapar |

### Çıkış Kodları

| Kod | Açıklama |
|-----|----------|
| 0 | Başarılı |
| 1 | Hata oluştu |

---

## ⚠️ Güvenlik

### 1. Database Backup
Temizlik yapmadan önce mutlaka backup alın:

```bash
# Neon otomatik backup yapar
# Manuel backup için:
pg_dump $DATABASE_URL > backup.sql
```

### 2. Dry-Run Zorunluluğu
Her zaman önce dry-run yapın:

```bash
npm run cleanup:dry-run
```

### 3. Production Onayı
Production'da script onay isteyecektir:

```
Devam etmek istediğinizden emin misiniz? (yes/no):
```

### 4. Geri Alma
Yanlışlıkla veri sildiyseniz:

1. Neon Dashboard → Project → Branches
2. "Point-in-time restore" kullanın
3. Silme işleminden önceki bir zaman seçin

---

## 🐛 Sorun Giderme

### Hata: "Cannot find module '@prisma/client'"

**Çözüm:**
```bash
npm install
npx prisma generate
```

### Hata: "Database connection failed"

**Çözüm:**
```bash
# DATABASE_URL'i kontrol et
echo $DATABASE_URL

# Veya .env dosyasından yükle
export $(cat .env | grep DATABASE_URL)
```

### Hata: "Permission denied"

**Çözüm:**
```bash
chmod +x scripts/cleanup-database.js
```

### Script çalışmıyor

**Çözüm:**
```bash
# Node.js versiyonunu kontrol et
node --version  # 18+ olmalı

# Prisma Client'ı yeniden generate et
npx prisma generate

# Script'i doğrudan çalıştır
node scripts/cleanup-database.js --dry-run
```

---

## 📊 Örnek Çıktılar

### Başarılı Dry-Run
```
============================================================
Database Cleanup Script
============================================================

Mod: DRY RUN (Test modu - hiçbir veri silinmeyecek)
✓ Veritabanı bağlantısı başarılı

============================================================
Aktif Olmayan Şirketleri Temizleme
============================================================

Bulunan aktif olmayan şirket sayısı: 2
✓ DRY RUN: Hiçbir veri silinmedi

============================================================
Temizlik Sonuçları
============================================================

Silinen/Silinecek veriler:
  Şirketler:        2
  Business Owners:  2
  Reviews:          0
  Photos:           0
  Analytics:        0

✓ DRY RUN tamamlandı.
```

### Başarılı Production Temizlik
```
============================================================
Database Cleanup Script
============================================================

Mod: PRODUCTION (Gerçek silme işlemi yapılacak)
✓ Veritabanı bağlantısı başarılı

⚠️  UYARI: Production veritabanında temizlik yapacaksınız!
Bu işlem geri alınamaz!

Devam etmek istediğinizden emin misiniz? (yes/no): yes

============================================================
Aktif Olmayan Şirketleri Temizleme
============================================================

İlişkili verileri siliniyor...
✓ 0 review silindi
✓ 0 photo silindi
✓ 0 analytics kaydı silindi
✓ 2 şirket silindi

============================================================
Temizlik Sonuçları
============================================================

Silinen/Silinecek veriler:
  Şirketler:        2
  Business Owners:  2
  Reviews:          0
  Photos:           0
  Analytics:        0

✓ Temizlik başarıyla tamamlandı!
```

---

## 🔗 İlgili Dosyalar

- **Script:** `scripts/cleanup-database.js`
- **Bash Script:** `scripts/cleanup-demo-data.sh` (alternatif)
- **Package.json:** npm script'ler
- **Prisma Schema:** `prisma/schema.prisma`

---

## 📝 Notlar

- ⚠️ Bu işlem geri alınamaz (backup olmadan)
- ⚠️ Production'da dikkatli kullanın
- ✅ Her zaman önce dry-run yapın
- ✅ Backup'ınızın olduğundan emin olun
- ✅ Sonuçları dikkatlice inceleyin

---

## 💡 İpuçları

### 1. Renkli Çıktı
Script renkli çıktı üretir:
- 🟢 Yeşil: Başarılı işlemler
- 🟡 Sarı: Uyarılar ve dry-run
- 🔵 Mavi: Bilgi mesajları
- 🔴 Kırmızı: Hatalar

### 2. Otomatik Onay
Production onayını atlamak için (dikkatli kullanın):
```bash
echo "yes" | npm run cleanup:production
```

### 3. Log Dosyasına Kaydet
```bash
npm run cleanup:production > cleanup.log 2>&1
```

### 4. Sadece Şirketleri Temizle
Script'i modifiye ederek sadece belirli temizlik işlemlerini yapabilirsiniz.

---

## 📞 Destek

**Sorularınız için:**
- GitHub Issues: Teknik sorunlar
- Email: mikail@netzinformatique.fr

---

**Rehber Sonu**  
*Bu rehber Manus AI tarafından 20 Ekim 2025 tarihinde oluşturulmuştur.*

