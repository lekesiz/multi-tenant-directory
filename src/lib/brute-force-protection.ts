import { logger } from '@/lib/logger';
import { logger } from './logger';

/**
 * Brute Force Protection
 *
 * Protects against brute force attacks by rate limiting login attempts
 * and password reset requests based on IP address and email.
 *
 * Uses in-memory storage for development. For production, use Redis.
 */

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil?: number;
}

// In-memory storage (use Redis in production)
const loginAttempts = new Map<string, AttemptRecord>();
const passwordResetAttempts = new Map<string, AttemptRecord>();

// Configuration
const LOGIN_CONFIG = {
  maxAttempts: 5, // Max failed login attempts
  windowMs: 15 * 60 * 1000, // 15 minutes window
  blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes after max attempts
};

const PASSWORD_RESET_CONFIG = {
  maxAttempts: 3, // Max password reset requests
  windowMs: 60 * 60 * 1000, // 1 hour window
  blockDurationMs: 60 * 60 * 1000, // Block for 1 hour after max attempts
};

/**
 * Get client identifier (IP + User Agent hash)
 */
function getClientIdentifier(request: Request): string {
  // Get IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  // Get user agent
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Create a simple hash of user agent
  const uaHash = Array.from(userAgent)
    .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
    .toString(36);

  return `${ip}:${uaHash}`;
}

/**
 * Check if client is currently blocked
 */
function isBlocked(record: AttemptRecord | undefined): boolean {
  if (!record || !record.blockedUntil) {
    return false;
  }

  return Date.now() < record.blockedUntil;
}

/**
 * Clean up old records (older than window)
 */
function cleanupOldRecords(
  storage: Map<string, AttemptRecord>,
  windowMs: number
): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  storage.forEach((record, key) => {
    // Delete if last attempt was more than window ago and not blocked
    if (
      now - record.lastAttempt > windowMs &&
      (!record.blockedUntil || now > record.blockedUntil)
    ) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => storage.delete(key));
}

/**
 * Check login attempt rate limit
 *
 * @param request - The HTTP request
 * @param email - User's email address
 * @returns Object with allowed status and remaining attempts
 */
export async function checkLoginRateLimit(
  request: Request,
  email: string
): Promise<{
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil?: Date;
  retryAfter?: number;
}> {
  const clientId = getClientIdentifier(request);
  const key = `login:${clientId}:${email.toLowerCase()}`;

  // Clean up old records periodically
  if (Math.random() < 0.01) {
    // 1% chance
    cleanupOldRecords(loginAttempts, LOGIN_CONFIG.windowMs);
  }

  const record = loginAttempts.get(key);
  const now = Date.now();

  // Check if currently blocked
  if (isBlocked(record)) {
    const retryAfter = Math.ceil((record!.blockedUntil! - now) / 1000);

    logger.warn('Login attempt blocked - brute force protection', {
      email,
      clientId,
      attempts: record!.count,
      blockedUntil: new Date(record!.blockedUntil!),
    });

    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: new Date(record!.blockedUntil!),
      retryAfter,
    };
  }

  // Check if window has expired
  if (record && now - record.firstAttempt > LOGIN_CONFIG.windowMs) {
    // Window expired, reset counter
    loginAttempts.delete(key);
    return {
      allowed: true,
      remainingAttempts: LOGIN_CONFIG.maxAttempts,
    };
  }

  // Calculate remaining attempts
  const currentCount = record?.count || 0;
  const remainingAttempts = Math.max(0, LOGIN_CONFIG.maxAttempts - currentCount);

  return {
    allowed: remainingAttempts > 0,
    remainingAttempts,
  };
}

/**
 * Record failed login attempt
 *
 * @param request - The HTTP request
 * @param email - User's email address
 */
export async function recordFailedLogin(
  request: Request,
  email: string
): Promise<void> {
  const clientId = getClientIdentifier(request);
  const key = `login:${clientId}:${email.toLowerCase()}`;
  const now = Date.now();

  const record = loginAttempts.get(key);

  if (!record) {
    // First failed attempt
    loginAttempts.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });

    logger.info('Failed login attempt recorded', {
      email,
      attemptNumber: 1,
    });
  } else {
    // Increment counter
    record.count++;
    record.lastAttempt = now;

    // Check if max attempts reached
    if (record.count >= LOGIN_CONFIG.maxAttempts) {
      record.blockedUntil = now + LOGIN_CONFIG.blockDurationMs;

      logger.warn('User blocked due to too many failed login attempts', {
        email,
        clientId,
        attempts: record.count,
        blockedUntil: new Date(record.blockedUntil),
      });
    } else {
      logger.info('Failed login attempt recorded', {
        email,
        attemptNumber: record.count,
        remainingAttempts: LOGIN_CONFIG.maxAttempts - record.count,
      });
    }

    loginAttempts.set(key, record);
  }
}

/**
 * Clear failed login attempts (on successful login)
 *
 * @param request - The HTTP request
 * @param email - User's email address
 */
export async function clearFailedLogins(
  request: Request,
  email: string
): Promise<void> {
  const clientId = getClientIdentifier(request);
  const key = `login:${clientId}:${email.toLowerCase()}`;

  if (loginAttempts.has(key)) {
    loginAttempts.delete(key);

    logger.info('Failed login attempts cleared', {
      email,
    });
  }
}

/**
 * Check password reset rate limit
 *
 * @param request - The HTTP request
 * @param email - User's email address
 * @returns Object with allowed status and remaining attempts
 */
export async function checkPasswordResetRateLimit(
  request: Request,
  email: string
): Promise<{
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil?: Date;
  retryAfter?: number;
}> {
  const clientId = getClientIdentifier(request);
  const key = `reset:${clientId}:${email.toLowerCase()}`;

  // Clean up old records periodically
  if (Math.random() < 0.01) {
    cleanupOldRecords(passwordResetAttempts, PASSWORD_RESET_CONFIG.windowMs);
  }

  const record = passwordResetAttempts.get(key);
  const now = Date.now();

  // Check if currently blocked
  if (isBlocked(record)) {
    const retryAfter = Math.ceil((record!.blockedUntil! - now) / 1000);

    logger.warn('Password reset blocked - brute force protection', {
      email,
      clientId,
      attempts: record!.count,
      blockedUntil: new Date(record!.blockedUntil!),
    });

    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: new Date(record!.blockedUntil!),
      retryAfter,
    };
  }

  // Check if window has expired
  if (record && now - record.firstAttempt > PASSWORD_RESET_CONFIG.windowMs) {
    // Window expired, reset counter
    passwordResetAttempts.delete(key);
    return {
      allowed: true,
      remainingAttempts: PASSWORD_RESET_CONFIG.maxAttempts,
    };
  }

  // Calculate remaining attempts
  const currentCount = record?.count || 0;
  const remainingAttempts = Math.max(
    0,
    PASSWORD_RESET_CONFIG.maxAttempts - currentCount
  );

  return {
    allowed: remainingAttempts > 0,
    remainingAttempts,
  };
}

/**
 * Record password reset attempt
 *
 * @param request - The HTTP request
 * @param email - User's email address
 */
export async function recordPasswordResetAttempt(
  request: Request,
  email: string
): Promise<void> {
  const clientId = getClientIdentifier(request);
  const key = `reset:${clientId}:${email.toLowerCase()}`;
  const now = Date.now();

  const record = passwordResetAttempts.get(key);

  if (!record) {
    // First attempt
    passwordResetAttempts.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });

    logger.info('Password reset attempt recorded', {
      email,
      attemptNumber: 1,
    });
  } else {
    // Increment counter
    record.count++;
    record.lastAttempt = now;

    // Check if max attempts reached
    if (record.count >= PASSWORD_RESET_CONFIG.maxAttempts) {
      record.blockedUntil = now + PASSWORD_RESET_CONFIG.blockDurationMs;

      logger.warn('Password reset blocked due to too many attempts', {
        email,
        clientId,
        attempts: record.count,
        blockedUntil: new Date(record.blockedUntil),
      });
    } else {
      logger.info('Password reset attempt recorded', {
        email,
        attemptNumber: record.count,
        remainingAttempts: PASSWORD_RESET_CONFIG.maxAttempts - record.count,
      });
    }

    passwordResetAttempts.set(key, record);
  }
}

/**
 * Get statistics about brute force protection
 * (For admin dashboard)
 */
export function getBruteForceStats(): {
  loginAttempts: number;
  blockedLogins: number;
  passwordResetAttempts: number;
  blockedResets: number;
} {
  const now = Date.now();

  let blockedLogins = 0;
  loginAttempts.forEach(record => {
    if (isBlocked(record)) {
      blockedLogins++;
    }
  });

  let blockedResets = 0;
  passwordResetAttempts.forEach(record => {
    if (isBlocked(record)) {
      blockedResets++;
    }
  });

  return {
    loginAttempts: loginAttempts.size,
    blockedLogins,
    passwordResetAttempts: passwordResetAttempts.size,
    blockedResets,
  };
}
