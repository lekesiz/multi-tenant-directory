/**
 * Email template helper functions
 * Generates HTML email templates for various notifications
 */

interface BusinessOwnerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessName: string;
  createdAt: Date;
}

/**
 * Generate HTML email template for admin notification when a new business registers
 */
export function getAdminNotificationEmailHtml(ownerInfo: BusinessOwnerInfo): string {
  const { firstName, lastName, email, phone, businessName, createdAt } = ownerInfo;
  const registrationDate = new Date(createdAt).toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle inscription entreprise</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 30px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .info-section {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      margin: 10px 0;
    }
    .info-label {
      font-weight: 600;
      min-width: 150px;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #ffc107;
      color: #000;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Nouvelle inscription entreprise</h1>
    </div>

    <p>Une nouvelle entreprise vient de s'inscrire sur la plateforme et attend votre approbation.</p>

    <div class="info-section">
      <h2 style="margin-top: 0; color: #667eea;">Informations du propriétaire</h2>

      <div class="info-row">
        <span class="info-label">Nom complet:</span>
        <span class="info-value">${firstName} ${lastName}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value"><a href="mailto:${email}" style="color: #667eea;">${email}</a></span>
      </div>

      ${phone ? `
      <div class="info-row">
        <span class="info-label">Téléphone:</span>
        <span class="info-value"><a href="tel:${phone}" style="color: #667eea;">${phone}</a></span>
      </div>
      ` : ''}

      <div class="info-row">
        <span class="info-label">Date d'inscription:</span>
        <span class="info-value">${registrationDate}</span>
      </div>
    </div>

    <div class="info-section">
      <h2 style="margin-top: 0; color: #667eea;">Informations de l'entreprise</h2>

      <div class="info-row">
        <span class="info-label">Nom de l'entreprise:</span>
        <span class="info-value"><strong>${businessName}</strong></span>
      </div>

      <div class="info-row">
        <span class="info-label">Statut:</span>
        <span class="info-value">
          En attente d'approbation
          <span class="badge">ACTION REQUISE</span>
        </span>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/companies" class="button">
        Gérer dans le panneau d'administration
      </a>
    </div>

    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin: 20px 0;">
      <strong style="color: #856404;">⚠️ Action requise:</strong>
      <p style="margin: 10px 0 0 0; color: #856404;">
        Veuillez vérifier les informations de l'entreprise et approuver ou rejeter l'inscription depuis votre panneau d'administration.
      </p>
    </div>

    <div class="footer">
      <p>Cet email a été envoyé automatiquement par le système Haguenau.pro</p>
      <p style="font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} Haguenau.pro - Tous droits réservés
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version for admin notification email
 */
export function getAdminNotificationEmailText(ownerInfo: BusinessOwnerInfo): string {
  const { firstName, lastName, email, phone, businessName, createdAt } = ownerInfo;
  const registrationDate = new Date(createdAt).toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
NOUVELLE INSCRIPTION ENTREPRISE

Une nouvelle entreprise vient de s'inscrire sur la plateforme et attend votre approbation.

INFORMATIONS DU PROPRIÉTAIRE
=============================
Nom complet: ${firstName} ${lastName}
Email: ${email}
${phone ? `Téléphone: ${phone}` : ''}
Date d'inscription: ${registrationDate}

INFORMATIONS DE L'ENTREPRISE
============================
Nom de l'entreprise: ${businessName}
Statut: En attente d'approbation

ACTION REQUISE
==============
Veuillez vérifier les informations de l'entreprise et approuver ou rejeter l'inscription depuis votre panneau d'administration.

Lien: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/companies

---
Cet email a été envoyé automatiquement par le système Haguenau.pro
© ${new Date().getFullYear()} Haguenau.pro - Tous droits réservés
  `.trim();
}

/**
 * Send admin notification email
 */
export async function sendAdminNotificationEmail(ownerInfo: BusinessOwnerInfo): Promise<boolean> {
  // Get admin email from environment variable
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not configured, skipping admin notification');
    return false;
  }

  // Only send if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping admin notification');
    return false;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@haguenau.pro',
      to: adminEmail,
      subject: `Nouvelle inscription: ${ownerInfo.businessName}`,
      html: getAdminNotificationEmailHtml(ownerInfo),
      text: getAdminNotificationEmailText(ownerInfo),
    });

    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
}

/**
 * Send lead notification email (stub for assignments dispatch)
 * TODO: Implement proper lead notification email template
 */
export async function sendLeadNotificationEmail(email: string, data: any): Promise<boolean> {
  console.warn('sendLeadNotificationEmail not fully implemented yet');
  return false;
}
