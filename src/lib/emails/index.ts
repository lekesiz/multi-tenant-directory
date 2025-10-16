/**
 * Email Service
 * Handles all email sending using Resend
 */

import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo || REPLY_TO,
      cc: options.cc,
      bcc: options.bcc,
    });

    console.log('[Email] Sent successfully:', { id: result.data?.id, to: options.to });
    return result;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
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

    console.log(`[Email] Bulk send: ${succeeded} succeeded, ${failed} failed`);

    return results;
  } catch (error) {
    console.error('[Email] Bulk send failed:', error);
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
