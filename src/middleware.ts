import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Desteklenen domain'ler
const SUPPORTED_DOMAINS = [
  'bischwiller.pro',
  'bouxwiller.pro',
  'brumath.pro',
  'haguenau.pro',
  'hoerdt.pro',
  'ingwiller.pro',
  'saverne.pro',
  'schiltigheim.pro',
  'schweighouse.pro',
  'souffelweyersheim.pro',
  'soufflenheim.pro',
  'wissembourg.pro',
  'localhost:3000', // Development için
];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Admin panel kontrolü - haguenau.pro/admin veya localhost:3000/admin
  if (url.pathname.startsWith('/admin')) {
    // Admin login sayfası hariç, authentication kontrol et
    if (url.pathname !== '/admin/login' && !url.pathname.startsWith('/api/auth')) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
    
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

