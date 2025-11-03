/**
 * Email Sending Functions
 * High-level functions for sending specific email types
 */

import { sendEmail } from './index';
import {
  getWelcomeEmailSubject,
  getWelcomeEmailHtml,
  getWelcomeEmailText,
  type WelcomeEmailData,
} from './templates/welcome';
import {
  getReviewAlertEmailSubject,
  getReviewAlertEmailHtml,
  getReviewAlertEmailText,
  type ReviewAlertEmailData,
} from './templates/review-alert';
import {
  getWeeklyDigestEmailSubject,
  getWeeklyDigestEmailHtml,
  getWeeklyDigestEmailText,
  type WeeklyDigestEmailData,
} from './templates/weekly-digest';

/**
 * Send welcome email to new business owner
 */
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  return sendEmail({
    to: data.email,
    subject: getWelcomeEmailSubject(data),
    html: getWelcomeEmailHtml(data),
    text: getWelcomeEmailText(data),
  });
}

/**
 * Send review alert email to business owner
 */
export async function sendReviewAlertEmail(data: ReviewAlertEmailData) {
  return sendEmail({
    to: data.businessOwnerName || data.companyName,
    subject: getReviewAlertEmailSubject(data),
    html: getReviewAlertEmailHtml(data),
    text: getReviewAlertEmailText(data),
  });
}

/**
 * Send weekly digest email to business owner
 */
export async function sendWeeklyDigestEmail(data: WeeklyDigestEmailData) {
  return sendEmail({
    to: data.businessOwnerName || data.companyName,
    subject: getWeeklyDigestEmailSubject(data),
    html: getWeeklyDigestEmailHtml(data),
    text: getWeeklyDigestEmailText(data),
  });
}

/**
 * Send subscription upgrade prompt email
 */
export async function sendUpgradePromptEmail({
  to,
  businessOwnerName,
  currentPlan,
  suggestedPlan,
  reason,
  unsubscribeToken,
}: {
  to: string;
  businessOwnerName?: string;
  currentPlan: string;
  suggestedPlan: string;
  reason: string;
  unsubscribeToken: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const unsubscribeUrl = `${baseUrl}/unsubscribe/${unsubscribeToken}`;

  return sendEmail({
    to,
    subject: `📸 Passez au plan ${suggestedPlan} pour débloquer plus de fonctionnalités`,
    html: `
      <h1>Débloquez plus de fonctionnalités!</h1>
      <p>${businessOwnerName ? `Bonjour ${businessOwnerName},` : 'Bonjour,'}</p>
      <p>${reason}</p>
      <p>
        Vous êtes actuellement sur le plan <strong>${currentPlan}</strong>.
        Passez au plan <strong>${suggestedPlan}</strong> pour:
      </p>
      <ul>
        <li>Photos illimitées</li>
        <li>Analytics avancées</li>
        <li>Support prioritaire</li>
        <li>Réponses IA automatiques</li>
      </ul>
      <a href="${baseUrl}/pricing" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Découvrir le plan ${suggestedPlan}
      </a>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        <a href="${unsubscribeUrl}">Se désabonner</a>
      </p>
    `,
  });
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail({
  to,
  businessOwnerName,
  amount,
  nextRetryDate,
  unsubscribeToken,
}: {
  to: string;
  businessOwnerName?: string;
  amount: number;
  nextRetryDate: Date;
  unsubscribeToken: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const unsubscribeUrl = `${baseUrl}/unsubscribe/${unsubscribeToken}`;

  return sendEmail({
    to,
    subject: '⚠️ Problème de paiement - Action requise',
    html: `
      <h1>Problème de paiement</h1>
      <p>${businessOwnerName ? `Bonjour ${businessOwnerName},` : 'Bonjour,'}</p>
      <p>
        Nous n'avons pas pu traiter votre paiement de <strong>€${amount}</strong>.
      </p>
      <p>
        Pour continuer à profiter de toutes les fonctionnalités, veuillez mettre à jour
        votre mode de paiement.
      </p>
      <p>
        Prochaine tentative: <strong>${nextRetryDate.toLocaleDateString('fr-FR')}</strong>
      </p>
      <a href="${baseUrl}/business/dashboard/billing" style="display: inline-block; background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Mettre à jour le paiement
      </a>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        <a href="${unsubscribeUrl}">Se désabonner</a>
      </p>
    `,
  });
}

/**
 * Send payment success email
 */
export async function sendPaymentSuccessEmail({
  to,
  businessOwnerName,
  amount,
  plan,
  nextBillingDate,
  invoiceUrl,
  unsubscribeToken,
}: {
  to: string;
  businessOwnerName?: string;
  amount: number;
  plan: string;
  nextBillingDate: Date;
  invoiceUrl: string;
  unsubscribeToken: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const unsubscribeUrl = `${baseUrl}/unsubscribe/${unsubscribeToken}`;

  return sendEmail({
    to,
    subject: `✓ Paiement confirmé - Plan ${plan}`,
    html: `
      <h1>Paiement confirmé!</h1>
      <p>${businessOwnerName ? `Bonjour ${businessOwnerName},` : 'Bonjour,'}</p>
      <p>
        Votre paiement de <strong>€${amount}</strong> a été traité avec succès.
      </p>
      <p>
        Plan actif: <strong>${plan}</strong><br>
        Prochaine facturation: <strong>${nextBillingDate.toLocaleDateString('fr-FR')}</strong>
      </p>
      <a href="${invoiceUrl}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Télécharger la facture
      </a>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        <a href="${baseUrl}/business/dashboard/billing">Gérer mon abonnement</a> |
        <a href="${unsubscribeUrl}">Se désabonner</a>
      </p>
    `,
  });
}


/**
 * Newsletter Email Functions
 */

import { generateNewsletterWelcomeEmail } from './templates/newsletter-welcome';
import { generateNewsletterDigestEmail } from './templates/newsletter-digest';
import { generateNewsletterUnsubscribeEmail } from './templates/newsletter-unsubscribe';

/**
 * Send newsletter welcome email
 */
export async function sendNewsletterWelcomeEmail({
  email,
  firstName,
  domainName,
  domainUrl,
}: {
  email: string;
  firstName?: string;
  domainName: string;
  domainUrl: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || domainUrl;
  const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
  const preferencesUrl = `${baseUrl}/newsletter/preferences?email=${encodeURIComponent(email)}`;

  const { subject, html, text } = generateNewsletterWelcomeEmail({
    email,
    firstName,
    domainName,
    domainUrl,
    unsubscribeUrl,
    preferencesUrl,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send newsletter weekly digest email
 */
export async function sendNewsletterDigestEmail({
  email,
  firstName,
  domainName,
  domainUrl,
  newCompanies,
  topRatedCompanies,
  weekNumber,
  year,
}: {
  email: string;
  firstName?: string;
  domainName: string;
  domainUrl: string;
  newCompanies: any[];
  topRatedCompanies: any[];
  weekNumber: number;
  year: number;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || domainUrl;
  const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
  const preferencesUrl = `${baseUrl}/newsletter/preferences?email=${encodeURIComponent(email)}`;

  const { subject, html, text } = generateNewsletterDigestEmail({
    email,
    firstName,
    domainName,
    domainUrl,
    newCompanies,
    topRatedCompanies,
    weekNumber,
    year,
    unsubscribeUrl,
    preferencesUrl,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send newsletter unsubscribe confirmation email
 */
export async function sendNewsletterUnsubscribeEmail({
  email,
  firstName,
  domainName,
  domainUrl,
  reason,
}: {
  email: string;
  firstName?: string;
  domainName: string;
  domainUrl: string;
  reason?: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || domainUrl;
  const resubscribeUrl = `${baseUrl}/newsletter/subscribe?email=${encodeURIComponent(email)}`;

  const { subject, html, text } = generateNewsletterUnsubscribeEmail({
    email,
    firstName,
    domainName,
    domainUrl,
    resubscribeUrl,
    reason,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

