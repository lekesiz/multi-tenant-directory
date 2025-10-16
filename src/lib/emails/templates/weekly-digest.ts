/**
 * Weekly Digest Email Template
 * Sent every Monday with weekly stats
 */

import { getBaseUrl, getUnsubscribeUrl } from '../index';

export interface WeeklyDigestEmailData {
  businessOwnerName?: string;
  companyName: string;
  companySlug: string;
  weekStartDate: Date;
  weekEndDate: Date;
  stats: {
    profileViews: number;
    profileViewsChange: number; // percentage change from last week
    phoneClicks: number;
    phoneClicksChange: number;
    websiteClicks: number;
    websiteClicksChange: number;
    directionsClicks: number;
    directionsClicksChange: number;
    newReviews: number;
    averageRating: number;
    totalReviews: number;
  };
  topReview?: {
    author: string;
    rating: number;
    comment: string;
    date: Date;
  };
  unsubscribeToken: string;
}

export function getWeeklyDigestEmailSubject(data: WeeklyDigestEmailData): string {
  return `📊 Votre résumé hebdomadaire - ${data.companyName}`;
}

export function getWeeklyDigestEmailHtml(data: WeeklyDigestEmailData): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = getUnsubscribeUrl(data.unsubscribeToken);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    });

  const formatChange = (change: number) => {
    if (change === 0) return '<span style="color: #6B7280;">→ Stable</span>';
    const sign = change > 0 ? '+' : '';
    const color = change > 0 ? '#10B981' : '#EF4444';
    const arrow = change > 0 ? '↑' : '↓';
    return `<span style="color: ${color};">${arrow} ${sign}${change}%</span>`;
  };

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Résumé hebdomadaire</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
      font-size: 24px;
      font-weight: bold;
      color: #3B82F6;
    }
    .period {
      color: #6B7280;
      font-size: 14px;
      text-align: center;
      margin-bottom: 30px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 30px 0;
    }
    .stat-card {
      background: #F9FAFB;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #1F2937;
      margin: 10px 0;
    }
    .stat-label {
      font-size: 14px;
      color: #6B7280;
      margin-bottom: 5px;
    }
    .stat-change {
      font-size: 14px;
      margin-top: 5px;
    }
    .highlight-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      padding: 25px;
      margin: 30px 0;
      text-align: center;
    }
    .highlight-value {
      font-size: 48px;
      font-weight: bold;
      margin: 10px 0;
    }
    .review-card {
      background: #FEF3C7;
      border-left: 4px solid #F59E0B;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .stars {
      color: #F59E0B;
      font-size: 18px;
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
    .tips {
      background: #EFF6FF;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .tip-item {
      margin: 10px 0;
      padding-left: 25px;
      position: relative;
    }
    .tip-item::before {
      content: "💡";
      position: absolute;
      left: 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 12px;
      color: #6B7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Haguenau.pro</div>
      <h1 style="color: #1F2937; margin: 10px 0;">📊 Résumé hebdomadaire</h1>
    </div>

    <div class="period">
      ${formatDate(data.weekStartDate)} - ${formatDate(data.weekEndDate)}
    </div>

    <p style="font-size: 16px;">
      ${data.businessOwnerName ? `Bonjour ${data.businessOwnerName},` : 'Bonjour,'}
    </p>

    <p>
      Voici comment <strong>${data.companyName}</strong> s'est comporté cette semaine:
    </p>

    <!-- Highlight: Profile Views -->
    <div class="highlight-card">
      <div class="stat-label">Vues de votre profil</div>
      <div class="highlight-value">${data.stats.profileViews}</div>
      <div style="font-size: 14px; opacity: 0.9;">
        ${formatChange(data.stats.profileViewsChange).replace(/style="color: #([^"]+)"/, 'style="color: rgba(255,255,255,0.9)"')}
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Clics sur le téléphone</div>
        <div class="stat-value">${data.stats.phoneClicks}</div>
        <div class="stat-change">${formatChange(data.stats.phoneClicksChange)}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Clics sur le site web</div>
        <div class="stat-value">${data.stats.websiteClicks}</div>
        <div class="stat-change">${formatChange(data.stats.websiteClicksChange)}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Demandes d'itinéraire</div>
        <div class="stat-value">${data.stats.directionsClicks}</div>
        <div class="stat-change">${formatChange(data.stats.directionsClicksChange)}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Nouveaux avis</div>
        <div class="stat-value">${data.stats.newReviews}</div>
        <div class="stat-change">
          Note moyenne: ${data.stats.averageRating.toFixed(1)} ⭐
        </div>
      </div>
    </div>

    <!-- Top Review -->
    ${
      data.topReview
        ? `
    <h3 style="margin-top: 30px;">🌟 Avis de la semaine</h3>
    <div class="review-card">
      <div class="stars">${'⭐'.repeat(data.topReview.rating)}</div>
      <p style="font-style: italic; margin: 10px 0;">
        "${data.topReview.comment}"
      </p>
      <p style="font-size: 14px; color: #6B7280; margin: 5px 0;">
        — ${data.topReview.author}, ${formatDate(data.topReview.date)}
      </p>
    </div>
    `
        : ''
    }

    <!-- CTA -->
    <div style="text-align: center;">
      <a href="${baseUrl}/business/dashboard/analytics" class="cta-button">
        Voir le dashboard complet
      </a>
    </div>

    <!-- Tips -->
    <div class="tips">
      <h3 style="margin-top: 0;">💡 Conseils pour cette semaine</h3>

      ${
        data.stats.profileViewsChange < 0
          ? `
      <div class="tip-item">
        Vos vues sont en baisse. Partagez votre profil sur vos réseaux sociaux!
      </div>
      `
          : ''
      }

      ${
        data.stats.newReviews === 0
          ? `
      <div class="tip-item">
        Encouragez vos clients satisfaits à laisser un avis. Affichez un QR code en magasin!
      </div>
      `
          : ''
      }

      ${
        data.stats.phoneClicks > data.stats.websiteClicks * 2
          ? `
      <div class="tip-item">
        Beaucoup de clics téléphone! Assurez-vous de répondre rapidement aux appels.
      </div>
      `
          : ''
      }

      <div class="tip-item">
        Mettez à jour vos horaires et photos pour attirer plus de clients.
      </div>
    </div>

    <p style="margin-top: 30px; padding: 20px; background: #F3F4F6; border-radius: 6px; text-align: center;">
      <strong>Passez au plan PRO</strong> pour accéder à des analyses avancées,
      des réponses IA automatiques et bien plus!<br>
      <a href="${baseUrl}/pricing" style="color: #3B82F6;">Découvrir les plans</a>
    </p>

    <div class="footer">
      <p>
        Vous recevez ce résumé hebdomadaire le lundi matin.
      </p>
      <p>
        <a href="${baseUrl}/business/dashboard/settings">Gérer mes notifications</a> |
        <a href="${unsubscribeUrl}">Se désabonner</a>
      </p>
      <p>
        © ${new Date().getFullYear()} Haguenau.pro
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getWeeklyDigestEmailText(data: WeeklyDigestEmailData): string {
  const baseUrl = getBaseUrl();

  return `
Résumé hebdomadaire - ${data.companyName}

Vues du profil: ${data.stats.profileViews} (${data.stats.profileViewsChange > 0 ? '+' : ''}${data.stats.profileViewsChange}%)
Clics téléphone: ${data.stats.phoneClicks}
Clics site web: ${data.stats.websiteClicks}
Demandes d'itinéraire: ${data.stats.directionsClicks}
Nouveaux avis: ${data.stats.newReviews}
Note moyenne: ${data.stats.averageRating.toFixed(1)}⭐

${data.topReview ? `Meilleur avis:\n"${data.topReview.comment}"\n— ${data.topReview.author}` : ''}

Voir le dashboard: ${baseUrl}/business/dashboard/analytics

---
© ${new Date().getFullYear()} Haguenau.pro
  `.trim();
}
