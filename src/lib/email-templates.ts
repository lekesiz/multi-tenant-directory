import { Resend } from 'resend';
import { logger } from '@/lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface LeadNotificationData {
  lead: {
    id: string;
    postalCode: string;
    phone: string;
    email?: string | null;
    note?: string | null;
    category?: {
      frenchName: string;
    } | null;
    createdAt: Date;
  };
  company: {
    id: number;
    name: string;
    email?: string;
  };
  assignment: {
    id: string;
    score: number;
    rank: number;
  };
}

/**
 * Lead bildirimi email'i gönderir
 */
export async function sendLeadNotificationEmail(
  companyEmail: string,
  leadData: LeadNotificationData
): Promise<boolean> {
  try {
    const { lead, company, assignment } = leadData;

    const emailContent = generateLeadNotificationEmail(leadData);
    
    const result = await resend.emails.send({
      from: 'Haguenau Pro <noreply@haguenau.pro>',
      to: [companyEmail],
      subject: `🎯 Nouveau prospect pour ${company.name} - Score: ${assignment.score}/100`,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (result.error) {
      logger.error('Failed to send lead notification email:', result.error);
      return false;
    }

    logger.info(`Lead notification email sent to ${companyEmail} for lead ${lead.id}`);
    return true;

  } catch (error) {
    logger.error('Error sending lead notification email:', error);
    return false;
  }
}

/**
 * Lead bildirimi email içeriği oluşturur
 */
function generateLeadNotificationEmail(data: LeadNotificationData) {
  const { lead, company, assignment } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouveau Prospect - ${company.name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .lead-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .score-badge { background: #4CAF50; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; display: inline-block; }
        .contact-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .cta-button { background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .urgency { background: #ffeb3b; padding: 10px; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Nouveau Prospect!</h1>
          <p>Un client potentiel vous attend</p>
        </div>
        
        <div class="content">
          <div class="lead-card">
            <h2>Détails du Prospect</h2>
            
            <div style="margin: 15px 0;">
              <strong>Catégorie:</strong> ${lead.category?.frenchName || 'Non spécifiée'}<br>
              <strong>Localisation:</strong> ${lead.postalCode}<br>
              <strong>Date de demande:</strong> ${new Date(lead.createdAt).toLocaleDateString('fr-FR')}
            </div>

            <div class="contact-info">
              <h3>📞 Informations de Contact</h3>
              <p><strong>Téléphone:</strong> ${lead.phone}</p>
              ${lead.email ? `<p><strong>Email:</strong> ${lead.email}</p>` : ''}
            </div>

            ${lead.note ? `
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>📝 Description du Projet</h3>
              <p>${lead.note}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 20px 0;">
              <span class="score-badge">Score de Correspondance: ${assignment.score}/100</span>
              <p style="margin-top: 10px; color: #666;">
                Vous êtes le ${assignment.rank}${assignment.rank === 1 ? 'er' : 'ème'} choix pour ce prospect
              </p>
            </div>

            <div class="urgency">
              <strong>⚡ Action Requise:</strong> Ce prospect a été envoyé à plusieurs entreprises. 
              Répondez rapidement pour maximiser vos chances!
            </div>

            <div style="text-align: center;">
              <a href="https://haguenau.pro/business/dashboard/leads" class="cta-button">
                Voir dans mon Dashboard
              </a>
            </div>
          </div>

          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>💡 Conseils pour Répondre</h3>
            <ul>
              <li>Répondez dans les 2 heures pour maximiser vos chances</li>
              <li>Soyez professionnel et précis dans votre réponse</li>
              <li>Proposez un devis détaillé si possible</li>
              <li>Mentionnez vos certifications et garanties</li>
            </ul>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>⚠️ Important:</strong> Ce prospect vous a été transmis dans le cadre de notre service de mise en relation. 
            Respectez les règles RGPD et ne contactez le client que pour ce projet spécifique.
          </div>
        </div>

        <div class="footer">
          <p>Cet email a été envoyé automatiquement par Haguenau Pro</p>
          <p>Si vous ne souhaitez plus recevoir ces notifications, vous pouvez modifier vos préférences dans votre dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
NOUVEAU PROSPECT POUR ${company.name.toUpperCase()}

Détails du Prospect:
- Catégorie: ${lead.category?.frenchName || 'Non spécifiée'}
- Localisation: ${lead.postalCode}
- Téléphone: ${lead.phone}
- Email: ${lead.email || 'Non fourni'}
- Date: ${new Date(lead.createdAt).toLocaleDateString('fr-FR')}

${lead.note ? `Description: ${lead.note}` : ''}

Score de Correspondance: ${assignment.score}/100
Rang: ${assignment.rank}${assignment.rank === 1 ? 'er' : 'ème'} choix

ACTION REQUISE: Répondez rapidement pour maximiser vos chances!

Dashboard: https://haguenau.pro/business/dashboard/leads

---
Haguenau Pro - Service de mise en relation professionnelle
  `;

  return { html, text };
}

/**
 * Lead kabul/red bildirimi email'i gönderir
 */
export async function sendLeadResponseNotificationEmail(
  leadEmail: string,
  companyName: string,
  response: 'accepted' | 'declined',
  message?: string
): Promise<boolean> {
  try {
    const subject = response === 'accepted' 
      ? `✅ ${companyName} a accepté votre demande`
      : `❌ ${companyName} n'a pas pu traiter votre demande`;

    const emailContent = generateLeadResponseEmail(companyName, response, message);
    
    const result = await resend.emails.send({
      from: 'Haguenau Pro <noreply@haguenau.pro>',
      to: [leadEmail],
      subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (result.error) {
      logger.error('Failed to send lead response notification email:', result.error);
      return false;
    }

    logger.info(`Lead response notification email sent to ${leadEmail}`);
    return true;

  } catch (error) {
    logger.error('Error sending lead response notification email:', error);
    return false;
  }
}

/**
 * Lead yanıt bildirimi email içeriği oluşturur
 */
function generateLeadResponseEmail(companyName: string, response: 'accepted' | 'declined', message?: string) {
  const isAccepted = response === 'accepted';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réponse à votre demande</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isAccepted ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isAccepted ? '✅ Demande Acceptée!' : '❌ Demande Non Traitée'}</h1>
          <p>${companyName}</p>
        </div>
        
        <div class="content">
          <div class="message-box">
            <h2>${isAccepted ? 'Excellente nouvelle!' : 'Désolé pour la déception'}</h2>
            
            <p>
              ${isAccepted 
                ? `L'entreprise <strong>${companyName}</strong> a accepté votre demande et devrait vous contacter prochainement.`
                : `L'entreprise <strong>${companyName}</strong> n'a pas pu traiter votre demande à ce moment.`
              }
            </p>

            ${message ? `
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Message de l'entreprise:</h3>
              <p>${message}</p>
            </div>
            ` : ''}

            ${isAccepted ? `
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📞 Prochaines Étapes</h3>
              <ul>
                <li>Attendez l'appel ou l'email de l'entreprise</li>
                <li>Préparez vos questions sur le projet</li>
                <li>Demandez un devis détaillé</li>
                <li>Vérifiez les certifications de l'entreprise</li>
              </ul>
            </div>
            ` : `
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>💡 Ne vous découragez pas!</h3>
              <p>Votre demande a été envoyée à plusieurs entreprises. D'autres réponses positives peuvent arriver.</p>
            </div>
            `}
          </div>
        </div>

        <div class="footer">
          <p>Cet email a été envoyé automatiquement par Haguenau Pro</p>
          <p>Pour toute question, contactez-nous à support@haguenau.pro</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
${isAccepted ? 'DEMANDE ACCEPTÉE!' : 'DEMANDE NON TRAITÉE'}

${companyName}

${isAccepted 
  ? `L'entreprise ${companyName} a accepté votre demande et devrait vous contacter prochainement.`
  : `L'entreprise ${companyName} n'a pas pu traiter votre demande à ce moment.`
}

${message ? `Message: ${message}` : ''}

---
Haguenau Pro - Service de mise en relation professionnelle
  `;

  return { html, text };
}