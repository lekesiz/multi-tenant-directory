# Demo Veri Temizleme Rehberi

Bu rehber, test ve demo verilerini güvenli bir şekilde temizlemek için kullanılır.

## Özellikler

- ✅ Güvenli silme (sadece `isActive=false` olan şirketler)
- ✅ Dry-run modu (test için)
- ✅ İlişkili verileri otomatik temizleme
- ✅ Production koruması (onay gerektirir)
- ✅ Detaylı raporlama

## Silinecek Veriler

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

## Korunacak Veriler

- ✅ `isActive=true` olan tüm şirketler
- ✅ Gerçek kullanıcı verileri
- ✅ Production şirketleri

## Kullanım

### 1. Ortam Değişkenini Ayarlama

Önce admin token'ı ayarlayın:

\`\`\`bash
export ADMIN_CLEANUP_TOKEN='your-secret-token-here'
\`\`\`

**Önemli:** Bu token'ı `.env.local` dosyasına da ekleyin:

\`\`\`env
ADMIN_CLEANUP_TOKEN=your-secret-token-here
\`\`\`

### 2. Dry Run (Test Modu)

Önce dry-run ile kaç kayıt silineceğini kontrol edin:

\`\`\`bash
# Local'de test
./scripts/cleanup-demo-data.sh --dry-run

# Production'da test (silme yapmaz)
./scripts/cleanup-demo-data.sh --dry-run --production
\`\`\`

**Örnek Çıktı:**
\`\`\`json
{
  "success": true,
  "message": "Dry run completed. No data was deleted.",
  "results": {
    "companiesDeleted": 2,
    "businessOwnersDeleted": 2,
    "reviewsDeleted": 0,
    "photosDeleted": 0,
    "analyticsDeleted": 0,
    "dryRun": true
  }
}
\`\`\`

### 3. Gerçek Temizlik

Dry-run sonuçlarını kontrol ettikten sonra gerçek temizlik yapın:

\`\`\`bash
# Local'de temizlik
./scripts/cleanup-demo-data.sh

# Production'da temizlik (onay gerektirir)
./scripts/cleanup-demo-data.sh --production
\`\`\`

### 4. API ile Kullanım

Script yerine doğrudan API'yi de kullanabilirsiniz:

\`\`\`bash
curl -X POST https://haguenau.pro/api/admin/cleanup-demo-data \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "deleteInactiveCompanies": true,
    "deleteTestBusinessOwners": true,
    "dryRun": false
  }'
\`\`\`

## Güvenlik

### Token Güvenliği

1. **Token'ı asla Git'e commit etmeyin**
2. **Token'ı `.env.local` dosyasında saklayın**
3. **Vercel'de environment variable olarak ayarlayın**

### Vercel'de Token Ayarlama

1. Vercel Dashboard'a gidin
2. Project Settings → Environment Variables
3. Yeni variable ekleyin:
   - Key: `ADMIN_CLEANUP_TOKEN`
   - Value: Güçlü bir random token (örn: `openssl rand -base64 32`)
   - Environment: Production, Preview, Development

### Production Koruması

Production'da temizlik yaparken:
- ✅ Önce dry-run yapın
- ✅ Sonuçları dikkatlice inceleyin
- ✅ Script onay isteyecektir (`yes` yazmanız gerekir)
- ✅ Backup alın (Neon otomatik backup yapar)

## Örnek Kullanım Senaryoları

### Senaryo 1: Test Kayıtlarını Temizleme

\`\`\`bash
# 1. Kaç test kaydı var?
./scripts/cleanup-demo-data.sh --dry-run --production

# 2. Sonuçları kontrol et
# companiesDeleted: 2 (Boutique Bernard, Pharmacie Rousseau)

# 3. Temizle
./scripts/cleanup-demo-data.sh --production
\`\`\`

### Senaryo 2: Local Development Temizliği

\`\`\`bash
# Local'de test verilerini temizle
./scripts/cleanup-demo-data.sh
\`\`\`

### Senaryo 3: Otomatik Temizlik (Cron Job)

\`\`\`bash
# Her gece 02:00'de test verilerini temizle
0 2 * * * cd /path/to/project && ADMIN_CLEANUP_TOKEN='xxx' ./scripts/cleanup-demo-data.sh --production
\`\`\`

## Sorun Giderme

### Hata: "Unauthorized"

Token yanlış veya ayarlanmamış:

\`\`\`bash
export ADMIN_CLEANUP_TOKEN='correct-token'
\`\`\`

### Hata: "jq: command not found"

jq yüklü değil:

\`\`\`bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
\`\`\`

### Hata: "Failed to cleanup demo data"

Veritabanı bağlantı hatası veya Prisma hatası. Logları kontrol edin:

\`\`\`bash
# Vercel logs
vercel logs --follow

# Local logs
npm run dev
\`\`\`

## Geri Alma

Neon otomatik backup yapar. Yanlışlıkla veri sildiyseniz:

1. Neon Dashboard → Project → Branches
2. "Point-in-time restore" kullanın
3. Silme işleminden önceki bir zaman seçin

## Notlar

- ⚠️ Bu işlem geri alınamaz (backup olmadan)
- ⚠️ Production'da dikkatli kullanın
- ✅ Her zaman önce dry-run yapın
- ✅ Backup'ınızın olduğundan emin olun
- ✅ Token'ı güvenli tutun

## İletişim

Sorularınız için: mikail@netzinformatique.fr

