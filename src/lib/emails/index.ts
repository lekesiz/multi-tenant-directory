/**
 * Email Service
 * Handles all email sending using Resend
 */

import { logger } from '@/lib/logger';
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'notifications@haguenau.pro';
const REPLY_TO = process.env.RESEND_REPLY_TO || 'support@haguenau.pro';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const client = getResendClient();
    if (!client) {
      logger.warn('⚠️ RESEND_API_KEY not configured. Email not sent.');
      throw new Error('Email service not configured');
    }

    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || REPLY_TO,
      cc: options.cc,
      bcc: options.bcc,
    });

    logger.info('[Email] Sent successfully:', { id: result.data?.id, to: options.to });
    return result;
  } catch (error) {
    logger.error('[Email] Failed to send:', error);
    throw error;
  }
}

/**
 * Send bulk emails (batch)
 */
export async function sendBulkEmails(emails: EmailOptions[]) {
  try {
    const results = await Promise.allSettled(
      emails.map((email) => sendEmail(email))
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    logger.info(`[Email] Bulk send: ${succeeded} succeeded, ${failed} failed`);

    return results;
  } catch (error) {
    logger.error('[Email] Bulk send failed:', error);
    throw error;
  }
}

/**
 * Get unsubscribe URL
 */
export function getUnsubscribeUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/unsubscribe/${token}`;
}

/**
 * Get base URL for email links
 */
export function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}
