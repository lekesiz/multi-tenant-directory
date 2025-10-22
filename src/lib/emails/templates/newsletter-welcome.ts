/**
 * Newsletter Welcome Email Template
 * Sent when user subscribes to newsletter
 */

interface NewsletterWelcomeEmailProps {
  email: string;
  firstName?: string;
  domainName: string;
  domainUrl: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export function generateNewsletterWelcomeEmail({
  email,
  firstName,
  domainName,
  domainUrl,
  unsubscribeUrl,
  preferencesUrl,
}: NewsletterWelcomeEmailProps): { subject: string; html: string; text: string } {
  const displayName = firstName || email.split('@')[0];

  const subject = `Bienvenue sur ${domainName} ! 🎉`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header .emoji {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .content h2 {
      color: #1F2937;
      font-size: 22px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .content p {
      margin: 16px 0;
      font-size: 16px;
      color: #4B5563;
    }
    .benefits {
      background-color: #F3F4F6;
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
    }
    .benefit-item {
      display: flex;
      align-items: flex-start;
      margin: 12px 0;
    }
    .benefit-icon {
      color: #3B82F6;
      font-size: 20px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .benefit-text {
      color: #374151;
      font-size: 15px;
    }
    .cta-button {
      display: inline-block;
      background-color: #3B82F6;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      transition: background-color 0.3s;
    }
    .cta-button:hover {
      background-color: #2563EB;
    }
    .footer {
      background-color: #F9FAFB;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #E5E7EB;
    }
    .footer p {
      margin: 8px 0;
      font-size: 14px;
      color: #6B7280;
    }
    .footer a {
      color: #3B82F6;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #6B7280;
      text-decoration: none;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="emoji">🎉</div>
      <h1>Bienvenue sur ${domainName} !</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Bonjour ${displayName},</h2>
      
      <p>
        Merci de vous être abonné(e) à notre newsletter ! Nous sommes ravis de vous compter parmi nos abonnés.
      </p>

      <p>
        Vous recevrez désormais les dernières actualités, nouveautés et offres exclusives directement dans votre boîte mail.
      </p>

      <!-- Benefits -->
      <div class="benefits">
        <div class="benefit-item">
          <span class="benefit-icon">✨</span>
          <span class="benefit-text">
            <strong>Nouvelles entreprises</strong> - Soyez les premiers informés des nouveaux établissements
          </span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">📊</span>
          <span class="benefit-text">
            <strong>Résumé hebdomadaire</strong> - Un condensé des meilleures adresses de la semaine
          </span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">🎁</span>
          <span class="benefit-text">
            <strong>Offres exclusives</strong> - Des promotions réservées à nos abonnés
          </span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">⭐</span>
          <span class="benefit-text">
            <strong>Avis et recommandations</strong> - Les meilleures adresses selon notre communauté
          </span>
        </div>
      </div>

      <p>
        Vous pouvez personnaliser vos préférences à tout moment pour recevoir uniquement les informations qui vous intéressent.
      </p>

      <center>
        <a href="${preferencesUrl}" class="cta-button">
          Gérer mes préférences
        </a>
      </center>

      <p style="margin-top: 32px; font-size: 15px; color: #6B7280;">
        Nous nous engageons à respecter votre vie privée et à ne jamais partager vos informations avec des tiers.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        <strong>${domainName}</strong><br>
        Votre guide local de confiance
      </p>
      
      <div class="social-links">
        <a href="${domainUrl}">Visiter le site</a>
        <span>•</span>
        <a href="${preferencesUrl}">Préférences</a>
        <span>•</span>
        <a href="${unsubscribeUrl}">Se désabonner</a>
      </div>

      <p style="font-size: 12px; color: #9CA3AF; margin-top: 20px;">
        Vous recevez cet email car vous vous êtes abonné(e) à notre newsletter.<br>
        Si vous ne souhaitez plus recevoir nos emails, vous pouvez vous <a href="${unsubscribeUrl}">désabonner</a>.
      </p>

      <p style="font-size: 12px; color: #9CA3AF;">
        © ${new Date().getFullYear()} ${domainName}. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Bienvenue sur ${domainName} !

Bonjour ${displayName},

Merci de vous être abonné(e) à notre newsletter ! Nous sommes ravis de vous compter parmi nos abonnés.

Vous recevrez désormais les dernières actualités, nouveautés et offres exclusives directement dans votre boîte mail.

Ce que vous allez recevoir :
✨ Nouvelles entreprises - Soyez les premiers informés des nouveaux établissements
📊 Résumé hebdomadaire - Un condensé des meilleures adresses de la semaine
🎁 Offres exclusives - Des promotions réservées à nos abonnés
⭐ Avis et recommandations - Les meilleures adresses selon notre communauté

Vous pouvez personnaliser vos préférences à tout moment :
${preferencesUrl}

Nous nous engageons à respecter votre vie privée et à ne jamais partager vos informations avec des tiers.

---

${domainName}
Votre guide local de confiance

Visiter le site : ${domainUrl}
Gérer mes préférences : ${preferencesUrl}
Se désabonner : ${unsubscribeUrl}

© ${new Date().getFullYear()} ${domainName}. Tous droits réservés.
  `.trim();

  return { subject, html, text };
}

