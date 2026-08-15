import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Shared guard for machine-to-machine administrative endpoints that are
 * authenticated with a bearer secret instead of a user session.
 *
 * Security properties:
 *  - fail-closed: if `ADMIN_SECRET` is missing or too weak, every request is
 *    rejected. Previously these routes fell back to the hardcoded literal
 *    'your-secret-key', which made destructive operations reachable by anyone.
 *  - constant-time comparison: avoids leaking the secret through timing.
 */

const MIN_SECRET_LENGTH = 24;

/** Secrets that must never be accepted, even if explicitly configured. */
const FORBIDDEN_SECRETS = new Set([
  'your-secret-key',
  'changeme',
  'secret',
  'admin',
  'password',
]);

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');

  // timingSafeEqual throws when lengths differ, so compare lengths separately.
  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

/**
 * Verify the `Authorization: Bearer <secret>` header against `ADMIN_SECRET`.
 *
 * @returns `null` when the request is authorized, otherwise the error response
 *          that should be returned to the caller.
 */
export function verifyAdminSecret(request: Request): NextResponse | null {
  const configuredSecret = process.env.ADMIN_SECRET;

  if (
    !configuredSecret ||
    configuredSecret.length < MIN_SECRET_LENGTH ||
    FORBIDDEN_SECRETS.has(configuredSecret.toLowerCase())
  ) {
    // Do not disclose why the endpoint is unavailable.
    return NextResponse.json(
      { error: 'Endpoint disabled' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization') ?? '';
  const [scheme, ...rest] = authHeader.split(' ');
  const providedSecret = rest.join(' ').trim();

  if (
    scheme.toLowerCase() !== 'bearer' ||
    !providedSecret ||
    !safeCompare(providedSecret, configuredSecret)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
