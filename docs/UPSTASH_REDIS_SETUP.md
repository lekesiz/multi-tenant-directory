# 🚀 Upstash Redis Kurulum Rehberi

## 📊 Neden Upstash Redis?

Upstash Redis ile AI API maliyetlerinizi **%70-80 oranında düşürebilirsiniz!**

### Faydalar:
- ✅ **Maliyet Optimizasyonu:** AI response caching ile tekrarlı API çağrılarını önler
- ✅ **Performans Artışı:** Cache hit'lerde 10-100x daha hızlı yanıt
- ✅ **Serverless:** Vercel ile mükemmel entegrasyon
- ✅ **Ücretsiz Plan:** 10,000 komut/gün ücretsiz
- ✅ **Otomatik Scaling:** Trafiğe göre otomatik ölçeklenir

---

## 🎯 Kurulum Adımları (5 Dakika)

### 1. Upstash Hesabı Oluşturma

1. **Upstash'e Git:** https://upstash.com
2. **Sign Up:** GitHub veya Email ile ücretsiz hesap oluştur
3. **Verify Email:** Email adresinizi doğrulayın

### 2. Redis Database Oluşturma

1. **Dashboard'a Git:** https://console.upstash.com
2. **Create Database** butonuna tıkla
3. **Ayarlar:**
   - **Name:** `multi-tenant-directory-cache`
   - **Type:** Regional (daha ucuz) veya Global (daha hızlı)
   - **Region:** `eu-central-1` (Frankfurt) - Neon DB'ye yakın
   - **TLS:** Enabled (güvenlik için)
   - **Eviction:** `allkeys-lru` (otomatik eski key silme)

4. **Create** butonuna tıkla

### 3. Credentials Alma

Database oluşturulduktan sonra:

1. **Database Details** sayfasında:
   - **REST URL** kopyala (örn: `https://eu2-xxx.upstash.io`)
   - **REST TOKEN** kopyala (örn: `AX...`)

2. **Veya** `.env` tab'ından direkt kopyala

### 4. Vercel'e Ekleme

#### Yöntem 1: Vercel Dashboard (Önerilen)

1. **Vercel'e Git:** https://vercel.com/lekesizs-projects/multi-tenant-directory
2. **Settings → Environment Variables**
3. **Add New** butonuna tıkla
4. İki variable ekle:

```
UPSTASH_REDIS_REST_URL = https://eu2-xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN = AX...
```

5. **Environment:** All Environments seç
6. **Save** butonu

#### Yöntem 2: Vercel CLI

```bash
cd /home/ubuntu/multi-tenant-directory

# Upstash URL ekle
vercel env add UPSTASH_REDIS_REST_URL production
# Paste URL: https://eu2-xxx.upstash.io

# Upstash Token ekle
vercel env add UPSTASH_REDIS_REST_TOKEN production
# Paste Token: AX...
```

### 5. Local Development (.env)

Local'de test etmek için:

```bash
cd /home/ubuntu/multi-tenant-directory

# .env dosyası oluştur
cat >> .env << 'EOF'

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://eu2-xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AX..."
EOF
```

### 6. Deployment

Environment variables eklendikten sonra yeni deployment gerekli:

```bash
# Vercel otomatik deployment için git push
git commit --allow-empty -m "chore: Trigger deployment for Redis env vars"
git push origin main

# Veya manuel redeploy
vercel --prod
```

---

## 🧪 Test Etme

### 1. Redis Bağlantısını Kontrol

```bash
# Upstash Console'da Redis CLI kullan
# Veya local'de test et:

cd /home/ubuntu/multi-tenant-directory
npm run dev

# Logs'da şunu görmelisiniz:
# [Redis] Client initialized successfully
```

### 2. Cache İstatistikleri

Admin panelde cache stats endpoint'i eklenebilir:

```typescript
// /api/admin/cache-stats
import { getCacheStats } from '@/lib/redis';

const stats = await getCacheStats();
console.log(stats);
// {
//   configured: true,
//   dbsize: 42,
//   memory: "used_memory:1234567..."
// }
```

### 3. Manuel Test

Upstash Console → Data Browser'da:

```redis
# Key'leri listele
KEYS *

# Örnek cache key'i kontrol et
GET ai:description:company-123:domain-1

# Cache stats
DBSIZE
INFO memory
```

---

## 📈 Kullanım ve Monitoring

### Cache Key Yapısı

Projede kullanılan cache key'leri:

```
ai:description:company-{companyId}:domain-{domainId}
ai:meta:company-{companyId}:domain-{domainId}
ai:category:{categorySlug}:domain-{domainId}
company:{slug}
companies:{page}:{category}
reviews:{companyId}:{page}
```

### TTL (Time To Live)

- **AI Descriptions:** 7 gün
- **Company Data:** 1 saat
- **Categories:** 1 saat
- **Reviews:** 30 dakika

### Cache Invalidation

Şirket güncellendi ğinde cache otomatik temizlenir:

```typescript
// Şirket güncellendiğinde
await deleteCachedPattern(`company:${slug}:*`);
await deleteCachedPattern(`ai:*:company-${id}:*`);
```

---

## 💰 Maliyet Analizi

### Ücretsiz Plan Limitleri

- **Komutlar:** 10,000/gün
- **Bandwidth:** 200 MB/gün
- **Max Request Size:** 1 MB
- **Max Database Size:** 256 MB

### Tahmini Kullanım

Günlük 1000 ziyaretçi için:

- **Cache Hit Rate:** %80 (AI çağrıları önlendi)
- **Redis Komutları:** ~5,000/gün
- **Bandwidth:** ~50 MB/gün
- **Maliyet:** **$0/ay** (ücretsiz plan yeterli)

### AI Maliyet Tasarrufu

**Cache Olmadan:**
- 1000 ziyaretçi × 3 AI çağrı = 3000 AI request
- 3000 × $0.002 = **$6/gün** = **$180/ay**

**Cache ile:**
- 3000 × %20 (cache miss) = 600 AI request
- 600 × $0.002 = **$1.2/gün** = **$36/ay**

**Tasarruf:** **$144/ay** (%80 düşüş) 🎉

---

## 🔧 Troubleshooting

### Redis bağlanamıyor

```bash
# Environment variables kontrol
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# Vercel'de kontrol
vercel env ls
```

### Cache çalışmıyor

```bash
# Logs kontrol
vercel logs

# Redis client initialized görmüyorsanız:
# 1. Environment variables doğru mu?
# 2. Deployment yapıldı mı?
# 3. Upstash database aktif mi?
```

### Performance sorunları

```bash
# Upstash Console → Metrics
# - Request/sec
# - Latency
# - Hit rate

# Eğer latency yüksekse:
# - Region'u değiştir (Neon DB'ye yakın)
# - TLS disable et (güvenlik riski!)
```

---

## 📚 Kaynaklar

- **Upstash Docs:** https://docs.upstash.com/redis
- **Vercel Integration:** https://vercel.com/integrations/upstash
- **Redis Commands:** https://redis.io/commands
- **Pricing:** https://upstash.com/pricing

---

## ✅ Checklist

- [ ] Upstash hesabı oluşturuldu
- [ ] Redis database oluşturuldu
- [ ] REST URL ve TOKEN kopyalandı
- [ ] Vercel environment variables eklendi
- [ ] Deployment yapıldı
- [ ] Logs'da "Redis Client initialized" görüldü
- [ ] Cache hit/miss logları çalışıyor
- [ ] Upstash Console'da key'ler görünüyor

---

**🎉 Tebrikler! Upstash Redis kurulumu tamamlandı!**

AI maliyetleriniz artık %70-80 daha düşük olacak! 🚀

