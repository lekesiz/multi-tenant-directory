import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addSecurityHeaders } from './middleware/security';
import { getToken } from 'next-auth/jwt';

export const runtime = 'nodejs';

// Desteklenen domain'ler
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
  'localhost:3000',
];

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
  'annuaire',
  '_next',
  'static',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
];

export async function middleware(request: NextRequest) {
  try {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl;
    const { pathname } = url;

    const isVercelDomain = hostname.includes('.vercel.app');
    const isSupportedDomain = SUPPORTED_DOMAINS.includes(hostname);

    if (!isSupportedDomain && !isVercelDomain) {
      return new NextResponse('Domain not found', { status: 404 });
    }

    // Legacy URL redirect
    const pathParts = pathname.split('/').filter(Boolean);

    if (pathParts.length === 1) {
      const slug = pathParts[0];

      if (!EXCLUDED_PATHS.includes(slug) && !slug.includes('.')) {
        const newUrl = url.clone();
        newUrl.pathname = `/companies/${slug}`;
        return NextResponse.redirect(newUrl, 301);
      }
    }

    // Dashboard authentication
    if (pathname.startsWith('/dashboard')) {
      try {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
          const loginUrl = new URL('/auth/login', request.url);
          loginUrl.searchParams.set('callbackUrl', pathname);
          return NextResponse.redirect(loginUrl);
        }
      } catch (err) {
        logger.error('Auth token error:', err);
        // If token retrieval fails, allow request to proceed
        // The page will handle auth appropriately
      }
    }

    if (pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL(`/admin${pathname.replace('/admin', '')}${url.search}`, request.url));
    }

    // Add headers
    const response = NextResponse.next();
    response.headers.set('x-tenant-domain', hostname);

    return addSecurityHeaders(request, response);
  } catch (error) {
    logger.error('Middleware error:', error);
    // On error, continue with next middleware
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
