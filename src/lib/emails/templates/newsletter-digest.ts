/**
 * Newsletter Weekly Digest Email Template
 * Sent weekly with new businesses and highlights
 */

interface Company {
  id: number;
  name: string;
  slug: string;
  city?: string;
  categories: string[];
  rating?: number;
  reviewCount: number;
  logoUrl?: string;
  customDescription?: string;
}

interface NewsletterDigestEmailProps {
  firstName?: string;
  email: string;
  domainName: string;
  domainUrl: string;
  newCompanies: Company[];
  topRatedCompanies: Company[];
  weekNumber: number;
  year: number;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export function generateNewsletterDigestEmail({
  firstName,
  email,
  domainName,
  domainUrl,
  newCompanies,
  topRatedCompanies,
  weekNumber,
  year,
  unsubscribeUrl,
  preferencesUrl,
}: NewsletterDigestEmailProps): { subject: string; html: string; text: string } {
  const displayName = firstName || email.split('@')[0];
  const totalNew = newCompanies.length;

  const subject = `📬 Votre résumé hebdomadaire - Semaine ${weekNumber} | ${domainName}`;

  const renderCompanyCard = (company: Company) => `
    <div style="background-color: #ffffff; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 12px 0;">
      <div style="display: flex; align-items: flex-start;">
        ${company.logoUrl ? `
          <img src="${company.logoUrl}" alt="${company.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; margin-right: 16px;">
        ` : ''}
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1F2937;">
            <a href="${domainUrl}/${company.slug}" style="color: #1F2937; text-decoration: none;">
              ${company.name}
            </a>
          </h3>
          ${company.city ? `
            <p style="margin: 4px 0; font-size: 14px; color: #6B7280;">
              📍 ${company.city}
            </p>
          ` : ''}
          ${company.categories.length > 0 ? `
            <p style="margin: 4px 0; font-size: 14px; color: #6B7280;">
              ${company.categories.slice(0, 3).join(' • ')}
            </p>
          ` : ''}
          ${company.rating ? `
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #3B82F6;">
              ⭐ ${company.rating.toFixed(1)} (${company.reviewCount} avis)
            </p>
          ` : ''}
          ${company.customDescription ? `
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #4B5563; line-height: 1.5;">
              ${company.customDescription.substring(0, 150)}${company.customDescription.length > 150 ? '...' : ''}
            </p>
          ` : ''}
          <a href="${domainUrl}/${company.slug}" style="display: inline-block; margin-top: 12px; color: #3B82F6; text-decoration: none; font-size: 14px; font-weight: 600;">
            Voir plus →
          </a>
        </div>
      </div>
    </div>
  `;

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
    <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
        📬 Résumé Hebdomadaire
      </h1>
      <p style="color: #E0E7FF; margin: 8px 0 0 0; font-size: 14px;">
        Semaine ${weekNumber}, ${year}
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 30px 20px;">
      <h2 style="color: #1F2937; font-size: 20px; margin-top: 0;">
        Bonjour ${displayName},
      </h2>
      
      <p style="color: #4B5563; line-height: 1.6; margin: 16px 0;">
        Voici votre résumé hebdomadaire avec ${totalNew} nouvelle${totalNew > 1 ? 's' : ''} entreprise${totalNew > 1 ? 's' : ''} et les meilleures adresses de la semaine.
      </p>

      ${newCompanies.length > 0 ? `
        <!-- New Companies Section -->
        <div style="margin: 32px 0;">
          <h2 style="color: #1F2937; font-size: 20px; margin-bottom: 16px; border-bottom: 2px solid #3B82F6; padding-bottom: 8px;">
            ✨ Nouvelles Entreprises
          </h2>
          ${newCompanies.map(company => renderCompanyCard(company)).join('')}
        </div>
      ` : ''}

      ${topRatedCompanies.length > 0 ? `
        <!-- Top Rated Section -->
        <div style="margin: 32px 0;">
          <h2 style="color: #1F2937; font-size: 20px; margin-bottom: 16px; border-bottom: 2px solid #10B981; padding-bottom: 8px;">
            ⭐ Meilleures Notes
          </h2>
          ${topRatedCompanies.map(company => renderCompanyCard(company)).join('')}
        </div>
      ` : ''}

      <!-- CTA -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${domainUrl}" style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Découvrir toutes les entreprises
        </a>
      </div>

      <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 24px 0;">
        💡 <strong>Astuce :</strong> Vous pouvez laisser un avis sur vos établissements préférés pour aider la communauté !
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #F9FAFB; padding: 24px 20px; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="margin: 8px 0; font-size: 14px; color: #6B7280;">
        <strong>${domainName}</strong><br>
        Votre guide local de confiance
      </p>
      
      <div style="margin: 16px 0;">
        <a href="${domainUrl}" style="color: #3B82F6; text-decoration: none; font-size: 14px; margin: 0 8px;">Visiter le site</a>
        <span style="color: #9CA3AF;">•</span>
        <a href="${preferencesUrl}" style="color: #3B82F6; text-decoration: none; font-size: 14px; margin: 0 8px;">Préférences</a>
        <span style="color: #9CA3AF;">•</span>
        <a href="${unsubscribeUrl}" style="color: #3B82F6; text-decoration: none; font-size: 14px; margin: 0 8px;">Se désabonner</a>
      </div>

      <p style="font-size: 12px; color: #9CA3AF; margin-top: 16px;">
        © ${year} ${domainName}. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
📬 Résumé Hebdomadaire - Semaine ${weekNumber}, ${year}

Bonjour ${displayName},

Voici votre résumé hebdomadaire avec ${totalNew} nouvelle${totalNew > 1 ? 's' : ''} entreprise${totalNew > 1 ? 's' : ''} et les meilleures adresses de la semaine.

${newCompanies.length > 0 ? `
✨ NOUVELLES ENTREPRISES

${newCompanies.map(c => `
${c.name}
${c.city ? `📍 ${c.city}` : ''}
${c.categories.length > 0 ? c.categories.slice(0, 3).join(' • ') : ''}
${c.rating ? `⭐ ${c.rating.toFixed(1)} (${c.reviewCount} avis)` : ''}
${c.customDescription ? c.customDescription.substring(0, 150) + (c.customDescription.length > 150 ? '...' : '') : ''}
→ ${domainUrl}/${c.slug}
`).join('\n---\n')}
` : ''}

${topRatedCompanies.length > 0 ? `
⭐ MEILLEURES NOTES

${topRatedCompanies.map(c => `
${c.name}
${c.city ? `📍 ${c.city}` : ''}
${c.rating ? `⭐ ${c.rating.toFixed(1)} (${c.reviewCount} avis)` : ''}
→ ${domainUrl}/${c.slug}
`).join('\n---\n')}
` : ''}

Découvrir toutes les entreprises : ${domainUrl}

💡 Astuce : Vous pouvez laisser un avis sur vos établissements préférés pour aider la communauté !

---

${domainName}
Votre guide local de confiance

Visiter le site : ${domainUrl}
Gérer mes préférences : ${preferencesUrl}
Se désabonner : ${unsubscribeUrl}

© ${year} ${domainName}. Tous droits réservés.
  `.trim();

  return { subject, html, text };
}

