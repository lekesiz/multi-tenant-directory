/**
 * Newsletter Unsubscribe Confirmation Email Template
 * Sent when user unsubscribes from newsletter
 */

interface NewsletterUnsubscribeEmailProps {
  email: string;
  firstName?: string;
  domainName: string;
  domainUrl: string;
  resubscribeUrl: string;
  reason?: string;
}

export function generateNewsletterUnsubscribeEmail({
  email,
  firstName,
  domainName,
  domainUrl,
  resubscribeUrl,
  reason,
}: NewsletterUnsubscribeEmailProps): { subject: string; html: string; text: string } {
  const displayName = firstName || email.split('@')[0];

  const subject = `Désabonnement confirmé - ${domainName}`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background-color: #F3F4F6; padding: 30px 20px; text-align: center; border-bottom: 1px solid #E5E7EB;">
      <div style="font-size: 48px; margin-bottom: 10px;">😔</div>
      <h1 style="color: #1F2937; margin: 0; font-size: 24px; font-weight: 700;">
        Désabonnement confirmé
      </h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px; color: #333333;">
      <h2 style="color: #1F2937; font-size: 20px; margin-top: 0;">
        Au revoir ${displayName},
      </h2>
      
      <p style="color: #4B5563; line-height: 1.6; margin: 16px 0; font-size: 16px;">
        Votre désabonnement de notre newsletter a été confirmé. Vous ne recevrez plus d'emails de notre part.
      </p>

      ${reason ? `
        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400E; font-size: 14px;">
            <strong>Raison du désabonnement :</strong><br>
            ${reason}
          </p>
        </div>
      ` : ''}

      <p style="color: #4B5563; line-height: 1.6; margin: 24px 0; font-size: 16px;">
        Nous sommes désolés de vous voir partir. Vos retours sont précieux pour nous aider à améliorer notre service.
      </p>

      <div style="background-color: #F3F4F6; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #1F2937; font-size: 18px; margin-top: 0;">
          Vous avez changé d'avis ?
        </h3>
        <p style="color: #4B5563; font-size: 15px; line-height: 1.6; margin: 12px 0;">
          Vous pouvez vous réabonner à tout moment en cliquant sur le bouton ci-dessous :
        </p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${resubscribeUrl}" style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Se réabonner
          </a>
        </div>
      </div>

      <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 32px 0;">
        <strong>Note :</strong> Vous continuerez à recevoir des emails transactionnels importants concernant votre compte (si vous en avez un), tels que les confirmations de commande ou les notifications de sécurité.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${domainUrl}" style="display: inline-block; color: #3B82F6; text-decoration: none; font-size: 15px; font-weight: 600;">
          Visiter ${domainName} →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #F9FAFB; padding: 24px 20px; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="margin: 8px 0; font-size: 14px; color: #6B7280;">
        <strong>${domainName}</strong><br>
        Votre guide local de confiance
      </p>
      
      <p style="font-size: 12px; color: #9CA3AF; margin-top: 16px;">
        © ${new Date().getFullYear()} ${domainName}. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Désabonnement confirmé - ${domainName}

Au revoir ${displayName},

Votre désabonnement de notre newsletter a été confirmé. Vous ne recevrez plus d'emails de notre part.

${reason ? `Raison du désabonnement : ${reason}\n` : ''}

Nous sommes désolés de vous voir partir. Vos retours sont précieux pour nous aider à améliorer notre service.

VOUS AVEZ CHANGÉ D'AVIS ?

Vous pouvez vous réabonner à tout moment :
${resubscribeUrl}

Note : Vous continuerez à recevoir des emails transactionnels importants concernant votre compte (si vous en avez un), tels que les confirmations de commande ou les notifications de sécurité.

Visiter ${domainName} : ${domainUrl}

---

${domainName}
Votre guide local de confiance

© ${new Date().getFullYear()} ${domainName}. Tous droits réservés.
  `.trim();

  return { subject, html, text };
}

