import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { upstashAuthRateLimit, upstashApiRateLimit, checkUpstashConfig } from '@/lib/upstash-rate-limit';
import { strictRateLimit, apiRateLimit } from '@/lib/rate-limit';

// Desteklenen domain'ler - 20 domain
const SUPPORTED_DOMAINS = [
  'bas-rhin.pro',
  'bischwiller.pro',
  'bouxwiller.pro',
  'brumath.pro',
  'erstein.pro',
  'geispolsheim.pro',
  'haguenau.pro',
  'hoerdt.pro',
  'illkirch.pro',
  'ingwiller.pro',
  'ittenheim.pro',
  'ostwald.pro',
  'saverne.pro',
  'schiltigheim.pro',
  'schweighouse.pro',
  'souffelweyersheim.pro',
  'soufflenheim.pro',
  'vendenheim.pro',
  'wissembourg.pro',
  'mutzig.pro',
  'localhost:3000', // Development için
];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Rate limiting kontrolü
  if (url.pathname.startsWith('/api')) {
    // Auth endpoints için stricter rate limiting
    if (url.pathname.startsWith('/api/auth')) {
      const rateLimitResponse = checkUpstashConfig() 
        ? await upstashAuthRateLimit(request)
        : await strictRateLimit(request);
      
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    } 
    // Diğer API endpoints için genel rate limiting
    else {
      const rateLimitResponse = checkUpstashConfig() 
        ? await upstashApiRateLimit(request)
        : await apiRateLimit(request);
      
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    }
  }

  // Vercel deployment URL'lerini kabul et
  const isVercelDomain = hostname.includes('.vercel.app');
  const isSupportedDomain = SUPPORTED_DOMAINS.includes(hostname);

  // Eğer desteklenmeyen bir domain ise ve Vercel domain'i de değilse hata göster
  if (!isSupportedDomain && !isVercelDomain) {
    return new NextResponse('Domain not found', { status: 404 });
  }

  // Admin panel kontrolü - bas-rhin.pro/admin veya localhost:3000/admin
  if (url.pathname.startsWith('/admin')) {
    // Admin sayfalarını /admin route'una yönlendir
    return NextResponse.rewrite(new URL(`/admin${url.pathname.replace('/admin', '')}${url.search}`, request.url));
  }

  // API route'ları için özel işlem yapma
  if (url.pathname.startsWith('/api')) {
    const response = NextResponse.next();
    response.headers.set('x-tenant-domain', hostname);
    return response;
  }

  // Domain'i header'a ekle
  const response = NextResponse.next();
  response.headers.set('x-tenant-domain', hostname);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

