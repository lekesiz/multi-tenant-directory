import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates CRON job authentication
 * Checks for CRON_SECRET in Authorization header
 * 
 * Usage in CRON endpoints:
 * ```ts
 * import { validateCronAuth } from '@/lib/cron-auth';
 * 
 * export async function GET(request: NextRequest) {
 *   const authError = validateCronAuth(request);
 *   if (authError) return authError;
 *   
 *   // Your CRON logic here
 * }
 * ```
 */
export function validateCronAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Check if CRON_SECRET is configured
  if (!cronSecret) {
    console.error('[CRON Auth] CRON_SECRET is not configured');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Check if authorization header exists
  if (!authHeader) {
    console.warn('[CRON Auth] Missing authorization header');
    return NextResponse.json(
      { error: 'Unauthorized: Missing authorization header' },
      { status: 401 }
    );
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.replace('Bearer ', '');

  // Validate token
  if (token !== cronSecret) {
    console.warn('[CRON Auth] Invalid CRON secret');
    return NextResponse.json(
      { error: 'Unauthorized: Invalid credentials' },
      { status: 401 }
    );
  }

  // Authentication successful
  return null;
}

/**
 * Helper to create authenticated CRON request headers
 * Use this when testing CRON endpoints locally
 */
export function createCronHeaders(): HeadersInit {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    throw new Error('CRON_SECRET is not configured');
  }

  return {
    'Authorization': `Bearer ${cronSecret}`,
    'Content-Type': 'application/json',
  };
}

