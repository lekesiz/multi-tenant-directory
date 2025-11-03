# 🔍 Sentry Error Tracking Kurulum Rehberi

## 📊 Neden Sentry?

Sentry ile production hatalarını gerçek zamanlı takip edip hızlıca çözebilirsiniz!

### Faydalar:
- ✅ **Real-time Error Tracking:** Hatalar anında bildirim
- ✅ **Stack Traces:** Detaylı hata raporları
- ✅ **Performance Monitoring:** Yavaş endpoint'leri tespit
- ✅ **Session Replay:** Kullanıcı davranışlarını izleme
- ✅ **Ücretsiz Plan:** 5,000 error/ay ücretsiz
- ✅ **Vercel Entegrasyonu:** Tek tıkla kurulum

---

## 🎯 Kurulum Adımları (10 Dakika)

### 1. Sentry Hesabı Oluşturma

1. **Sentry'e Git:** https://sentry.io
2. **Sign Up:** GitHub veya Email ile ücretsiz hesap oluştur
3. **Verify Email:** Email adresinizi doğrulayın

### 2. Proje Oluşturma

1. **Create Project** butonuna tıkla
2. **Platform Seç:** Next.js
3. **Ayarlar:**
   - **Project Name:** `multi-tenant-directory`
   - **Team:** Default (veya yeni team oluştur)
   - **Alert Frequency:** Daily summary (günlük özet)

4. **Create Project** butonuna tıkla

### 3. DSN (Data Source Name) Alma

Proje oluşturulduktan sonra:

1. **Client Keys (DSN)** sayfası otomatik açılır
2. **DSN** kopyala (örn: `https://xxx@o123.ingest.sentry.io/456`)

Veya:

1. **Settings → Projects → multi-tenant-directory**
2. **Client Keys (DSN)** tab
3. **DSN** kopyala

### 4. Vercel'e Ekleme

#### Yöntem 1: Vercel Dashboard (Önerilen)

1. **Vercel'e Git:** https://vercel.com/lekesizs-projects/multi-tenant-directory
2. **Settings → Environment Variables**
3. **Add New** butonuna tıkla
4. Bir variable ekle:

```
NEXT_PUBLIC_SENTRY_DSN = https://xxx@o123.ingest.sentry.io/456
```

5. **Environment:** All Environments seç
6. **Save** butonu

**Not:** `NEXT_PUBLIC_` prefix'i önemli! Client-side'da kullanılacak.

#### Yöntem 2: Vercel CLI

```bash
cd /home/ubuntu/multi-tenant-directory

# Sentry DSN ekle
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Paste DSN: https://xxx@o123.ingest.sentry.io/456
```

### 5. Local Development (.env.local)

Local'de test etmek için:

```bash
cd /home/ubuntu/multi-tenant-directory

# .env.local dosyası oluştur (gitignore'da var)
cat >> .env.local << 'EOF'

# Sentry
NEXT_PUBLIC_SENTRY_DSN="https://xxx@o123.ingest.sentry.io/456"
EOF
```

### 6. Deployment

Environment variable eklendikten sonra yeni deployment gerekli:

```bash
# Vercel otomatik deployment için git push
git commit --allow-empty -m "chore: Trigger deployment for Sentry DSN"
git push origin main

# Veya manuel redeploy
vercel --prod
```

---

## 🧪 Test Etme

### 1. Test Hatası Oluşturma

Test endpoint'i oluştur:

```typescript
// /app/api/test-sentry/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  throw new Error('Sentry test error - This is intentional!');
  return NextResponse.json({ message: 'This will never be reached' });
}
```

### 2. Test Endpoint'ini Çağır

```bash
# Production'da test et
curl https://haguenau.pro/api/test-sentry

# Veya browser'da aç
# https://haguenau.pro/api/test-sentry
```

### 3. Sentry Dashboard'da Kontrol

1. **Sentry Dashboard:** https://sentry.io/organizations/xxx/issues/
2. **Issues** tab'ında yeni hata görmelisiniz:
   - **Error:** "Sentry test error - This is intentional!"
   - **Stack Trace:** Tam hata detayları
   - **Environment:** production
   - **Release:** Git commit SHA

---

## 📈 Kullanım ve Monitoring

### Error Tracking

Sentry otomatik olarak tüm hataları yakalar:

**Client-side (Browser):**
- React component errors
- API call failures
- JavaScript runtime errors
- Unhandled promise rejections

**Server-side (Next.js):**
- API route errors
- Server component errors
- Database errors
- External API failures

**Edge Runtime:**
- Middleware errors
- Edge function errors

### Performance Monitoring

Sentry otomatik olarak performans metriklerini toplar:

- **Page Load Times:** Sayfa yükleme süreleri
- **API Response Times:** Endpoint yanıt süreleri
- **Database Query Times:** Veritabanı sorgu süreleri
- **External API Calls:** Dış API çağrı süreleri

**Sample Rate:** Production'da %10 (maliyet optimizasyonu)

### Session Replay

Kullanıcı davranışlarını video gibi izleyin:

- **Error Replays:** %100 (hata olan session'lar)
- **Normal Replays:** %10 (rastgele session'lar)
- **Privacy:** Text ve media maskeleme aktif

---

## 🔔 Alert Konfigürasyonu

### Email Alerts

1. **Sentry Dashboard → Alerts**
2. **Create Alert Rule**
3. **Conditions:**
   - **When:** An event is seen
   - **If:** Error count > 10 in 1 hour
   - **Then:** Send email to team

### Slack Integration

1. **Settings → Integrations → Slack**
2. **Install Slack Integration**
3. **Configure:** #errors channel
4. **Alerts:** Real-time error notifications

### Custom Alerts

```typescript
// Kritik hatalarda özel alert
import * as Sentry from '@sentry/nextjs';

try {
  await criticalOperation();
} catch (error) {
  Sentry.captureException(error, {
    level: 'fatal',
    tags: {
      operation: 'payment_processing',
      critical: true,
    },
    extra: {
      userId: user.id,
      amount: payment.amount,
    },
  });
  
  // Send immediate notification
  await sendSlackAlert('💥 Critical payment error!');
}
```

---

## 💰 Maliyet Analizi

### Ücretsiz Plan Limitleri

- **Errors:** 5,000/ay
- **Performance:** 10,000 transactions/ay
- **Replays:** 50 session replays/ay
- **Retention:** 30 gün
- **Team Members:** Unlimited

### Tahmini Kullanım

Günlük 1000 ziyaretçi için:

- **Errors:** ~100/ay (iyi kod kalitesi ile)
- **Performance Transactions:** ~3,000/ay (%10 sample rate)
- **Replays:** ~30/ay (error replays)
- **Maliyet:** **$0/ay** (ücretsiz plan yeterli)

### Paid Plan

Eğer limitleri aşarsanız:

- **Team Plan:** $26/ay
  - 50,000 errors/ay
  - 100,000 transactions/ay
  - 500 replays/ay

---

## 🔧 Advanced Konfigürasyon

### Custom Context

Hatalara ek bilgi ekleyin:

```typescript
import * as Sentry from '@sentry/nextjs';

// User context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Custom tags
Sentry.setTag('domain', 'haguenau.pro');
Sentry.setTag('plan', 'premium');

// Custom context
Sentry.setContext('company', {
  id: company.id,
  name: company.name,
  category: company.category,
});
```

### Breadcrumbs

Kullanıcı davranışlarını takip edin:

```typescript
Sentry.addBreadcrumb({
  category: 'user-action',
  message: 'User clicked submit button',
  level: 'info',
  data: {
    formId: 'contact-form',
    timestamp: Date.now(),
  },
});
```

### Source Maps

Production'da kaynak kodunu görmek için:

```bash
# Vercel otomatik olarak source map'leri Sentry'e yükler
# next.config.sentry.ts dosyasında yapılandırılmış

# Manuel yükleme (gerekirse):
npx @sentry/cli releases files <release> upload-sourcemaps ./build
```

---

## 🛠️ Troubleshooting

### Sentry çalışmıyor

```bash
# Environment variable kontrol
echo $NEXT_PUBLIC_SENTRY_DSN

# Vercel'de kontrol
vercel env ls

# Browser console'da kontrol
# Sentry init mesajı görmelisiniz
```

### Hatalar görünmüyor

1. **DSN doğru mu?** Sentry dashboard'dan kontrol edin
2. **Deployment yapıldı mı?** Environment variable değişikliği sonrası
3. **Sample rate düşük mü?** Test için %100 yapın
4. **Filters aktif mi?** `ignoreErrors` ve `denyUrls` kontrol edin

### Performance data eksik

```typescript
// sentry.client.config.ts
tracesSampleRate: 1.0, // %100 için (test)
```

---

## 📚 Kaynaklar

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Vercel Integration:** https://vercel.com/integrations/sentry
- **Best Practices:** https://docs.sentry.io/platforms/javascript/best-practices/
- **Pricing:** https://sentry.io/pricing/

---

## ✅ Checklist

- [ ] Sentry hesabı oluşturuldu
- [ ] Next.js projesi oluşturuldu
- [ ] DSN kopyalandı
- [ ] Vercel environment variable eklendi (`NEXT_PUBLIC_SENTRY_DSN`)
- [ ] Deployment yapıldı
- [ ] Test hatası oluşturuldu
- [ ] Sentry dashboard'da hata görüldü
- [ ] Email alerts yapılandırıldı
- [ ] Slack integration kuruldu (opsiyonel)

---

**🎉 Tebrikler! Sentry error tracking kurulumu tamamlandı!**

Artık production hatalarını gerçek zamanlı takip edebilirsiniz! 🚀

