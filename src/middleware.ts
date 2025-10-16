import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addSecurityHeaders } from './middleware/security';
import { getToken } from 'next-auth/jwt';

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

// List of paths that should NOT be redirected
// These are valid top-level routes in the application
const EXCLUDED_PATHS = [
  'companies',
  'api',
  'auth',
  'admin',
  'business',
  'dashboard',
  'categories',
  'contact',
  'rejoindre',
  'tarifs',
  'cgu',
  'cgv',
  'mentions-legales',
  'politique-de-confidentialite',
  'unsubscribe',
  '_next',
  'static',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  const { pathname } = url;

  // Vercel deployment URL'lerini kabul et
  const isVercelDomain = hostname.includes('.vercel.app');
  const isSupportedDomain = SUPPORTED_DOMAINS.includes(hostname);

  // Eğer desteklenmeyen bir domain ise ve Vercel domain'i de değilse hata göster
  if (!isSupportedDomain && !isVercelDomain) {
    return new NextResponse('Domain not found', { status: 404 });
  }

  // ============================================
  // LEGACY URL REDIRECT (301 - Permanent)
  // ============================================
  // Handle old URL format: /slug/ → /companies/slug
  // This preserves SEO value from old Google-indexed URLs
  
  const pathParts = pathname.split('/').filter(Boolean);
  
  // Check if this is a potential legacy URL (single-segment path)
  if (pathParts.length === 1) {
    const slug = pathParts[0];
    
    // Check if this slug is not an excluded path
    if (!EXCLUDED_PATHS.includes(slug) && !slug.includes('.')) {
      // This is likely a legacy company URL
      // Redirect to new format: /companies/slug
      const newUrl = url.clone();
      newUrl.pathname = `/companies/${slug}`;
      
      // Use 301 (permanent redirect) to preserve SEO value
      return NextResponse.redirect(newUrl, 301);
    }
  }

  // ============================================
  // AUTHENTICATION CHECKS
  // ============================================
  
  // Protected routes - Dashboard authentication check
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // Redirect to login with callback URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin panel kontrolü - bas-rhin.pro/admin veya localhost:3000/admin
  if (pathname.startsWith('/admin')) {
    // Admin sayfalarını /admin route'una yönlendir
    return NextResponse.rewrite(new URL(`/admin${pathname.replace('/admin', '')}${url.search}`, request.url));
  }

  // ============================================
  // MULTI-TENANT HEADER
  // ============================================
  
  // API route'ları için özel işlem yapma
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    response.headers.set('x-tenant-domain', hostname);
    return addSecurityHeaders(request, response);
  }

  // Domain'i header'a ekle
  const response = NextResponse.next();
  response.headers.set('x-tenant-domain', hostname);

  // Add security headers
  return addSecurityHeaders(request, response);
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

