import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

/**
 * Generate a secure random verification token
 */
export function generateVerificationToken(): string {
  return nanoid(64); // 64 character URL-safe token
}

/**
 * Create a verification token for email verification
 */
export async function createEmailVerificationToken(email: string) {
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      email,
      type: 'email_verification',
    },
  });

  // Create new token that expires in 24 hours
  const token = generateVerificationToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      token,
      type: 'email_verification',
      expiresAt,
    },
  });

  return verificationToken;
}

/**
 * Create a password reset token
 */
export async function createPasswordResetToken(email: string) {
  // Delete any existing password reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      email,
      type: 'password_reset',
    },
  });

  // Create new token that expires in 1 hour
  const token = generateVerificationToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      token,
      type: 'password_reset',
      expiresAt,
    },
  });

  return verificationToken;
}

/**
 * Verify a token and return the associated email if valid
 */
export async function verifyToken(token: string, type: string = 'email_verification') {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return { valid: false, error: 'Token invalide' };
  }

  if (verificationToken.type !== type) {
    return { valid: false, error: 'Type de token incorrect' };
  }

  if (verificationToken.expiresAt < new Date()) {
    // Token expired, delete it
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    return { valid: false, error: 'Token expiré' };
  }

  return { valid: true, email: verificationToken.email, tokenId: verificationToken.id };
}

/**
 * Delete a verification token after successful verification
 */
export async function deleteVerificationToken(tokenId: string) {
  await prisma.verificationToken.delete({
    where: { id: tokenId },
  });
}

/**
 * Clean up expired tokens (can be run periodically)
 */
export async function cleanupExpiredTokens() {
  const result = await prisma.verificationToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}
