import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * CSRF Protection Middleware
 *
 * Protects against Cross-Site Request Forgery attacks by verifying
 * that requests come from the same origin.
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

// Routes that require CSRF protection (state-changing operations)
const PROTECTED_ROUTES = [
  '/api/auth/',
  '/api/business/register',
  '/api/business/login',
  '/api/companies/',
  '/api/reviews/',
  '/api/billing/',
  '/api/stripe/',
  '/api/admin/',
];

// Routes that are exempt from CSRF protection
const EXEMPT_ROUTES = [
  '/api/auth/callback',  // OAuth callbacks
  '/api/stripe/webhook', // Stripe webhooks (verified by signature)
  '/api/billing/webhook', // Billing webhooks (verified by signature)
];

/**
 * Check if a route requires CSRF protection
 */
function requiresCsrfProtection(pathname: string): boolean {
  // Check if route is exempt
  if (EXEMPT_ROUTES.some(route => pathname.startsWith(route))) {
    return false;
  }

  // Check if route is protected
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verify CSRF token using Double Submit Cookie pattern
 *
 * This implementation uses the "Double Submit Cookie" pattern:
 * 1. Client receives a random CSRF token in a cookie
 * 2. Client must send the same token in a custom header
 * 3. Server verifies that both tokens match
 */
export function verifyCsrfToken(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;

  // Skip CSRF check for GET, HEAD, OPTIONS (safe methods)
  const method = request.method;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  // Skip CSRF check for routes that don't require it
  if (!requiresCsrfProtection(pathname)) {
    return true;
  }

  // Get CSRF token from cookie
  const cookieToken = request.cookies.get('csrf-token')?.value;

  // Get CSRF token from header
  const headerToken = request.headers.get('x-csrf-token');

  // Both tokens must exist and match
  if (!cookieToken || !headerToken) {
    logger.warn('CSRF check failed: Missing token', {
      pathname,
      method,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
    });
    return false;
  }

  if (cookieToken !== headerToken) {
    logger.warn('CSRF check failed: Token mismatch', {
      pathname,
      method,
    });
    return false;
  }

  return true;
}

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  // Generate a random 32-character hex string
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * CSRF Protection Middleware
 *
 * Usage in middleware.ts:
 * ```typescript
 * import { csrfProtection } from '@/middleware/csrf';
 *
 * export function middleware(request: NextRequest) {
 *   return csrfProtection(request);
 * }
 * ```
 */
export function csrfProtection(request: NextRequest): NextResponse | null {
  // Verify CSRF token
  const isValid = verifyCsrfToken(request);

  if (!isValid) {
    logger.error('CSRF attack detected', {
      pathname: request.nextUrl.pathname,
      method: request.method,
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    });

    return NextResponse.json(
      {
        error: 'CSRF token validation failed',
        message: 'Invalid or missing CSRF token',
      },
      { status: 403 }
    );
  }

  // CSRF check passed, continue
  return null;
}

/**
 * Add CSRF token to response cookies
 *
 * Usage in API routes or pages:
 * ```typescript
 * const response = NextResponse.json({ ... });
 * setCsrfToken(response);
 * return response;
 * ```
 */
export function setCsrfToken(response: NextResponse): void {
  // Check if CSRF token already exists in cookies
  const existingToken = response.cookies.get('csrf-token')?.value;

  if (!existingToken) {
    const token = generateCsrfToken();

    response.cookies.set('csrf-token', token, {
      httpOnly: false, // Must be accessible to JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }
}

/**
 * Get CSRF token from request cookies
 */
export function getCsrfToken(request: NextRequest): string | undefined {
  return request.cookies.get('csrf-token')?.value;
}
