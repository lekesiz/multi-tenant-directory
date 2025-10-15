# Rate Limiting Documentation

## Overview

Bu proje iki katmanlı rate limiting sistemi kullanır:
1. **Development**: In-memory rate limiting (Manus'un implementasyonu)
2. **Production**: Upstash Redis tabanlı rate limiting (Claude'un implementasyonu)

## Rate Limiting Tiers

### API Endpoints
- **General API**: 100 requests/minute
- **Auth Endpoints**: 10 requests/minute
- **Admin Operations**: 50 requests/minute
- **Google Maps API**: 20 requests/minute
- **Company CRUD**: 5 requests/minute
- **Search Operations**: 30 requests/minute

## Setup Instructions

### 1. Development (In-Memory)
Hiçbir ek konfigürasyon gerekmiyor. In-memory store otomatik olarak çalışır.

### 2. Production (Upstash Redis)

#### Upstash Hesabı Oluştur
1. [Upstash Console](https://console.upstash.com/) hesabı oluştur
2. Yeni Redis database oluştur
3. Database settings'den REST API credentials'larını al

#### Environment Variables
```bash
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

#### Vercel Deployment
1. Vercel dashboard'da environment variables ekle
2. Deploy et
3. Rate limiting otomatik olarak aktif olur

## Usage Examples

### API Route'da Manuel Kullanım
```typescript
import { upstashApiRateLimit, checkUpstashConfig } from '@/lib/upstash-rate-limit';
import { apiRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Upstash varsa onu kullan, yoksa in-memory fallback
  const rateLimitResponse = checkUpstashConfig() 
    ? await upstashApiRateLimit(request)
    : await apiRateLimit(request);
  
  if (rateLimitResponse) {
    return rateLimitResponse; // 429 Too Many Requests
  }
  
  // Normal API logic...
}
```

### Middleware'de Otomatik
Middleware otomatik olarak tüm API endpoint'lerde rate limiting uygular:
- `/api/auth/*` → Strict rate limiting
- `/api/*` → General rate limiting

## Rate Limit Headers

Rate limit durumu HTTP headers'da döner:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1672531200000
```

## Error Response

Rate limit aşıldığında:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Try again after 2025-01-15T10:30:00.000Z",
  "retryAfter": 45
}
```

## Monitoring

### Development
In-memory store memory usage konsol'da görülebilir.

### Production
Upstash Console'da real-time analytics:
- Request count
- Rate limit hits
- Geographic distribution
- Error rates

## Best Practices

1. **Client-side retry logic** implement edin
2. **Exponential backoff** kullanın
3. **User feedback** verin (429 error'da)
4. **Critical endpoints** için stricter limits
5. **Admin bypass** yetenekleri ekleyin

## Troubleshooting

### In-Memory Issues
- Server restart'ta memory temizlenir
- High traffic'te memory leak riski
- Development only kullanın

### Upstash Issues
1. Environment variables doğru mu?
2. Upstash console'da quota aşıldı mı?
3. Network connectivity var mı?

### Debugging
```typescript
// Debug mode için
console.log('Rate limit config:', checkUpstashConfig());
```