/**
 * Welcome Email Template
 * Sent when a business owner registers
 */

import { getBaseUrl, getUnsubscribeUrl } from '../index';

export interface WelcomeEmailData {
  firstName?: string;
  email: string;
  unsubscribeToken: string;
}

export function getWelcomeEmailSubject(data: WelcomeEmailData): string {
  return `Bienvenue sur Haguenau.pro ${data.firstName ? `, ${data.firstName}` : ''}! 🎉`;
}

export function getWelcomeEmailHtml(data: WelcomeEmailData): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = getUnsubscribeUrl(data.unsubscribeToken);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Haguenau.pro</title>
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
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #3B82F6;
      margin-bottom: 10px;
    }
    h1 {
      color: #1F2937;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .cta-button {
      display: inline-block;
      background: #3B82F6;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .benefits {
      background: #F3F4F6;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .benefit-item {
      display: flex;
      align-items: start;
      margin-bottom: 12px;
    }
    .benefit-icon {
      color: #10B981;
      margin-right: 10px;
      font-size: 20px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 12px;
      color: #6B7280;
      text-align: center;
    }
    .footer a {
      color: #3B82F6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Haguenau.pro</div>
      <p style="color: #6B7280;">Votre annuaire professionnel local</p>
    </div>

    <h1>Bienvenue ${data.firstName ? data.firstName : ''}! 🎉</h1>

    <p>
      Merci d'avoir rejoint <strong>Haguenau.pro</strong>, la plateforme qui met en valeur
      les entreprises locales.
    </p>

    <p>
      Votre compte est maintenant actif et vous pouvez commencer à développer votre présence
      en ligne dès maintenant.
    </p>

    <div style="text-align: center;">
      <a href="${baseUrl}/business/dashboard" class="cta-button">
        Accéder à mon tableau de bord
      </a>
    </div>

    <div class="benefits">
      <h3 style="margin-top: 0;">Ce que vous pouvez faire maintenant:</h3>

      <div class="benefit-item">
        <span class="benefit-icon">✓</span>
        <div>
          <strong>Complétez votre profil</strong><br>
          Ajoutez vos horaires, photos et descriptions
        </div>
      </div>

      <div class="benefit-item">
        <span class="benefit-icon">✓</span>
        <div>
          <strong>Répondez aux avis</strong><br>
          Interagissez avec vos clients et améliorez votre réputation
        </div>
      </div>

      <div class="benefit-item">
        <span class="benefit-icon">✓</span>
        <div>
          <strong>Suivez vos statistiques</strong><br>
          Analysez vos visites, clics et performances
        </div>
      </div>

      <div class="benefit-item">
        <span class="benefit-icon">✓</span>
        <div>
          <strong>Créez des promotions</strong><br>
          Attirez plus de clients avec des offres spéciales
        </div>
      </div>
    </div>

    <h3>Besoin d'aide?</h3>
    <p>
      Notre équipe est là pour vous accompagner. Consultez notre
      <a href="${baseUrl}/docs/guides/BUSINESS_OWNER_GUIDE.md" style="color: #3B82F6;">guide complet</a>
      ou contactez-nous à <a href="mailto:support@haguenau.pro" style="color: #3B82F6;">support@haguenau.pro</a>.
    </p>

    <p style="margin-top: 30px;">
      <strong>Astuce:</strong> Les entreprises avec un profil complet reçoivent
      <strong>3x plus de visites</strong> que les profils incomplets. Prenez 5 minutes
      pour compléter le vôtre!
    </p>

    <div class="footer">
      <p>
        Vous recevez cet email car vous avez créé un compte sur Haguenau.pro.
      </p>
      <p>
        <a href="${baseUrl}/business/dashboard/settings">Gérer mes préférences</a> |
        <a href="${unsubscribeUrl}">Se désabonner</a>
      </p>
      <p>
        © ${new Date().getFullYear()} Haguenau.pro - Tous droits réservés
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getWelcomeEmailText(data: WelcomeEmailData): string {
  const baseUrl = getBaseUrl();

  return `
Bienvenue ${data.firstName ? data.firstName : ''}!

Merci d'avoir rejoint Haguenau.pro, la plateforme qui met en valeur les entreprises locales.

Votre compte est maintenant actif. Accédez à votre tableau de bord:
${baseUrl}/business/dashboard

Ce que vous pouvez faire maintenant:
- Complétez votre profil (photos, horaires, descriptions)
- Répondez aux avis clients
- Suivez vos statistiques
- Créez des promotions

Besoin d'aide? Contactez-nous: support@haguenau.pro

---
© ${new Date().getFullYear()} Haguenau.pro
  `.trim();
}
