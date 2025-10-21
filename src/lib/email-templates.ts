/**
 * Email Templates for Subscription Lifecycle
 */

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  subscriptionWelcome: (data: {
    companyName: string;
    planName: string;
    trialDays: number;
  }): EmailTemplate => ({
    subject: `Bienvenue chez ${data.companyName}! Votre essai gratuit a commencé`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue! 🎉</h1>
        </div>

        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
            Merci d'avoir choisi notre plateforme, ${data.companyName}!
          </p>

          <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0; color: #667eea;">Votre Essai Gratuit</h2>
            <p style="margin: 0; color: #374151;">
              <strong>${data.trialDays} jours</strong> d'accès complet au plan <strong>${data.planName}</strong>
            </p>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
              Pas de carte bancaire requise. Annulez à tout moment.
            </p>
          </div>

          <div style="margin: 30px 0;">
            <h3 style="color: #374151; margin: 0 0 15px 0;">Prochaines étapes:</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 8px 0; color: #374151;">✓ Complétez votre profil</li>
              <li style="padding: 8px 0; color: #374151;">✓ Ajoutez vos photos et vidéos</li>
              <li style="padding: 8px 0; color: #374151;">✓ Activez les notifications d'avis</li>
              <li style="padding: 8px 0; color: #374151;">✓ Explorez les fonctionnalités premium</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
              Aller au Tableau de Bord
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">Des questions? Nous sommes ici pour vous aider!</p>
            <p style="margin: 5px 0 0 0;">
              <a href="mailto:support@haguenau.pro" style="color: #667eea; text-decoration: none;">support@haguenau.pro</a>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
Bienvenue chez ${data.companyName}!

Votre essai gratuit a commencé. Vous avez accès au plan ${data.planName} pendant ${data.trialDays} jours.

Pas de carte bancaire requise. Annulez à tout moment.

Aller au tableau de bord: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Des questions? Contactez-nous: support@haguenau.pro
    `.trim(),
  }),

  subscriptionReminderExpiring: (data: {
    companyName: string;
    daysUntilExpiry: number;
    renewalUrl: string;
    planName: string;
  }): EmailTemplate => {
    const dayText =
      data.daysUntilExpiry === 1
        ? '1 jour'
        : `${data.daysUntilExpiry} jours`;

    return {
      subject: `⏰ Votre abonnement ${data.planName} expire dans ${dayText}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #fef3c7; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; border-left: 4px solid #f59e0b;">
            <h1 style="color: #92400e; margin: 0; font-size: 24px;">⏰ Rappel de Renouvellement</h1>
          </div>

          <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
              Bonjour ${data.companyName},
            </p>

            <div style="background: #fff7ed; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <h2 style="margin: 0 0 10px 0; color: #f59e0b;">Votre abonnement expire bientôt!</h2>
              <p style="margin: 0; color: #374151; font-size: 18px;">
                <strong>${dayText}</strong> avant l'expiration
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
                Veuillez renouveler votre abonnement pour continuer à profiter des avantages.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.renewalUrl}" style="background: #f59e0b; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                Renouveler Maintenant
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">
                Si vous n'avez plus besoin de cet abonnement, vous pouvez l'annuler sans frais.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Bonjour ${data.companyName},

Votre abonnement ${data.planName} expire dans ${dayText}.

Renouveler maintenant: ${data.renewalUrl}

Si vous n'avez plus besoin de cet abonnement, vous pouvez l'annuler sans frais.
      `.trim(),
    };
  },

  subscriptionExpired: (data: {
    companyName: string;
    renewalUrl: string;
  }): EmailTemplate => ({
    subject: `Votre abonnement a expiré - ${data.companyName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fecaca; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; border-left: 4px solid #ef4444;">
          <h1 style="color: #7f1d1d; margin: 0; font-size: 24px;">Abonnement Expiré</h1>
        </div>

        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
            Bonjour ${data.companyName},
          </p>

          <p style="color: #374151; margin: 0 0 20px 0;">
            Votre abonnement a expiré et votre annonce n'est plus visible sur la plateforme.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.renewalUrl}" style="background: #ef4444; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
              Renouveler l'Abonnement
            </a>
          </div>

          <div style="background: #fef2f2; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0; color: #374151;">
              Vos données et annonces sont conservées. Vous pouvez les réactiver en renouvelant votre abonnement.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
Bonjour ${data.companyName},

Votre abonnement a expiré et votre annonce n'est plus visible sur la plateforme.

Renouveler: ${data.renewalUrl}

Vos données et annonces sont conservées. Vous pouvez les réactiver en renouvelant votre abonnement.
    `.trim(),
  }),

  subscriptionCanceledConfirmation: (data: {
    companyName: string;
    expirationDate: string;
  }): EmailTemplate => ({
    subject: `Annulation d'abonnement confirmée - ${data.companyName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dbeafe; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; border-left: 4px solid #3b82f6;">
          <h1 style="color: #1e40af; margin: 0; font-size: 24px;">Annulation Confirmée</h1>
        </div>

        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
            Bonjour ${data.companyName},
          </p>

          <p style="color: #374151; margin: 0 0 20px 0;">
            Votre demande d'annulation a été confirmée.
          </p>

          <div style="background: #eff6ff; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0; color: #3b82f6;">Accès jusqu'au:</h2>
            <p style="margin: 0; color: #1e40af; font-size: 18px; font-weight: 600;">
              ${data.expirationDate}
            </p>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
              Votre abonnement sera automatiquement fermé à cette date.
            </p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">
              Vous pouvez annuler cette annulation à tout moment avant la date d'expiration.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
Bonjour ${data.companyName},

Votre demande d'annulation a été confirmée.

Accès jusqu'au: ${data.expirationDate}

Votre abonnement sera automatiquement fermé à cette date. Vous pouvez annuler cette annulation à tout moment avant cette date.
    `.trim(),
  }),
};

/**
 * Send email notification
 */
export async function sendEmailNotification(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const { to, subject, html, text } = params;

  // TODO: Implement with SendGrid or your email service
  logger.info(`📧 Email notification queued:`, {
    to,
    subject,
    htmlLength: html.length,
    textLength: text.length,
  });

  // Example with SendGrid:
  // const msg = {
  //   to,
  //   from: process.env.SENDGRID_FROM_EMAIL || 'noreply@haguenau.pro',
  //   subject,
  //   html,
  //   text,
  // };
  // await sgMail.send(msg);
}
