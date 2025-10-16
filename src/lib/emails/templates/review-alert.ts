/**
 * Review Alert Email Template
 * Sent when a business receives a new review
 */

import { getBaseUrl, getUnsubscribeUrl } from '../index';

export interface ReviewAlertEmailData {
  businessOwnerName?: string;
  companyName: string;
  companySlug: string;
  reviewAuthor: string;
  reviewRating: number;
  reviewComment?: string;
  reviewDate: Date;
  reviewId: number;
  unsubscribeToken: string;
}

export function getReviewAlertEmailSubject(data: ReviewAlertEmailData): string {
  const stars = '⭐'.repeat(data.reviewRating);
  return `${stars} Nouvel avis pour ${data.companyName}`;
}

export function getReviewAlertEmailHtml(data: ReviewAlertEmailData): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = getUnsubscribeUrl(data.unsubscribeToken);
  const reviewUrl = `${baseUrl}/business/dashboard/reviews?highlight=${data.reviewId}`;
  const companyUrl = `${baseUrl}/companies/${data.companySlug}`;

  const isPositive = data.reviewRating >= 4;
  const isNegative = data.reviewRating <= 2;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvel avis</title>
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
    .review-card {
      background: ${isPositive ? '#F0FDF4' : isNegative ? '#FEF2F2' : '#F9FAFB'};
      border-left: 4px solid ${isPositive ? '#10B981' : isNegative ? '#EF4444' : '#6B7280'};
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .stars {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .author {
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 10px;
    }
    .comment {
      font-style: italic;
      color: #4B5563;
      line-height: 1.5;
      margin: 15px 0;
      padding: 15px;
      background: white;
      border-radius: 4px;
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
      text-align: center;
    }
    .cta-secondary {
      background: white;
      color: #3B82F6;
      border: 2px solid #3B82F6;
    }
    .tip {
      background: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .tip-icon {
      font-size: 18px;
      margin-right: 8px;
    }
    .stats {
      background: #F3F4F6;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      text-align: center;
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
    </div>

    <h1 style="color: #1F2937; margin-bottom: 10px;">
      ${isPositive ? '🎉 Excellent!' : isNegative ? '⚠️ Attention' : '📢 Nouvel avis'}
    </h1>

    <p style="font-size: 16px; color: #4B5563;">
      ${data.businessOwnerName ? `Bonjour ${data.businessOwnerName},` : 'Bonjour,'}
    </p>

    <p>
      <strong>${data.companyName}</strong> a reçu un nouvel avis sur Haguenau.pro:
    </p>

    <div class="review-card">
      <div class="stars">${'⭐'.repeat(data.reviewRating)}</div>

      <div class="author">
        Par <strong>${data.reviewAuthor}</strong>
        <span style="color: #6B7280; font-weight: normal; font-size: 14px;">
          • ${new Date(data.reviewDate).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>

      ${
        data.reviewComment
          ? `
        <div class="comment">
          "${data.reviewComment}"
        </div>
      `
          : ''
      }
    </div>

    <div style="text-align: center;">
      <a href="${reviewUrl}" class="cta-button">
        Répondre à cet avis
      </a>
    </div>

    ${
      isPositive
        ? `
    <div class="tip">
      <strong><span class="tip-icon">💡</span>Conseil:</strong>
      Remerciez vos clients satisfaits! Un simple "Merci" peut renforcer la fidélité
      et encourager d'autres avis positifs.
    </div>
    `
        : ''
    }

    ${
      isNegative
        ? `
    <div class="tip">
      <strong><span class="tip-icon">💡</span>Conseil:</strong>
      Répondez rapidement et avec empathie. Les entreprises qui gèrent bien les avis négatifs
      peuvent transformer un client insatisfait en client fidèle. Proposez une solution concrète.
    </div>
    `
        : ''
    }

    <div class="stats">
      <p style="margin: 0; color: #6B7280; font-size: 14px;">
        <strong>Le saviez-vous?</strong>
      </p>
      <p style="margin: 5px 0 0 0; font-size: 16px; color: #1F2937;">
        Les entreprises qui répondent aux avis obtiennent
        <strong style="color: #3B82F6;">40% plus de clients</strong>
      </p>
    </div>

    <p style="margin-top: 30px;">
      Vous pouvez également:
    </p>
    <ul>
      <li><a href="${reviewUrl}" style="color: #3B82F6;">Gérer tous vos avis</a></li>
      <li><a href="${companyUrl}" style="color: #3B82F6;">Voir votre profil public</a></li>
      <li><a href="${baseUrl}/business/dashboard/analytics" style="color: #3B82F6;">Consulter vos statistiques</a></li>
    </ul>

    <div class="footer">
      <p>
        Vous recevez cet email car vous avez activé les notifications d'avis.
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

export function getReviewAlertEmailText(data: ReviewAlertEmailData): string {
  const baseUrl = getBaseUrl();
  const reviewUrl = `${baseUrl}/business/dashboard/reviews?highlight=${data.reviewId}`;

  return `
Nouvel avis pour ${data.companyName}

Note: ${'⭐'.repeat(data.reviewRating)}
Par: ${data.reviewAuthor}
Date: ${new Date(data.reviewDate).toLocaleDateString('fr-FR')}

${data.reviewComment ? `Commentaire:\n"${data.reviewComment}"` : ''}

Répondez maintenant: ${reviewUrl}

Conseil: Les entreprises qui répondent aux avis obtiennent 40% plus de clients.

---
Gérer mes notifications: ${baseUrl}/business/dashboard/settings
© ${new Date().getFullYear()} Haguenau.pro
  `.trim();
}
